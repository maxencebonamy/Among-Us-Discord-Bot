import { prisma } from "@/lib/db"
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

	// Vérifier si une partie en attente ou en cours existe
	const game = await prisma.game.findFirst({ where: { status: { in: ["WAITING", "RUNNING", "PAUSED"] } } })

	// Message
	let content = ""
	if (!game) content = "Aucune partie est en attente ou en cours."
	else if (game.status === "WAITING") content = "La partie est en attente."
	else if (game.status === "PAUSED") content = "La partie est en pause."
	else content = "La partie est en cours."

	// Réponse
	await command.reply({
		embeds: [createCustomEmbed({
			title: "🎮 Statut de la partie",
			content
		})],
		ephemeral: true
	})
}