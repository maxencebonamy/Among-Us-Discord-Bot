import { z } from "zod"

export const PlayerKillSelectSchema = z.object({
	type: z.literal("playerKillSelect")
})