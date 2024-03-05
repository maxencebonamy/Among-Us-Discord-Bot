import * as z from "zod"
import * as imports from "../null"
import { PlayerRole } from "@prisma/client"
import { CompleteUser, RelatedUserSchema, CompleteGame, RelatedGameSchema, CompletePlayerTask, RelatedPlayerTaskSchema, CompletePlayerCooldown, RelatedPlayerCooldownSchema } from "./index"

export const PlayerSchema = z.object({
  id: z.number().int(),
  role: z.nativeEnum(PlayerRole),
  alive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  userId: z.number().int(),
  gameId: z.number().int(),
})

export interface CompletePlayer extends z.infer<typeof PlayerSchema> {
  user: CompleteUser
  game: CompleteGame
  playerTask: CompletePlayerTask[]
  playerCooldown: CompletePlayerCooldown[]
}

/**
 * RelatedPlayerSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedPlayerSchema: z.ZodSchema<CompletePlayer> = z.lazy(() => PlayerSchema.extend({
  user: RelatedUserSchema,
  game: RelatedGameSchema,
  playerTask: RelatedPlayerTaskSchema.array(),
  playerCooldown: RelatedPlayerCooldownSchema.array(),
}))
