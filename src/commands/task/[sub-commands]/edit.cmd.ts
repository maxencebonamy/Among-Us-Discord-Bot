import type { CommandExecute } from "@/utils/handler/command"

export const execute: CommandExecute = async(command) => {
	await command.reply({
		content: "Liste des tasks"
	})
}