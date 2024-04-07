import { prisma } from "@/lib/db"
import { replyError } from "@/utils/discord/command"
import { createCustomEmbed } from "@/utils/discord/components/embed"
import { isAdmin } from "@/utils/discord/roles"
import type { CommandExecute } from "@/utils/handler/command"
import { ButtonStyle, ChannelType } from "discord.js"
import { getIntConfig } from "./start.util"
import { formatPlayer } from "@/utils/game/players"
import { PlayerRole, TaskLevel } from "@prisma/client"
import { shuffle } from "@/utils/function/random"
import { createRow } from "@/utils/discord/components/row"
import { createButton } from "@/utils/discord/components/button"
import { assignTasks } from "@/utils/game/tasks"

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

	// Envoyer les descriptions des tasks dans chaque channel de task
	const tasks = await prisma.task.findMany({})
	await Promise.all(tasks.map(async task => {
		const channel = await command.guild?.channels.fetch(task.channelId ?? "")
		if (!channel || channel.type !== ChannelType.GuildText) return

		await channel.send({
			embeds: [createCustomEmbed({
				title: `${task.emoji} ${task.name} (${task.level === TaskLevel.EASY ? "🟢 Facile" : "🔴 Difficile"})`,
				content: task.modoDescription
			})]
		}).then(async message => message.pin())
	}))

	// Attribution des tasks
	const players = await prisma.player.findMany({
		where: { gameId: game.id },
		include: { user: true, color: true }
	})
	const assignedTasks = assignTasks(tasks, players, nbTasksEasy, nbTasksHard)
	await Promise.all(players.map(async player => {
		const tasksToAssign = assignedTasks[player.id]

		await Promise.all(tasksToAssign.map(async task => {
			const channel = await command.guild?.channels.fetch(task.channelId ?? "")
			if (!channel || channel.type !== ChannelType.GuildText) return

			const playerTask = await prisma.playerTask.create({
				data: {
					playerId: player.id,
					taskId: task.id
				}
			})

			const message = await channel.send({
				embeds: [createCustomEmbed({
					title: formatPlayer(player),
					content: ""
				})],
				components: [createRow(createButton({
					id: JSON.stringify({ type: "completeTask", playerTaskId: playerTask.id }),
					label: "OK",
					style: ButtonStyle.Success
				}))]
			})

			await prisma.playerTask.update({
				where: { id: playerTask.id },
				data: { modoMessageId: message.id }
			})
		}))
	}))

	// Répondre
	await command.editReply({
		embeds: [createCustomEmbed({
			title: "🎮 Préparation de la partie",
			content: "La partie a été préparée."
		})]
	})
}