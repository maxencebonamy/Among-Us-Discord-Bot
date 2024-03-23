import * as z from "zod"
import * as imports from "../null"
import { PlayerRole } from "@prisma/client"
import { CompleteUser, RelatedUserSchema, CompleteGame, RelatedGameSchema, CompletePlayerColor, RelatedPlayerColorSchema, CompletePlayerTask, RelatedPlayerTaskSchema, CompletePlayerVote, RelatedPlayerVoteSchema, CompleteVote, RelatedVoteSchema } from "./index"

export const PlayerSchema = z.object({
  id: z.number().int(),
  role: z.nativeEnum(PlayerRole),
  alive: z.boolean(),
  channelId: z.string(),
  progressionMessageId: z.string().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
  userId: z.number().int(),
  gameId: z.number().int(),
  colorId: z.number().int(),
})

export interface CompletePlayer extends z.infer<typeof PlayerSchema> {
  user: CompleteUser
  game: CompleteGame
  color: CompletePlayerColor
  playerTask: CompletePlayerTask[]
  voteTargets: CompletePlayerVote[]
  voteAuthors: CompletePlayerVote[]
  votes: CompleteVote[]
}

/**
 * RelatedPlayerSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedPlayerSchema: z.ZodSchema<CompletePlayer> = z.lazy(() => PlayerSchema.extend({
  user: RelatedUserSchema,
  game: RelatedGameSchema,
  color: RelatedPlayerColorSchema,
  playerTask: RelatedPlayerTaskSchema.array(),
  voteTargets: RelatedPlayerVoteSchema.array(),
  voteAuthors: RelatedPlayerVoteSchema.array(),
  votes: RelatedVoteSchema.array(),
}))
