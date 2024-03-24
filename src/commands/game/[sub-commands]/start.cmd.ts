import { prisma } from "@/lib/db"
import { log } from "@/utils/discord/channels"
import { replyError } from "@/utils/discord/command"
import { createCustomEmbed } from "@/utils/discord/components/embed"
import { isAdmin } from "@/utils/discord/roles"
import type { CommandExecute } from "@/utils/handler/command"
import { ButtonStyle, ChannelType } from "discord.js"
import { getIntConfig, texts } from "./start.util"
import { formatPlayer } from "@/utils/game/players"
import { PlayerRole } from "@prisma/client"
import { createButton } from "@/utils/discord/components/button"
import { createRow } from "@/utils/discord/components/row"
import { guilds } from "@/configs/guild"

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

	// Récupérer la variable de configuration pour le nombre de tasks faciles
	const nbTasksEasy = await getIntConfig("NB_TASKS_EASY")
	if (!nbTasksEasy) {
		await replyError(command, "La variable de configuration \"NB_TASKS_EASY\" n'a pas été trouvée.")
		return
	}

	// Récupérer la variable de configuration pour le nombre de tasks difficiles
	const nbTasksHard = await getIntConfig("NB_TASKS_HARD")
	if (!nbTasksHard) {
		await replyError(command, "La variable de configuration \"NB_TASKS_HARD\" n'a pas été trouvée.")
		return
	}

	// Récupérer la variable de configuration pour le cooldown de kill
	const killCooldown = await getIntConfig("KILL_COOLDOWN")
	if (!killCooldown) {
		await replyError(command, "La variable de configuration \"KILL_COOLDOWN\" n'a pas été trouvée.")
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
	const allPlayerTasks = await prisma.playerTask.findMany({
		where: { player: { gameId: game.id } },
		include: { task: { include: { room: true } } }
	})

	// Boutons
	const killButton = createButton({
		id: JSON.stringify({ type: "playerKill" }),
		label: "🔪 Tuer un joueur",
		style: ButtonStyle.Danger
	})
	const reportButton = createButton({
		id: JSON.stringify({ type: "playerReport" }),
		label: "💀 Signaler un cadavre",
		style: ButtonStyle.Primary
	})

	// Envoyer un message dans chaque salon de joueur
	await Promise.all(players.map(async(player) => {
		const playerChannel = await command.guild?.channels.fetch(player.channelId)
		if (!playerChannel || playerChannel.type !== ChannelType.GuildText) return

		let content = texts[player.role].replace("[color]", `${player.color.emoji} ${player.color.name.toUpperCase()}`)
		if (player.role === PlayerRole.IMPOSTOR) {
			const impostor = players.find(p => p.id !== player.id && p.role === PlayerRole.IMPOSTOR)
			if (!impostor) return
			content = content.replace("[impostor]", formatPlayer(impostor))

			await prisma.player.update({
				where: { id: player.id },
				data: { cooldown: new Date(Date.now() + killCooldown * 1000) }
			})
		}

		await playerChannel.send({
			embeds: [createCustomEmbed({
				title: "🎮 Début de la partie",
				content
			})]
		}).then(async message => message.pin())

		const actionMessage = await playerChannel.send({
			embeds: [createCustomEmbed({
				title: "🎮 Actions",
				content: "Que souhaitez-vous faire ?"
			})],
			components: player.role === PlayerRole.IMPOSTOR ? [createRow(killButton, reportButton)] : [createRow(reportButton)]
		})
		const progressionMessage = await playerChannel.send({
			embeds: [createCustomEmbed({
				title: "📈 Progression de la partie",
				content: `0/${allPlayerTasks.length} tasks réalisées\n⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛ **0%**`
			})]
		})
		await prisma.player.update({
			where: { id: player.id },
			data: {
				actionMessageId: actionMessage.id,
				progressionMessageId: progressionMessage.id
			}
		})

		// Tasks
		const playerTasks = allPlayerTasks.filter(task => task.playerId === player.id)
		await Promise.all(playerTasks.map(async(playerTask) => {
			let description = playerTask.task.playerDescription
			if (description.includes("[color]")) {
				description = description.replace("[color]", `${player.color.emoji} ${player.color.name.toUpperCase()}`)
			}
			if (description.includes("[number")) {
				description = description.replace("[number]", (Math.floor(Math.random() * 100) + 1).toString())
			}
			const message = await playerChannel.send({
				embeds: [createCustomEmbed({
					title: `${playerTask.task.emoji} ${playerTask.task.name}`,
					content: `${description}\n\n*Salle: ${playerTask.task.room.name}*`
				})]
			})
			await prisma.playerTask.update({
				where: { id: playerTask.id },
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

	// Message dans le channel des modos
	const modosChannel = await command.guild?.channels.fetch(guilds.main.channels.modos).catch(() => null)
	if (!modosChannel || modosChannel.type !== ChannelType.GuildText) return
	await modosChannel.send({
		embeds: [createCustomEmbed({
			title: "🎮 Partie lancée",
			content: "La partie a commencé !"
		})]
	})
}