import { TaskLevel, type Player, type Task } from "@prisma/client"
import { shuffle } from "../function/random"

export const assignTasks = (tasks: Task[], players: Player[], nbEasyTasks: number, nbHardTasks: number): Record<number, Task[]> => {
	const easyTasks = shuffle(tasks.filter(task => task.level === TaskLevel.EASY))
	const hardTasks = shuffle(tasks.filter(task => task.level === TaskLevel.HARD))

	const assignedTasks = tasks.reduce((acc, task) => {
		acc[task.id] = 0
		return acc
	}, {} as Record<number, number>)

	return players.reduce((acc, player) => {
		const playerTasks: Task[] = []
		for (let i = 0; i < nbEasyTasks; i++) {
			const task = easyTasks.filter(task => !playerTasks.includes(task)).sort((a, b) => assignedTasks[a.id] - assignedTasks[b.id])[0]
			assignedTasks[task.id]++
			playerTasks.push(task)
		}
		for (let i = 0; i < nbHardTasks; i++) {
			const task = hardTasks.filter(task => !playerTasks.includes(task)).sort((a, b) => assignedTasks[a.id] - assignedTasks[b.id])[0]
			assignedTasks[task.id]++
			playerTasks.push(task)
		}
		acc[player.id] = playerTasks
		return acc
	}, {} as Record<number, Task[]>)
}