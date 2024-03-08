import * as z from "zod"
import * as imports from "../null"
import { CompleteRoom, RelatedRoomSchema, CompleteTask, RelatedTaskSchema } from "./index"

export const RoomTaskSchema = z.object({
  createdAt: z.date(),
  updatedAt: z.date(),
  roomId: z.number().int(),
  taskId: z.number().int(),
})

export interface CompleteRoomTask extends z.infer<typeof RoomTaskSchema> {
  room: CompleteRoom
  task: CompleteTask
}

/**
 * RelatedRoomTaskSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedRoomTaskSchema: z.ZodSchema<CompleteRoomTask> = z.lazy(() => RoomTaskSchema.extend({
  room: RelatedRoomSchema,
  task: RelatedTaskSchema,
}))
