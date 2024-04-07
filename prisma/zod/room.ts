import * as z from "zod"
import * as imports from "../null"
import { CompleteTask, RelatedTaskSchema } from "./index"

export const RoomSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  channelId: z.string().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export interface CompleteRoom extends z.infer<typeof RoomSchema> {
  tasks: CompleteTask[]
  validationTasks: CompleteTask[]
}

/**
 * RelatedRoomSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedRoomSchema: z.ZodSchema<CompleteRoom> = z.lazy(() => RoomSchema.extend({
  tasks: RelatedTaskSchema.array(),
  validationTasks: RelatedTaskSchema.array(),
}))
