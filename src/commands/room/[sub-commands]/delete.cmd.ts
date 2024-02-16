import { prisma } from "@/lib/db"
import { createErrorEmbed } from "@/utils/discord/components/embed"
import { isAdmin } from "@/utils/discord/roles"
import type { CommandExecute } from "@/utils/handler/command"
import { findById } from "../room.util"

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
			embeds: [createErrorEmbed({ content: "L'identifiant de la salle est incorrect." })]
		})
		return
	}

	const room = await findById(parseInt(id))
	if (!room) {
		await command.reply({
			embeds: [createErrorEmbed({ content: "La salle spécifiée est introuvable." })]
		})
		return
	}

	await prisma.room.delete({
		where: {
			id: room.id
		}
	})

	await command.reply({
		embeds: [
			createErrorEmbed({
				content: "La salle a bien été supprimée."
			})
		]
	})
}