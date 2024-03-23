import * as z from "zod"
import * as imports from "../null"
import { CompletePlayer, RelatedPlayerSchema, CompleteVote, RelatedVoteSchema } from "./index"

export const PlayerVoteSchema = z.object({
  id: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date(),
  authorId: z.number().int(),
  targetId: z.number().int().nullish(),
  voteId: z.number().int(),
})

export interface CompletePlayerVote extends z.infer<typeof PlayerVoteSchema> {
  author: CompletePlayer
  target?: CompletePlayer | null
  vote: CompleteVote
}

/**
 * RelatedPlayerVoteSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedPlayerVoteSchema: z.ZodSchema<CompletePlayerVote> = z.lazy(() => PlayerVoteSchema.extend({
  author: RelatedPlayerSchema,
  target: RelatedPlayerSchema.nullish(),
  vote: RelatedVoteSchema,
}))
