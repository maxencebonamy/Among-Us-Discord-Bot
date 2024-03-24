import { z } from "zod"

export const PlayerReportSchema = z.object({
	type: z.literal("playerReport")
})

export const PlayerReportModalSchema = z.object({
	type: z.literal("playerReportModal")
})