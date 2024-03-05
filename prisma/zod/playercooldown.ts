import * as z from "zod"
import * as imports from "../null"
import { CompletePlayer, RelatedPlayerSchema, CompleteCooldown, RelatedCooldownSchema } from "./index"

export const PlayerCooldownSchema = z.object({
  createdAt: z.date(),
  updatedAt: z.date(),
  playerId: z.number().int(),
  cooldownId: z.number().int(),
})

export interface CompletePlayerCooldown extends z.infer<typeof PlayerCooldownSchema> {
  player: CompletePlayer
  cooldown: CompleteCooldown
}

/**
 * RelatedPlayerCooldownSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedPlayerCooldownSchema: z.ZodSchema<CompletePlayerCooldown> = z.lazy(() => PlayerCooldownSchema.extend({
  player: RelatedPlayerSchema,
  cooldown: RelatedCooldownSchema,
}))
