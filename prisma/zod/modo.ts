import * as z from "zod"
import * as imports from "../null"
import { CompleteUser, RelatedUserSchema, CompleteGame, RelatedGameSchema, CompleteTask, RelatedTaskSchema } from "./index"

export const ModoSchema = z.object({
  admin: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  userId: z.number().int(),
  gameId: z.number().int(),
})

export interface CompleteModo extends z.infer<typeof ModoSchema> {
  user: CompleteUser
  game: CompleteGame
  tasks: CompleteTask[]
}

/**
 * RelatedModoSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedModoSchema: z.ZodSchema<CompleteModo> = z.lazy(() => ModoSchema.extend({
  user: RelatedUserSchema,
  game: RelatedGameSchema,
  tasks: RelatedTaskSchema.array(),
}))
