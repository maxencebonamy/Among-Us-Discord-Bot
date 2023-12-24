import { z } from "zod"

export const envDTO = z.object({
	BOT_TOKEN: z.string().min(1)
})