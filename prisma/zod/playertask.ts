import * as z from "zod"
import * as imports from "../null"
import { CompletePlayer, RelatedPlayerSchema, CompleteTask, RelatedTaskSchema } from "./index"

export const PlayerTaskSchema = z.object({
  id: z.number().int(),
  done: z.boolean(),
  playerMessageId: z.string().nullish(),
  modoMessageId: z.string().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
  playerId: z.number().int(),
  taskId: z.number().int(),
})

export interface CompletePlayerTask extends z.infer<typeof PlayerTaskSchema> {
  player: CompletePlayer
  task: CompleteTask
}

/**
 * RelatedPlayerTaskSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedPlayerTaskSchema: z.ZodSchema<CompletePlayerTask> = z.lazy(() => PlayerTaskSchema.extend({
  player: RelatedPlayerSchema,
  task: RelatedTaskSchema,
}))
