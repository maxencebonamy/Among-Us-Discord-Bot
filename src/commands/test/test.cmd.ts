import { prisma } from "@/lib/db"
import { createCustomEmbed } from "@/utils/discord/components/embed"
import type { CommandExecute } from "@/utils/handler/command"

export const execute: CommandExecute = async(command) => {
	// Envoyer le message
	await command.reply({
		embeds: [createCustomEmbed({
			title: "Test",
			content: "**Test**\n# 1234\n"
		})],
		ephemeral: true
	})
}