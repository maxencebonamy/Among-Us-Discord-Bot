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
	await command.guild?.members.fetch().then(members => {
		members.forEach(member => {
			response += `- ${member.user.id}, ${member.user.username}, ${member.user.displayName}\n`
		})
	})

	// Répondre avec la liste des salons
	await command.reply({
		embeds: [createCustomEmbed({
			title: "👤 Liste des membres",
			content: response
		})],
		ephemeral: true
	})
}