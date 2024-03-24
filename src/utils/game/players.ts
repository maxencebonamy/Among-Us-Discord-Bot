import { prisma } from "@/lib/db"
import type { Player, PlayerColor, User } from "@prisma/client"
import { ButtonStyle, ChannelType } from "discord.js"
import { logger } from "../logger"
import { client } from "@/client"
import { getGuild } from "@/configs/guild"
import { createCustomEmbed } from "../discord/components/embed"
import { createRow } from "../discord/components/row"
import { createButton } from "../discord/components/button"

export const formatPlayer = (player: Player & { user: User, color: PlayerColor }): string => {
	return `[${player.color.emoji} ${player.color.name.toUpperCase()}] ${player.user.name}`
}

export const formatPlayerWithRole = (player: Player & { user: User, color: PlayerColor }): string => {
	return `${formatPlayer(player)} (${player.role === "IMPOSTOR" ? "🔪 Imposteur" : "👨‍🚀 Crewmate"})`
}

export const dispatchTasks = async(deadPlayer: Player & { user: User, color: PlayerColor }): Promise<void> => {
	// Récupérer le serveur
	const guild = await getGuild(client, "main")

	// Vérifier si le joueur est imposteur
	if (deadPlayer.role === "IMPOSTOR") return

	// Récupérer toutes les tasks
	const allTasks = await prisma.playerTask.findMany({
		where: { player: { gameId: deadPlayer.gameId } },
		include: { task: true }
	})

	// Récupérer les tasks du joueur
	const deadPlayerTasks = allTasks.filter(playerTask => playerTask.playerId === deadPlayer.id)

	// Récupérer les joueurs en vie
	const alivePlayers = await prisma.player.findMany({
		where: { id: { not: deadPlayer.id }, alive: true, gameId: deadPlayer.gameId, role: "CREWMATE" },
		include: { user: true, color: true }
	})

	// Compter les scores des tasks restantes de chaque joueur (1 pt pour task EASY, 2 pts pour task HARD)
	const scores = alivePlayers.map(player => {
		const playerTasks = allTasks.filter(playerTask => playerTask.playerId === player.id)
		const score = playerTasks.reduce((acc, playerTask) => {
			return acc + (playerTask.task.level === "EASY" ? 1 : 2)
		}, 0)
		return { player, score }
	})

	// Récupérer le channel de tasks du joueur mort
	const deadPlayerTasksChannel = await guild.channels.fetch(deadPlayer.channelId).catch(() => null)
	if (!deadPlayerTasksChannel || deadPlayerTasksChannel.type !== ChannelType.GuildText) {
		logger.error("Impossible de récupérer le channel de tasks du joueur mort.")
		return
	}

	for (const deadPlayerTask of deadPlayerTasks) {
		// Trier les scores par ordre croissant
		scores.sort((a, b) => a.score - b.score)
		// Récupérer le joueur avec le score le plus bas
		const lowestScorePlayer = scores[0].player

		// Modifier la task du joueur mort pour la donner au joueur avec le score le plus bas
		await prisma.playerTask.update({
			where: { id: deadPlayerTask.id },
			data: { playerId: lowestScorePlayer.id }
		})

		// Modifier le score du joueur avec la nouvelle task
		scores[0].score += deadPlayerTask.task.level === "EASY" ? 1 : 2

		// Modifier les messages dans les channels des joueurs
		const taskMessage = await deadPlayerTasksChannel.messages.fetch(deadPlayerTask.playerMessageId ?? "").catch(() => null)
		if (!taskMessage) {
			logger.error("Impossible de récupérer le message de task.")
			continue
		}
		const newPlayerChannel = await guild.channels.fetch(lowestScorePlayer.channelId).catch(() => null)
		if (!newPlayerChannel || newPlayerChannel.type !== ChannelType.GuildText) {
			logger.error("Impossible de récupérer le channel du nouveau joueur.")
			continue
		}
		const newTaskMessage = await newPlayerChannel.send({ embeds: taskMessage.embeds })
		await taskMessage.delete()
		await prisma.playerTask.update({
			where: { id: deadPlayerTask.id },
			data: { playerMessageId: newTaskMessage.id }
		})

		// Modifier le message dans les channels des modos
		const modoChannel = await guild.channels.fetch(deadPlayerTask.task.channelId ?? "").catch(() => null)
		if (!modoChannel || modoChannel.type !== ChannelType.GuildText) {
			logger.error("Impossible de récupérer le channel du modo.")
			continue
		}
		const modoMessage = await modoChannel.messages.fetch(deadPlayerTask.modoMessageId ?? "").catch(() => null)
		if (!modoMessage) {
			logger.error("Impossible de récupérer le message du modo.")
			continue
		}
		await modoMessage.edit({
			embeds: [createCustomEmbed({
				title: formatPlayer(lowestScorePlayer),
				content: ""
			})],
			components: [createRow(createButton({
				id: JSON.stringify({ type: "completeTask", playerId: lowestScorePlayer.id, taskId: deadPlayerTask.taskId }),
				label: "OK",
				style: ButtonStyle.Success
			}))]
		})
	}
}