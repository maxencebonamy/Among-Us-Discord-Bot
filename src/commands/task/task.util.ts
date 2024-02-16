import { prisma } from "@/lib/db"
import type { TaskLevel, TaskType } from "@prisma/client"
import { TaskTypeSchema } from "prisma/zod"

export const findById = async(id: number): Promise<TaskType | null> => {
	return await prisma.taskType.findUnique({
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

export const SimpleTaskTypeSchema = TaskTypeSchema.omit({
	id: true,
	createdAt: true,
	updatedAt: true
})