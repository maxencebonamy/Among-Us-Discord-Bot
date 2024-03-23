import * as z from "zod"
import * as imports from "../null"
import { CompleteGame, RelatedGameSchema, CompletePlayer, RelatedPlayerSchema, CompletePlayerVote, RelatedPlayerVoteSchema } from "./index"

export const VoteSchema = z.object({
  id: z.number().int(),
  finished: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  gameId: z.number().int(),
  eliminatedPlayerId: z.number().int().nullish(),
})

export interface CompleteVote extends z.infer<typeof VoteSchema> {
  game: CompleteGame
  eliminatedPlayer?: CompletePlayer | null
  playerVotes: CompletePlayerVote[]
}

/**
 * RelatedVoteSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedVoteSchema: z.ZodSchema<CompleteVote> = z.lazy(() => VoteSchema.extend({
  game: RelatedGameSchema,
  eliminatedPlayer: RelatedPlayerSchema.nullish(),
  playerVotes: RelatedPlayerVoteSchema.array(),
}))
