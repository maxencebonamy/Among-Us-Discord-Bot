import type { PlayerVote } from "@prisma/client"
import { z } from "zod"

export const PlayerVoteSchema = z.object({
	type: z.literal("playerVote"),
	voteId: z.number()
})