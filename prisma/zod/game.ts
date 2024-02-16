import * as z from "zod"
import * as imports from "../null"
import { GameStatus } from "@prisma/client"
import { CompleteTask, RelatedTaskSchema, CompletePlayer, RelatedPlayerSchema, CompleteModo, RelatedModoSchema } from "./index"

export const GameSchema = z.object({
  id: z.number().int(),
  status: z.nativeEnum(GameStatus),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export interface CompleteGame extends z.infer<typeof GameSchema> {
  tasks: CompleteTask[]
  players: CompletePlayer[]
  modos: CompleteModo[]
}

/**
 * RelatedGameSchema contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedGameSchema: z.ZodSchema<CompleteGame> = z.lazy(() => GameSchema.extend({
  tasks: RelatedTaskSchema.array(),
  players: RelatedPlayerSchema.array(),
  modos: RelatedModoSchema.array(),
}))
