import type { Player, PlayerColor, User } from "@prisma/client"

export const formatPlayer = (player: Player & { user: User, color: PlayerColor }): string => {
	return `[${player.color.emoji} ${player.color.name.toUpperCase()}] **${player.user.name}**`
}

export const formatPlayerWithRole = (player: Player & { user: User, color: PlayerColor }): string => {
	return `${formatPlayer(player)} (${player.role === "IMPOSTOR" ? "🔪 Imposteur" : "👨‍🚀 Crewmate"})`
}