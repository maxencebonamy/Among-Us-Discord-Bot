import * as z from "zod"
import * as imports from "../null"
import { GameStatus } from "@prisma/client"
import { CompletePlayer, RelatedPlayerSchema, CompleteVote, RelatedVoteSchema } from "./index"

export const GameSchema = z.object({
  id: z.number().int(),
  status: z.nativeEnum(GameStatus),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export interface CompleteGame extends z.infer<typeof GameSchema> {
  players: CompletePlayer[]
  vote: CompleteVote[]
}

/**
 * RelatedGameSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedGameSchema: z.ZodSchema<CompleteGame> = z.lazy(() => GameSchema.extend({
  players: RelatedPlayerSchema.array(),
  vote: RelatedVoteSchema.array(),
}))
