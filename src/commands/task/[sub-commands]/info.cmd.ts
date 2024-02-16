import { prisma } from "@/lib/db"
import { createCustomEmbed, createErrorEmbed } from "@/utils/discord/components/embed"
import type { CommandExecute } from "@/utils/handler/command"
import type { TaskLevel } from "@prisma/client"

const formatLevel = (level: TaskLevel): string => {
	switch (level) {
	case "EASY":
		return "🟢 Facile"
	case "MEDIUM":
		return "🟡 Moyen"
	case "HARD":
		return "🔴 Difficile"
	}
}

export const execute: CommandExecute = async(command) => {
	const id = command.options.getString("id")
	if (!id) {
		await command.reply({
			embeds: [createErrorEmbed({ content: "Veuillez spécifier l'identifiant de la task." })]
		})
		return
	}

	const task = await prisma.taskType.findUnique({
		where: {
			id: parseInt(id)
		}
	})
	if (!task) {
		await command.reply({
			embeds: [createErrorEmbed({ content: `La task n°${id} n'existe pas.` })]
		})
		return
	}

	let message = ""
	message += `**Nom**\n${task.name}\n\n`
	message += `**Description**\n${task.description ?? "*Pas spécifiée...*"}\n\n`
	message += `**Niveau**\n${formatLevel(task.level)}`

	await command.reply({
		embeds: [
			createCustomEmbed({
				title: `📖 Task n°${task.id}`,
				content: message
			})
		]
	})
}