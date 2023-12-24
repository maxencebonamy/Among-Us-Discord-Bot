import type { User } from "discord.js"

/**
 * For displaying in logs.
 * @returns username (ID)
 */
export const userWithId = (user: User): string => {
	return `${user.tag} (${user.id})`
}