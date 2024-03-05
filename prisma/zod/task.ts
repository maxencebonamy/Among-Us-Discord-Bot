import * as z from "zod"
import * as imports from "../null"
import { TaskLevel } from "@prisma/client"
import { CompletePlayerTask, RelatedPlayerTaskSchema } from "./index"

export const TaskSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  description: z.string(),
  level: z.nativeEnum(TaskLevel),
  channelId: z.string().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export interface CompleteTask extends z.infer<typeof TaskSchema> {
  playerTask: CompletePlayerTask[]
}

/**
 * RelatedTaskSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedTaskSchema: z.ZodSchema<CompleteTask> = z.lazy(() => TaskSchema.extend({
  playerTask: RelatedPlayerTaskSchema.array(),
}))
