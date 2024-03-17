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

	// Récupérer le message à faire dire
	const message = command.options.getString("message")
	if (!message) {
		await replyError(command, "Le message à faire dire n'a pas été trouvé.")
		return
	}

	// Récupérer le channel de la commande
	const channel = command.channel
	if (!channel) {
		await replyError(command, "Le channel de la commande n'a pas été trouvé.")
		return
	}

	// Envoyer le message
	await channel.send(message)

	// Répondre
	await command.reply({
		embeds: [createCustomEmbed({
			title: "🗨️ Message envoyé",
			content: "Le message a été envoyé dans le channel."
		})],
		ephemeral: true
	})
}