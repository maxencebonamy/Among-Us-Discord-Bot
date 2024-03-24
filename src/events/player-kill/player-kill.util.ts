import { z } from "zod"

export const PlayerKillSchema = z.object({
	type: z.literal("playerKill")
})