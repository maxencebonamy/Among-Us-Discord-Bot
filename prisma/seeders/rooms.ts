import type { PrismaClient } from "@prisma/client"

const ROOMS = [
	"Hôpital",
	"Stockage",
	"Salle hantée",
	"Centre de contrôle",
	"Jungle",
	"Pont supérieur",
	"Retro Gaming",
	"Pont inférieur",
	"Bureau de l'inspecteur",
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