import * as z from "zod"
import * as imports from "../null"

export const PlayerColorSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  hex: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
