import { z } from "zod"

export const CompleteTaskSchema = z.object({
	type: z.literal("completeTask"),
	playerTaskId: z.number()
})