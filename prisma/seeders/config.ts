import type { PrismaClient } from "@prisma/client"

export const seedConfig = async(prisma: PrismaClient): Promise<void> => {
	console.log("Seeding config...")

	await prisma.config.deleteMany({})

	await prisma.config.createMany({
		data: [
			{
				key: "NB_PLAYERS",
				value: "10"
			},
			{
				key: "NB_TASKS_EASY",
				value: "4"
			},
			{
				key: "NB_TASKS_HARD",
				value: "2"
			}
		]
	})

	console.log("Seeding config completed ✅")
}