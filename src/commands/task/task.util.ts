import { prisma } from "@/lib/db"
import type { Task, TaskLevel } from "@prisma/client"
import { TaskSchema } from "prisma/zod"

export const findById = async(id: number): Promise<Task | null> => {
	return await prisma.task.findUnique({
		where: {
			id
		}
	})
}

export const formatLevel = (level: TaskLevel): string => {
	switch (level) {
	case "EASY":
		return "🟢 Facile"
	case "MEDIUM":
		return "🟡 Moyen"
	case "HARD":
		return "🔴 Difficile"
	}
}

export const SimpleTaskTypeSchema = TaskSchema.pick({
	name: true,
	description: true,
	level: true
})