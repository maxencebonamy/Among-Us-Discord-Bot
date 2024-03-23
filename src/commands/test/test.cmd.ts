import { createOkButton } from "@/utils/discord/components/button"
import { createCustomEmbed } from "@/utils/discord/components/embed"
import { createRow } from "@/utils/discord/components/row"
import type { CommandExecute } from "@/utils/handler/command"

export const execute: CommandExecute = async(command) => {
	// await Promise.all(Array(10).fill(0).map(async(_, i) => {
	// 	await command.channel?.send({
	// 		embeds: [createCustomEmbed({
	// 			title: `Test ${i + 1}`,
	// 			content: "Test"
	// 		})],
	// 		components: [
	// 			createRow(createOkButton())
	// 		]
	// 	})
	// }))
}