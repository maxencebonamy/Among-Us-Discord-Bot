import type { CommandExecute } from "@/utils/handler/command"
import { alignRight, truncateString } from "@/utils/function/string"
import { createCustomEmbed, createErrorEmbed } from "@/utils/discord/components/embed"
import { prisma } from "@/lib/db"

export const execute: CommandExecute = async(command) => {
	const tasks = await prisma.task.findMany()
	if (!tasks) {
		await command.reply({
			embeds: [createErrorEmbed({ content: "Une erreur est survenue lors de la récupération des tasks." })]
		})
		return
	}
	if (tasks.length === 0) {
		await command.reply({
			embeds: [createErrorEmbed({ content: "Aucune task n'a été trouvée." })]
		})
		return
	}

	let message = ""
	tasks.forEach(task => {
		message += `\`${alignRight(task.id.toString(), 4)} \`  ${truncateString(task.name, 50)}\n`
	})

	await command.reply({
		embeds: [
			createCustomEmbed({
				title: "📖 Liste des tasks",
				content: message
			})
		]
	})
}