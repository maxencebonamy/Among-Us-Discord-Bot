import * as z from "zod"
import * as imports from "../null"

export const ConfigSchema = z.object({
  key: z.string(),
  value: z.string().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
