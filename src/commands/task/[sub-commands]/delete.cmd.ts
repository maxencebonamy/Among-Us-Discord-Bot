import { prisma } from "@/lib/db"
import { createErrorEmbed, createSuccessEmbed } from "@/utils/discord/components/embed"
import { isAdmin } from "@/utils/discord/roles"
import type { CommandExecute } from "@/utils/handler/command"

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

	await prisma.taskType.delete({
		where: {
			id: task.id
		}
	})

	await command.reply({
		embeds: [
			createSuccessEmbed({
				content: `La task n°${id} a bien été supprimée.`
			})
		]
	})
}