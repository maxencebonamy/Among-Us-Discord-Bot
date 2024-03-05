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
	await command.guild?.roles.fetch().then(roles => {
		roles.forEach(role => {
			response += `- ${role.id}, ${role.name}\n`
		})
	})

	// Répondre avec la liste des salons
	await command.reply({
		embeds: [createCustomEmbed({
			title: "🎭 Liste des rôles",
			content: response
		})],
		ephemeral: true
	})
}