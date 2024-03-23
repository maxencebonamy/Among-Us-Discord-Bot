import { z } from "zod"

export const CompleteTaskSchema = z.object({
	type: z.literal("completeTask"),
	playerId: z.number(),
	taskId: z.number()
})