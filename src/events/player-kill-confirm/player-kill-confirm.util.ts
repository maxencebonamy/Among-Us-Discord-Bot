import { z } from "zod"

export const PlayerKillConfirmSchema = z.object({
	type: z.literal("playerKillConfirm"),
	playerId: z.number()
})