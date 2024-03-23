import type { EventExecute, EventName } from "@/utils/handler/event"
import { logger } from "@/utils/logger"

export const enableInDev = true

export const event: EventName = "interactionCreate"

export const execute: EventExecute<typeof event> = async(interaction) => {
	// if (!interaction.isMessageComponent()) return

	// logger.info(`Interaction: ${interaction.customId}`)
	// await interaction.message.delete()
}