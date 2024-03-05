import { getGuild, guilds } from "@/configs/guild"
import { prisma } from "@/lib/db"
import { createCustomEmbed } from "@/utils/discord/components/embed"
import { getGuildMembers } from "@/utils/discord/guild"
import { isAdmin } from "@/utils/discord/roles"
import type { CommandExecute } from "@/utils/handler/command"
import { createPlayersSelectMenu } from "./init.util"
import { replyError } from "@/utils/discord/command"
import { ChannelType, type GuildMember, type StringSelectMenuInteraction } from "discord.js"
import { createRow } from "@/utils/discord/components/row"
import { createCancelButton, createOkButton } from "@/utils/discord/components/button"
import { PlayerRole } from "@prisma/client"
import { log } from "@/utils/discord/channels"
import { colors } from "@/utils/game/colors"

export const execute: CommandExecute = async(command) => {
	// Vérifier si l'utilisateur est un administrateur
	if (!await isAdmin(command.member)) {
		await replyError(command, "Vous n'avez pas la permission d'utiliser cette commande.")
		return
	}

	// Récupérer les membres du serveur qui ont le rôle "player" (et qui ne sont pas des bots)
	const guild = await getGuild(command.client, "main")
	const members = await getGuildMembers(guild)
	const players = members?.filter(member => !member.user.bot && member.roles.cache.has(guilds.main.roles.player))
	if (!players) {
		await replyError(command, "Aucun joueur n'a été trouvé.")
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
	if (players.size < nbPlayers) {
		await replyError(command, `Il n'y a pas assez de joueurs pour lancer une partie (au moins ${nbPlayers}).`)
		return
	}

	// Créer le menu de sélection des joueurs
	const selectionResponse = await command.reply({
		embeds: [createCustomEmbed({
			title: "🙋 Sélection des joueurs",
			content: `Sélectionnez les joueurs qui participeront à la partie (${nbPlayers} joueurs).`
		})],
		components: [createPlayersSelectMenu(players, nbPlayers)],
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
	await confirmationResponse.awaitMessageComponent({
		filter: interaction => interaction.customId === "ok" || interaction.customId === "cancel",
		time: 300_000  // 5 min
	}).then(async interaction => {
		if (interaction.customId === "ok") {
			await command.editReply({
				embeds: [createCustomEmbed({
					title: "🎮 Création de la partie",
					content: "La partie va être créée."
				})],
				components: []
			})
		} else {
			await command.editReply({
				embeds: [createCustomEmbed({
					title: "🎮 Création de la partie",
					content: "La partie n'a pas été créée."
				})],
				components: []
			})
		}
	})

	// Créer la partie
	const game = await prisma.game.create({
		data: {
			status: "WAITING"
		}
	})

	// Création d'un channel par joueur
	const playersCategory = guild.channels.cache.get(guilds.main.channels.playersCategory)
	if (!playersCategory) {
		await replyError(command, "La catégorie des joueurs n'a pas été trouvée.")
		return
	}
	let index = 0
	for (const player of selectedMembers) {
		const color = await prisma.playerColor.findFirst({
			where: { name: colors[index].name }
		})
		if (!color) continue

		const playerChannel = await guild.channels.create({
			name: `${color.emoji}｜${player.displayName}`,
			type: ChannelType.GuildText,
			parent: playersCategory.id
		})
		await playerChannel.permissionOverwrites.edit(player.id, {
			ReadMessageHistory: true,
			SendMessages: true,
			ViewChannel: true
		})

		const user = await prisma.user.findUnique({ where: { discordId: player.id } })
		if (!user) continue

		await prisma.player.createMany({
			data: {
				gameId: game.id,
				userId: user.id,
				role: PlayerRole.CREWMATE,
				channelId: playerChannel.id,
				colorId: color.id
			}
		})

		index++
	}

	// Log
	const commandUser = await prisma.user.findUnique({ where: { discordId: command.user.id } })
	await log("🎮 Création d'une partie", `La partie #${game.id} a été créée par ${commandUser?.name ?? "?"}.`)
}