import { PrismaClient } from "@prisma/client"
import { seedUsers } from "./seeders/users"
import { seedTaskTypes } from "./seeders/taskTypes"
import { seedRooms } from "./seeders/rooms"
import { seedConfig } from "./seeders/config"
import { seedColors } from "./seeders/colors"

const prisma = new PrismaClient()

async function main(): Promise<void> {
	await seedConfig(prisma)
	await seedColors(prisma)
	// await seedUsers(prisma)
	// await seedRooms(prisma)
	// await seedTaskTypes(prisma)
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