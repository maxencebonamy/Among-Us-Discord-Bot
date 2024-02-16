import { prisma } from "@/lib/db"
import { createCustomEmbed } from "@/utils/discord/components/embed"
import type { CommandExecute } from "@/utils/handler/command"

export const execute: CommandExecute = async(command) => {
	const rooms = await prisma.room.findMany()
	if (!rooms) {
		await command.reply({
			content: "Une erreur est survenue lors de la récupération des salles."
		})
		return
	}
	if (rooms.length === 0) {
		await command.reply({
			content: "Aucune salle n'a été trouvée."
		})
		return
	}

	let message = ""
	rooms.forEach(room => {
		message += `\`${room.id}\`  ${room.name}\n`
	})

	await command.reply({
		embeds: [
			createCustomEmbed({
				title: "🗺️ Liste des salles",
				content: message
			})
		]
	})
}