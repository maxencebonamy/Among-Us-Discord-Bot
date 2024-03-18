import { prisma } from "@/lib/db"
import { log } from "@/utils/discord/channels"
import { replyError } from "@/utils/discord/command"
import { createCustomEmbed } from "@/utils/discord/components/embed"
import { isAdmin } from "@/utils/discord/roles"
import type { CommandExecute } from "@/utils/handler/command"
import { ChannelType } from "discord.js"
import { texts } from "./start.util"
import { formatPlayer } from "@/utils/game/players"
import { PlayerRole } from "@prisma/client"

export const execute: CommandExecute = async(command) => {
	// Vérifier si l'utilisateur est un administrateur
	if (!await isAdmin(command.member)) {
		await replyError(command, "Vous n'avez pas la permission d'utiliser cette commande.")
		return
	}

	// Vérifier si une partie en attente existe
	const game = await prisma.game.findFirst({ where: { status: { in: ["WAITING"] } } })
	if (!game) {
		await replyError(command, "Aucune partie est en attente.")
		return
	}

	// Lancer la partie
	await prisma.game.update({
		where: {
			id: game.id
		},
		data: {
			status: "RUNNING"
		}
	})

	// Envoyer un message dans chaque salon de joueur
	await command.guild?.channels.fetch()
	const players = await prisma.player.findMany({
		where: { gameId: game.id },
		include: { user: true, color: true }
	})
	await Promise.all(players.map(async(player) => {
		const playerChannel = command.guild?.channels.cache.get(player.channelId)
		if (!playerChannel || playerChannel.type !== ChannelType.GuildText) return

		let content = texts[player.role].replace("[color]", `${player.color.emoji} ${player.color.name.toUpperCase()}`)
		if (player.role === PlayerRole.IMPOSTOR) {
			const impostor = players.find(p => p.id !== player.id && p.role === PlayerRole.IMPOSTOR)
			console.log(impostor)
			if (!impostor) return
			content = content.replace("[impostor]", formatPlayer(impostor))
		}

		await playerChannel.send({
			embeds: [createCustomEmbed({
				title: "🎮 Début de la partie",
				content
			})]
		})

		// Tasks
		await prisma.playerTask.findMany(
			{ where: { playerId: player.id }, include: { task: true } }
		).then(async(playerTasks) => {
			await Promise.all(playerTasks.map(async(playerTask) => {
				const taskChannel = command.guild?.channels.cache.get(playerTask.task.channelId ?? "")
				if (!taskChannel || taskChannel.type !== ChannelType.GuildText) return

				await playerChannel.send({
					embeds: [createCustomEmbed({
						title: `${playerTask.task.emoji} ${playerTask.task.name}`,
						content: playerTask.task.description
					})]
				})
			}))
		})
	}))

	// Répondre
	await command.reply({
		embeds: [createCustomEmbed({
			title: "🎮 Lancement de la partie",
			content: "La partie a été lancée."
		})],
		ephemeral: true
	})

	// Log
	const commandUser = await prisma.user.findUnique({ where: { discordId: command.user.id } })
	await log("🎮 Partie lancée", `La partie #${game.id} a été lancée par ${commandUser?.name ?? "?"}.`)
}