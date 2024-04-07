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

	// Récupérer la liste des membres
	let response = ""
	await command.guild?.members.fetch().then(members => {
		members.forEach(member => {
			const roles = member.roles.cache
			response += `- ${member.user.id} - ${member.displayName} : ${roles.map(role => role.name).join(", ")}\n`
		})
	})

	// Répondre avec la liste des membres
	await command.reply({
		embeds: [createCustomEmbed({
			title: "👤 Liste des membres",
			content: response
		})],
		ephemeral: true
	})
}