import { PrismaClient } from "@prisma/client"
import { seedTasks } from "./seeders/tasks"
import { seedRooms } from "./seeders/rooms"
import { seedConfig } from "./seeders/config"
import { seedColors } from "./seeders/colors"

const prisma = new PrismaClient()

async function main(): Promise<void> {
	await seedConfig(prisma)
	await seedColors(prisma)
	await seedRooms(prisma)
	await seedTasks(prisma)
}

main()
	.then(async() => {
		await prisma.$disconnect()
	})
	.catch(async(e) => {
		console.error(e)
		await prisma.$disconnect()
		process.exit(1)
	})