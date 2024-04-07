import { prisma } from "@/lib/db"
import { createCustomEmbed } from "@/utils/discord/components/embed"
import type { CommandExecute } from "@/utils/handler/command"
import { getIntConfig } from "../game/[sub-commands]/init.util"
import { replyError } from "@/utils/discord/command"
import { assignTasks } from "@/utils/game/tasks"

export const execute: CommandExecute = async(command) => {
	const players = await prisma.player.findMany({
		where: { gameId: 2 },
		include: { user: true, color: true }
	})

	const tasks = await prisma.task.findMany({})

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

	const assignedTasks = assignTasks(tasks, players, nbTasksEasy, nbTasksHard)
	const tasksNumbers = tasks.reduce((acc, task) => {
		acc[task.id] = 0
		return acc
	}, {} as Record<number, number>)

	for (const player of players) {
		const tasksToAssign = assignedTasks[player.id]
		for (const task of tasksToAssign) {
			tasksNumbers[task.id]++
		}
		const easyTasks = tasksToAssign.filter(task => task.level === "EASY")
		const hardTasks = tasksToAssign.filter(task => task.level === "HARD")
		console.log(`${player.user.name} (${player.color.name}): ${easyTasks.length} tasks faciles et ${hardTasks.length} tasks difficiles`)
	}

	for (const task of tasks) {
		console.log(`${task.name} (${task.level}): ${tasksNumbers[task.id]}`)
	}
}