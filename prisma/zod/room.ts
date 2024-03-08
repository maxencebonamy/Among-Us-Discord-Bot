import * as z from "zod"
import * as imports from "../null"
import { CompleteRoomTask, RelatedRoomTaskSchema } from "./index"

export const RoomSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  channelId: z.string().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export interface CompleteRoom extends z.infer<typeof RoomSchema> {
  roomTask: CompleteRoomTask[]
}

/**
 * RelatedRoomSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedRoomSchema: z.ZodSchema<CompleteRoom> = z.lazy(() => RoomSchema.extend({
  roomTask: RelatedRoomTaskSchema.array(),
}))
