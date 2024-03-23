import { z } from "zod"

export const DeleteMessageSchema = z.object({
	type: z.literal("deleteMessage")
})