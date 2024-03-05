import type { CacheType, ChatInputCommandInteraction } from "discord.js"
import { createErrorEmbed } from "./components/embed"

export const replyError = async(command: ChatInputCommandInteraction<CacheType>, content: string): Promise<void> => {
	await command.reply({
		embeds: [createErrorEmbed({ content })],
		ephemeral: true
	})
}