import { faker } from "@faker-js/faker"
import type { PrismaClient } from "@prisma/client"

const NB_ROOMS = 12

export const seedRooms = async(prisma: PrismaClient): Promise<void> => {
	console.log("Seeding rooms...")

	await prisma.room.deleteMany({})

	for (let i = 0; i < NB_ROOMS; i++) {
		await prisma.room.create({
			data: {
				name: faker.location.city()
			}
		})
	}

	console.log("Seeding rooms completed ✅")
}