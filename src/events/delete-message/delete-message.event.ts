import type { EventExecute, EventName } from "@/utils/handler/event"
import { DeleteMessageSchema } from "./delete-message.util"

export const enableInDev = true

export const event: EventName = "interactionCreate"

export const execute: EventExecute<"interactionCreate"> = async(interaction) => {
	// Vérifier si l'interaction est une suppression de message
	if (!interaction.isMessageComponent()) return
	let parsedCustomId = null
	try {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		parsedCustomId = JSON.parse(interaction.customId)
	} catch (error) {
		return
	}
	const customId = DeleteMessageSchema.safeParse(parsedCustomId)
	if (!customId.success) return

	// Supprimer le message
	await interaction.message.delete()
}