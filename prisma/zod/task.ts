import * as z from "zod"
import * as imports from "../null"
import { TaskLevel } from "@prisma/client"
import { CompleteRoom, RelatedRoomSchema, CompletePlayerTask, RelatedPlayerTaskSchema } from "./index"

export const TaskSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  playerDescription: z.string(),
  modoDescription: z.string(),
  level: z.nativeEnum(TaskLevel),
  channelId: z.string().nullish(),
  emoji: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  roomId: z.number().int(),
  validationRoomId: z.number().int(),
})

export interface CompleteTask extends z.infer<typeof TaskSchema> {
  room: CompleteRoom
  validationRoom: CompleteRoom
  playerTask: CompletePlayerTask[]
}

/**
 * RelatedTaskSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedTaskSchema: z.ZodSchema<CompleteTask> = z.lazy(() => TaskSchema.extend({
  room: RelatedRoomSchema,
  validationRoom: RelatedRoomSchema,
  playerTask: RelatedPlayerTaskSchema.array(),
}))
