import { getGuild, guilds } from "@/configs/guild"
import { prisma } from "@/lib/db"
import { createCustomEmbed } from "@/utils/discord/components/embed"
import { getGuildMembers } from "@/utils/discord/guild"
import { isAdmin } from "@/utils/discord/roles"
import type { CommandExecute } from "@/utils/handler/command"
import { createChannel, createPlayersSelectMenu } from "./init.util"
import { replyError } from "@/utils/discord/command"
import type { GuildMember, StringSelectMenuInteraction } from "discord.js"
import { createRow } from "@/utils/discord/components/row"
import { createCancelButton, createOkButton } from "@/utils/discord/components/button"
import { PlayerRole } from "@prisma/client"
import { log } from "@/utils/discord/channels"

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
					title: "🙋 Sélection des joueurs",
					content: "La partie va être lancée."
				})],
				components: []
			})
		} else {
			await command.editReply({
				embeds: [createCustomEmbed({
					title: "🙋 Sélection des joueurs",
					content: "La partie n'a pas été lancée."
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

	// Ajouter les joueurs à la partie
	const selectedPlayers = []
	for (const player of selectedMembers) {
		const user = await prisma.user.findUnique({ where: { discordId: player.id } })
		if (!user) {
			continue
		}

		selectedPlayers.push({
			gameId: game.id,
			userId: user.id,
			role: PlayerRole.CREWMATE
		})
	}
	await prisma.player.createMany({
		data: selectedPlayers
	})

	// Log
	const commandUser = await prisma.user.findUnique({ where: { discordId: command.user.id } })
	await log("🎮 Création d'une partie", `La partie #${game.id} a été créée par ${commandUser?.name ?? "?"}.`)
}