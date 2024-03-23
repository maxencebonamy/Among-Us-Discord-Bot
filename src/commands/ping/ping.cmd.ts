import { prisma, prismaConnected } from "@/lib/db"
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

	// Envoyer un message de réponse
	const sent = await command.reply({
		embeds: [createCustomEmbed({
			title: "🏓 Ping",
			content: "Calcul en cours..."
		})],
		fetchReply: true,
		ephemeral: true
	})

	// Modifier le message de réponse
	const content = `Websocket heartbeat: ${command.client.ws.ping}ms.
	Roundtrip latency: ${sent.createdTimestamp - command.createdTimestamp}ms
	Database connection: ${await prismaConnected() ? "✅" : "❌"}`

	await command.editReply({
		embeds: [createCustomEmbed({
			title: "🏓 Ping",
			content
		})]
	})
}