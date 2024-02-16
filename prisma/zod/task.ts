import * as z from "zod"
import * as imports from "../null"
import { CompleteGame, RelatedGameSchema, CompletePlayer, RelatedPlayerSchema, CompleteModo, RelatedModoSchema, CompleteTaskType, RelatedTaskTypeSchema, CompleteTaskParameter, RelatedTaskParameterSchema } from "./index"

export const TaskSchema = z.object({
  id: z.number().int(),
  done: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  gameId: z.number().int(),
  playerId: z.number().int(),
  modoId: z.number().int(),
  taskTypeId: z.number().int(),
})

export interface CompleteTask extends z.infer<typeof TaskSchema> {
  game: CompleteGame
  player: CompletePlayer
  modo: CompleteModo
  type: CompleteTaskType
  parameters: CompleteTaskParameter[]
}

/**
 * RelatedTaskSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedTaskSchema: z.ZodSchema<CompleteTask> = z.lazy(() => TaskSchema.extend({
  game: RelatedGameSchema,
  player: RelatedPlayerSchema,
  modo: RelatedModoSchema,
  type: RelatedTaskTypeSchema,
  parameters: RelatedTaskParameterSchema.array(),
}))
