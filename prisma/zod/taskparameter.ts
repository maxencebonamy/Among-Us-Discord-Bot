import * as z from "zod"
import * as imports from "../null"
import { CompleteTask, RelatedTaskSchema } from "./index"

export const TaskParameterSchema = z.object({
  key: z.string(),
  value: z.string().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
  taskId: z.number().int(),
})

export interface CompleteTaskParameter extends z.infer<typeof TaskParameterSchema> {
  task: CompleteTask
}

/**
 * RelatedTaskParameterSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedTaskParameterSchema: z.ZodSchema<CompleteTaskParameter> = z.lazy(() => TaskParameterSchema.extend({
  task: RelatedTaskSchema,
}))
