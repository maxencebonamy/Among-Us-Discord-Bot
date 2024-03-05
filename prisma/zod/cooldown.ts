import * as z from "zod"
import * as imports from "../null"
import { CooldownType } from "@prisma/client"
import { CompletePlayerCooldown, RelatedPlayerCooldownSchema } from "./index"

export const CooldownSchema = z.object({
  id: z.number().int(),
  type: z.nativeEnum(CooldownType),
  expiresAt: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export interface CompleteCooldown extends z.infer<typeof CooldownSchema> {
  playerCooldown: CompletePlayerCooldown[]
}

/**
 * RelatedCooldownSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedCooldownSchema: z.ZodSchema<CompleteCooldown> = z.lazy(() => CooldownSchema.extend({
  playerCooldown: RelatedPlayerCooldownSchema.array(),
}))
