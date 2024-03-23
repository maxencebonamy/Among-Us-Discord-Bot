import { prisma } from "@/lib/db"
import { log } from "@/utils/discord/channels"
import { replyError } from "@/utils/discord/command"
import { createCustomEmbed } from "@/utils/discord/components/embed"
import { isAdmin } from "@/utils/discord/roles"
import type { CommandExecute } from "@/utils/handler/command"
import { ChannelType } from "discord.js"
import { getIntConfig, texts } from "./start.util"
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

	await command.deferReply({ ephemeral: true })

	// Récupérer la variables de configuration pour le nombre de tasks faciles
	const nbTasksEasy = await getIntConfig("NB_TASKS_EASY")
	if (!nbTasksEasy) {
		await replyError(command, "La variable de configuration \"NB_TASKS_EASY\" n'a pas été trouvée.")
		return
	}

	// Récupérer la variables de configuration pour le nombre de tasks difficiles
	const nbTasksHard = await getIntConfig("NB_TASKS_HARD")
	if (!nbTasksHard) {
		await replyError(command, "La variable de configuration \"NB_TASKS_HARD\" n'a pas été trouvée.")
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

	// Attribution des tasks
	const players = await prisma.player.findMany({
		where: { gameId: game.id },
		include: { user: true, color: true }
	})
	const allPlayerTasks = await prisma.playerTask.findMany({ include: { task: true } })

	// Envoyer un message dans chaque salon de joueur
	await Promise.all(players.map(async(player) => {
		const playerChannel = await command.guild?.channels.fetch(player.channelId)
		if (!playerChannel || playerChannel.type !== ChannelType.GuildText) return

		let content = texts[player.role].replace("[color]", `${player.color.emoji} ${player.color.name.toUpperCase()}`)
		if (player.role === PlayerRole.IMPOSTOR) {
			const impostor = players.find(p => p.id !== player.id && p.role === PlayerRole.IMPOSTOR)
			if (!impostor) return
			content = content.replace("[impostor]", formatPlayer(impostor))
		}

		await playerChannel.send({
			embeds: [createCustomEmbed({
				title: "🎮 Début de la partie",
				content
			})]
		}).then(async message => message.pin())

		const progressionMessage = await playerChannel.send({
			embeds: [createCustomEmbed({
				title: "📈 Progression de la partie",
				content: "0/0 tasks réalisées\n⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛ **0%**"
			})]
		})
		await prisma.player.update({
			where: { id: player.id },
			data: { progressionMessageId: progressionMessage.id }
		})

		// Tasks
		const playerTasks = allPlayerTasks.filter(task => task.playerId === player.id)
		await Promise.all(playerTasks.map(async(playerTask) => {
			const message = await playerChannel.send({
				embeds: [createCustomEmbed({
					title: `${playerTask.task.emoji} ${playerTask.task.name}`,
					content: playerTask.task.description
				})]
			})
			await prisma.playerTask.update({
				where: {
					// eslint-disable-next-line camelcase
					playerId_taskId: {
						playerId: player.id,
						taskId: playerTask.taskId
					}
				},
				data: { playerMessageId: message.id }
			})
		}))
	}))

	// Répondre
	await command.editReply({
		embeds: [createCustomEmbed({
			title: "🎮 Lancement de la partie",
			content: "La partie a été lancée."
		})]
	})

	// Log
	const commandUser = await prisma.user.findUnique({ where: { discordId: command.user.id } })
	await log("🎮 Partie lancée", `La partie #${game.id} a été lancée par ${commandUser?.name ?? "?"}.`)
}