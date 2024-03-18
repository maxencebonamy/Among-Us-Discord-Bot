import * as z from "zod"
import * as imports from "../null"
import { CompletePlayer, RelatedPlayerSchema } from "./index"

export const PlayerColorSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  hex: z.string(),
  emoji: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export interface CompletePlayerColor extends z.infer<typeof PlayerColorSchema> {
  player: CompletePlayer[]
}

/**
 * RelatedPlayerColorSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedPlayerColorSchema: z.ZodSchema<CompletePlayerColor> = z.lazy(() => PlayerColorSchema.extend({
  player: RelatedPlayerSchema.array(),
}))
