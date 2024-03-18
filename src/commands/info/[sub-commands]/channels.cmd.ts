import { replyError } from "@/utils/discord/command"
import { createCustomEmbed } from "@/utils/discord/components/embed"
import { isAdmin } from "@/utils/discord/roles"
import type { CommandExecute } from "@/utils/handler/command"

export const execute: CommandExecute = async(command) => {
	// Vérifier si l'utilisateur est un administrateur
	if (!await isAdmin(command.member)) {
		await replyError(command, "Vous n'avez pas la permission d'utiliser cette commande.")
		return
	}

	// Récupérer la liste des salons
	let response = ""
	await command.guild?.channels.fetch().then(channels => {
		channels.forEach(channel => {
			if (!channel) return
			response += `- ${channel.id}, ${channel.name}\n`
		})
	})

	console.log(response)

	// Répondre avec la liste des salons
	await command.reply({
		embeds: [createCustomEmbed({
			title: "💬 Liste des salons",
			content: response
		})],
		ephemeral: true
	})
}