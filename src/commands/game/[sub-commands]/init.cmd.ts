import { getGuild, guilds } from "@/configs/guild"
import { prisma } from "@/lib/db"
import { createCustomEmbed } from "@/utils/discord/components/embed"
import { getGuildMembers } from "@/utils/discord/guild"
import { isAdmin } from "@/utils/discord/roles"
import type { CommandExecute } from "@/utils/handler/command"
import { createPlayersAndChannels, createPlayersSelectMenu, drawRandomImpostors } from "./init.util"
import { editReplyEmbed, getCommandUser, replyError } from "@/utils/discord/command"
import { ButtonStyle, ChannelType, type GuildMember, type StringSelectMenuInteraction } from "discord.js"
import { createRow } from "@/utils/discord/components/row"
import { createButton, createCancelButton, createOkButton } from "@/utils/discord/components/button"
import { PlayerRole } from "@prisma/client"
import { log } from "@/utils/discord/channels"
import { formatPlayerWithRole } from "@/utils/game/players"

export const execute: CommandExecute = async(command) => {
	// Vérifier si l'utilisateur est un administrateur
	if (!await isAdmin(command.member)) {
		await replyError(command, "Vous n'avez pas la permission d'utiliser cette commande.")
		return
	}

	// Vérifier si une partie en attente ou en cours existe
	if (await prisma.game.findFirst({ where: { status: { in: ["WAITING", "RUNNING", "PAUSED"] } } })) {
		await replyError(command, "Une partie est déjà en attente ou en cours.")
		return
	}

	// Récupérer les membres du serveur qui ont le rôle "player" (et qui ne sont pas des bots)
	const guild = await getGuild(command.client, "main")
	const members = await getGuildMembers(guild)
	const playerMembers = members?.filter(member => !member.user.bot && member.roles.cache.has(guilds.main.roles.player))
	if (!playerMembers) {
		await replyError(command, "Aucun joueur n'a été trouvé.")
		return
	}

	// Récupérer le channel admin
	const adminChannel = await guild.channels.fetch(guilds.main.channels.admins)
	if (!adminChannel || adminChannel.type !== ChannelType.GuildText) {
		await replyError(command, "Le channel admin n'a pas été trouvé.")
		return
	}

	// Récupérer la variables de configuration pour le nombre de joueurs
	const nbPlayersConfig = await prisma.config.findUnique({ where: { key: "NB_PLAYERS" } })
	if (!nbPlayersConfig || !nbPlayersConfig.value) {
		await replyError(command, "La variable de configuration \"NB_PLAYERS\" n'a pas été trouvée.")
		return
	}
	const nbPlayers = Number.parseInt(nbPlayersConfig.value)

	// Vérifier si le nombre de joueurs est suffisant
	if (playerMembers.size < nbPlayers) {
		await replyError(command, `Il n'y a pas assez de joueurs pour lancer une partie (au moins ${nbPlayers}).`)
		return
	}

	// Créer le menu de sélection des joueurs
	const selectionResponse = await command.reply({
		embeds: [createCustomEmbed({
			title: "🙋 Sélection des joueurs",
			content: `Sélectionnez les joueurs qui participeront à la partie (${nbPlayers} joueurs).`
		})],
		components: [createPlayersSelectMenu(playerMembers, nbPlayers)],
		ephemeral: true
	})

	// Attendre la sélection des joueurs
	let selectedMembers: GuildMember[] = []
	await selectionResponse.awaitMessageComponent({
		filter: interaction => interaction.customId === "players",
		time: 300_000  // 5 min
	}).then(interaction => {
		interaction = interaction as StringSelectMenuInteraction
		selectedMembers = interaction.values.map(value => interaction.guild?.members.cache.get(value))
			.filter(member => member !== undefined) as GuildMember[]
	})

	// Vérifier si le nombre de joueurs sélectionnés est suffisant
	if (selectedMembers.length < nbPlayers) {
		await replyError(command, `Il n'y a pas assez de joueurs sélectionnés pour lancer une partie (${nbPlayers} joueurs).`)
		return
	}

	// Créer le message de confirmation
	const confirmationResponse = await command.editReply({
		embeds: [createCustomEmbed({
			title: "🙋 Sélection des joueurs",
			content: `Les joueurs sélectionnés sont :\n${
				selectedMembers.map(player => `- ${player?.displayName}`).join("\n")
			}`
		})],
		components: [createRow(createOkButton(), createCancelButton())]
	})

	// Attendre la confirmation
	let confirmation = true
	await confirmationResponse.awaitMessageComponent({
		filter: interaction => interaction.customId === "ok" || interaction.customId === "cancel",
		time: 300_000  // 5 min
	}).then(async interaction => {
		if (interaction.customId === "ok") {
			await editReplyEmbed(command, "🎮 Création de la partie", "La partie va être créée.")
		} else {
			confirmation = false
			await editReplyEmbed(command, "🎮 Création de la partie", "La partie n'a pas été créée.")
		}
	})
	if (!confirmation) return

	// Créer la partie
	const game = await prisma.game.create({ data: { status: "WAITING" } })

	// Création d'un channel par joueur
	const playersCategory = guild.channels.cache.get(guilds.main.channels.playersCategory)
	if (!playersCategory) {
		await replyError(command, "La catégorie des joueurs n'a pas été trouvée.")
		return
	}
	await createPlayersAndChannels(game, guild, playersCategory, selectedMembers)

	// Sélection des imposteurs
	let impostors = drawRandomImpostors(selectedMembers)
	let redraw = true
	while (redraw) {
		const impostorsResponse = await command.editReply({
			embeds: [createCustomEmbed({
				title: "🎭 Sélection des imposteurs",
				content: `Les imposteurs sélectionnés sont :\n${
					impostors.map(player => `- ${player?.displayName}`).join("\n")
				}`
			})],
			components: [createRow(createOkButton(), createButton({ id: "redraw", label: "Refaire", style: ButtonStyle.Secondary }))]
		})

		await impostorsResponse.awaitMessageComponent({
			filter: interaction => interaction.customId === "ok" || interaction.customId === "redraw",
			time: 300_000  // 5 min
		}).then(interaction => {
			if (interaction.customId !== "ok")  {
				impostors = drawRandomImpostors(selectedMembers)
			} else {
				redraw = false
			}
		})
	}
	for (const impostor of impostors) {
		const user = await prisma.user.findUnique({ where: { discordId: impostor.id } })
		if (!user) return

		const player = await prisma.player.findFirst({ where: { userId: user.id, gameId: game.id } })
		if (!player) return

		await prisma.player.update({
			where: { id: player.id },
			data: { role: PlayerRole.IMPOSTOR }
		})
	}

	// Réponse
	await command.editReply({
		embeds: [createCustomEmbed({
			title: "🎮 Création de la partie",
			content: "La partie a été créée."
		})],
		components: []
	})

	// Log
	const commandUser = await getCommandUser(command)
	await log("🎮 Création d'une partie", `La partie #${game.id} a été créée par ${commandUser?.name ?? "?"}.`)

	// Message admin
	const players = await prisma.player.findMany({ where: { gameId: game.id }, include: { user: true, color: true } })
	const content = `Les joueurs sélectionnés sont :\n${
		players.map(player => `- ${formatPlayerWithRole(player)}`).join("\n")
	}`

	await adminChannel.send({
		embeds: [createCustomEmbed({
			title: "🎮 Une partie a été créée",
			content
		})]
	})
}