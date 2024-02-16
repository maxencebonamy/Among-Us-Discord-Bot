import { faker } from "@faker-js/faker"
import type { PrismaClient, TaskLevel } from "@prisma/client"

const NB_TASK_TYPES = 20

const levels: TaskLevel[] = [
	"EASY",
	"MEDIUM",
	"HARD"
]

export const seedTaskTypes = async(prisma: PrismaClient): Promise<void> => {
	console.log("Seeding taskTypes...")

	await prisma.taskType.deleteMany({})

	for (let i = 0; i < NB_TASK_TYPES; i++) {
		await prisma.taskType.create({
			data: {
				name: faker.lorem.sentence(),
				description: faker.lorem.sentences(2),
				level: levels[Math.floor(Math.random() * levels.length)]
			}
		})
	}

	console.log("Seeding taskTypes completed ✅")
}