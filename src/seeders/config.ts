import { db } from "@/lib/db"

export const addDiscordRoles = async(): Promise<void> => {

	await db.config.create({
		data: {
			key: "player-role",
			value: "Joueur"
		}
	})
}

export const addValue = async(key: string, value: string): Promise<void> => {
	await db.config.create({
		data: {
			key,
			value
		}
	})
}