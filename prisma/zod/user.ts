import * as z from "zod"
import * as imports from "../null"
import { CompletePlayer, RelatedPlayerSchema, CompleteModo, RelatedModoSchema } from "./index"

export const UserSchema = z.object({
  id: z.number().int(),
  discordId: z.string(),
  name: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export interface CompleteUser extends z.infer<typeof UserSchema> {
  player: CompletePlayer[]
  modo: CompleteModo[]
}

/**
 * RelatedUserSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedUserSchema: z.ZodSchema<CompleteUser> = z.lazy(() => UserSchema.extend({
  player: RelatedPlayerSchema.array(),
  modo: RelatedModoSchema.array(),
}))
