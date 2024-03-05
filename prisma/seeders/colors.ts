import { colors } from "../../src/utils/game/colors"
import type { PrismaClient } from "@prisma/client"

export const seedColors = async(prisma: PrismaClient): Promise<void> => {
	console.log("Seeding colors...")

	await prisma.playerColor.deleteMany({})

	for (const color of colors) {
		await prisma.playerColor.create({
			data: {
				name: color.name,
				hex: color.hex,
				emoji: color.emoji
			}
		})
	}

	console.log("Seeding colors completed ✅")
}