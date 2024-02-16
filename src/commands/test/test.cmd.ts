import type { CommandExecute } from "@/utils/handler/command"

export const execute: CommandExecute = async(command) => {
	let response = "Membres :\n"

	await command.guild?.members.fetch().then(members => {
		members.forEach(member => {
			response += `- ${member.user.id}, ${member.user.username}, ${member.user.displayName}\n`
		})
	})

	await command.reply({
		content: response
	})
}