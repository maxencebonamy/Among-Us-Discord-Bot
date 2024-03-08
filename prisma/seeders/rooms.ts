import type { PrismaClient } from "@prisma/client"

const ROOMS = [
	"Admin",
	"Stockage",
	"Salle hantée",
	"Centre de contrôle",
	"Jungle",
	"Couloir du haut",
	"Retro Gaming",
	"Couloir du bas",
	"Bureau",
	"Salle de jeu",
	"Réfectoire"
] as const

export type Room = typeof ROOMS[number]

export const seedRooms = async(prisma: PrismaClient): Promise<void> => {
	console.log("Seeding rooms...")

	await prisma.room.deleteMany({})

	await Promise.all(
		ROOMS.map(async(name) => {
			await prisma.room.create({ data: { name } })
		})
	)

	console.log("Seeding rooms completed ✅")
}