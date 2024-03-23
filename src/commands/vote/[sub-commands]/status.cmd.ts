import { prisma } from "@/lib/db"
import { replyError } from "@/utils/discord/command"
import { createCustomEmbed } from "@/utils/discord/components/embed"
import { isAdmin } from "@/utils/discord/roles"
import { formatPlayer } from "@/utils/game/players"
import type { CommandExecute } from "@/utils/handler/command"

export const execute: CommandExecute = async(command) => {
	// Vérifier si l'utilisateur est un administrateur
	if (!await isAdmin(command.member)) {
		await replyError(command, "Vous n'avez pas la permission d'utiliser cette commande.")
		return
	}

	// Vérifier si une partie en cours existe
	const game = await prisma.game.findFirst({ where: { status: { in: ["RUNNING"] } } })
	if (!game) {
		await replyError(command, "Aucune partie en cours.")
		return
	}

	// Vérifier si un vote est en cours
	const vote = await prisma.vote.findFirst({ where: { game, finished: false } })
	if (!vote) {
		await replyError(command, "Aucun vote en cours.")
		return
	}
	await command.deferReply({ ephemeral: true })

	// Récupérer les joueurs
	const players = await prisma.player.findMany({
		where: { game, alive: true },
		include: { user: true, color: true }
	})

	// Récupérer les votes
	const votes = await prisma.playerVote.findMany({ where: { vote } })

	// Répondre
	const content = `${players.map(player => {
		const playerVote = votes.find(vote => vote.authorId === player.id)
		return `${playerVote ? "✅" : "❌"} ${formatPlayer(player)}`
	}).join("\n")}`
	await command.editReply({
		embeds: [createCustomEmbed({
			title: "🗳️ Statut du vote",
			content
		})]
	})
}