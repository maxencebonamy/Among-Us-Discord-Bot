import { prisma } from "@/lib/db"
import { createErrorEmbed, createSuccessEmbed } from "@/utils/discord/components/embed"
import { isAdmin } from "@/utils/discord/roles"
import type { CommandExecute } from "@/utils/handler/command"
import { TaskTypeSchema } from "prisma/zod"

const Schema = TaskTypeSchema.omit({
	id: true,
	createdAt: true,
	updatedAt: true
})

export const execute: CommandExecute = async(command) => {
	if (!await isAdmin(command.member)) {
		await command.reply({
			embeds: [createErrorEmbed({ content: "Vous n'avez pas la permission d'utiliser cette commande." })]
		})
		return
	}

	const data = {
		name: command.options.getString("name"),
		description: command.options.getString("description"),
		level: command.options.getString("level")
	}

	const parsedData = Schema.safeParse(data)
	if (!parsedData.success) {
		await command.reply({
			embeds: [createErrorEmbed({ content: "Les données spécifiées sont incorrectes." })]
		})
		return
	}

	await prisma.taskType.create({
		data: parsedData.data
	})

	await command.reply({
		embeds: [
			createSuccessEmbed({
				content: "La task a bien été créée."
			})
		]
	})
}