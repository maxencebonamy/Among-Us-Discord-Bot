import { prisma } from "@/lib/db"
import { createErrorEmbed, createSuccessEmbed } from "@/utils/discord/components/embed"
import { isAdmin } from "@/utils/discord/roles"
import type { CommandExecute } from "@/utils/handler/command"
import { SimpleTaskTypeSchema, findById } from "../task.util"

export const execute: CommandExecute = async(command) => {
	if (!await isAdmin(command.member)) {
		await command.reply({
			embeds: [createErrorEmbed({ content: "Vous n'avez pas la permission d'utiliser cette commande." })]
		})
		return
	}

	const id = command.options.getString("id")
	if (!id) {
		await command.reply({
			embeds: [createErrorEmbed({ content: "Veuillez spécifier l'identifiant de la task." })]
		})
		return
	}

	const data = {
		name: command.options.getString("name"),
		description: command.options.getString("description"),
		level: command.options.getString("level")
	}

	const parsedData = SimpleTaskTypeSchema.safeParse(data)
	if (!parsedData.success) {
		await command.reply({
			embeds: [createErrorEmbed({ content: "Les données spécifiées sont incorrectes." })]
		})
		return
	}

	const task = await findById(parseInt(id))
	if (!task) {
		await command.reply({
			embeds: [createErrorEmbed({ content: `La task n°${id} n'existe pas.` })]
		})
		return
	}

	await prisma.task.update({
		where: {
			id: task.id
		},
		data: parsedData.data
	})

	await command.reply({
		embeds: [
			createSuccessEmbed({
				content: `La task n°${id} a bien été modifiée.`
			})
		]
	})
}