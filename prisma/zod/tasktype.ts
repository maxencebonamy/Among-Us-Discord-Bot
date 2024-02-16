import * as z from "zod"
import * as imports from "../null"
import { TaskLevel } from "@prisma/client"
import { CompleteTask, RelatedTaskSchema } from "./index"

export const TaskTypeSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  description: z.string().nullish(),
  level: z.nativeEnum(TaskLevel),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export interface CompleteTaskType extends z.infer<typeof TaskTypeSchema> {
  tasks: CompleteTask[]
}

/**
 * RelatedTaskTypeSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedTaskTypeSchema: z.ZodSchema<CompleteTaskType> = z.lazy(() => TaskTypeSchema.extend({
  tasks: RelatedTaskSchema.array(),
}))
