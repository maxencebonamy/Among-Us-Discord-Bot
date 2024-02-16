import { prisma } from "@/lib/db"
import { createErrorEmbed, createSuccessEmbed } from "@/utils/discord/components/embed"
import { isAdmin } from "@/utils/discord/roles"
import type { CommandExecute } from "@/utils/handler/command"
import { SimpleRoomSchema } from "../room.util"

export const execute: CommandExecute = async(command) => {
	if (!await isAdmin(command.member)) {
		await command.reply({
			embeds: [createErrorEmbed({ content: "Vous n'avez pas la permission d'utiliser cette commande." })]
		})
		return
	}

	const data = {
		name: command.options.getString("name")
	}
	const parsedData = SimpleRoomSchema.safeParse(data)
	if (!parsedData.success) {
		await command.reply({
			embeds: [createErrorEmbed({ content: "Les données spécifiées sont incorrectes." })]
		})
		return
	}

	await prisma.room.create({
		data: parsedData.data
	})

	await command.reply({
		embeds: [
			createSuccessEmbed({
				content: "La salle a bien été créée."
			})
		]
	})
}