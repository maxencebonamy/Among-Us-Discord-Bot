import * as z from "zod"
import * as imports from "../null"

export const RoomSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
