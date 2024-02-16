import type { PrismaClient } from "@prisma/client"
import { faker } from "@faker-js/faker"

const dicordIds: string[] = [
	"218443354369687555",
	"231797373775380490",
	"299258851763421186",
	"332145376629096449",
	"406464433188110346",
	"681186927365324883"
]

export const seedUsers = async(prisma: PrismaClient): Promise<void> => {
	console.log("Seeding users...")

	await prisma.user.deleteMany({})

	for (const id of dicordIds) {
		await prisma.user.upsert({
			where: {
				discordId: id
			},
			update: {},
			create: {
				discordId: id,
				name: faker.person.fullName()
			}
		})
	}

	console.log("Seeding users completed ✅")
}