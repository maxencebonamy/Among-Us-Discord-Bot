import type { Player, PlayerColor, User } from "@prisma/client"

export const formatPlayer = (player: Player & { user: User, color: PlayerColor }): string => {
	return `${player.color.emoji} ${player.user.name}`
}