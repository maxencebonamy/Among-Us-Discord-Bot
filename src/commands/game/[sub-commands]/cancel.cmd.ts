import { prisma } from "@/lib/db"
import { log } from "@/utils/discord/channels"
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

	// Récupérer l'ID de la partie
	const gameId = command.options.getInteger("id")
	if (!gameId) {
		await replyError(command, "L'ID de la partie est invalide.")
		return
	}

	// Vérifier si la partie existe
	const game = await prisma.game.findUnique({ where: { id: gameId } })
	if (!game) {
		await replyError(command, `La partie #${gameId} n'existe pas.`)
		return
	}

	// Annuler la partie
	await prisma.game.update({
		where: {
			id: gameId
		},
		data: {
			status: "FINISHED"
		}
	})
	await command.reply({
		embeds: [createCustomEmbed({
			title: "🎮 Partie annulée",
			content: `La partie #${gameId} a été annulée.`
		})]
	})

	// Supprimer les channels des joueurs
	const players = await prisma.player.findMany({ where: { gameId } })
	for (const player of players) {
		const channel = await command.guild?.channels.fetch(player.channelId)
		if (channel) {
			await channel.delete()
		}
	}

	// Log
	const commandUser = await prisma.user.findUnique({ where: { discordId: command.user.id } })
	await log("🎮 Partie annulée", `La partie #${gameId} a été annulée par ${commandUser?.name ?? "?"}.`)
}