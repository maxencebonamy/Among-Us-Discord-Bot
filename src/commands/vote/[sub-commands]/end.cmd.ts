import { prisma } from "@/lib/db"
import { replyError } from "@/utils/discord/command"
import { isAdmin } from "@/utils/discord/roles"
import type { CommandExecute } from "@/utils/handler/command"
import { eliminatePlayer } from "./end.util"
import type { Player, PlayerColor, User } from "@prisma/client"
import { guilds } from "@/configs/guild"
import { ChannelType } from "discord.js"
import { createCustomEmbed, createErrorEmbed } from "@/utils/discord/components/embed"
import { formatPlayer } from "@/utils/game/players"

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

	// Vérifier si tous les joueurs ont voté
	if (votes.length < players.length) {
		await command.editReply({
			embeds: [createErrorEmbed({
				content: "Tous les joueurs n'ont pas encore voté."
			})]
		})
		return
	}

	// Mettre fin au vote
	await prisma.vote.update({
		where: { id: vote.id },
		data: { finished: true }
	})

	// Récupérer le joueur le plus voté
	const eliminatedPlayer = eliminatePlayer(votes)
	let target: Player & { user: User, color: PlayerColor } | null = null
	if (eliminatedPlayer !== null) target = await prisma.player.findUnique({ where: { id: eliminatedPlayer }, include: { user: true, color: true } })

	// Récupérer le channel admin
	const channel = await command.guild?.channels.fetch(guilds.main.channels.admins)
	if (!channel || channel.type !== ChannelType.GuildText) {
		await command.editReply({
			embeds: [createErrorEmbed({
				content: "Impossible de récupérer le channel admin.."
			})]
		})
		return
	}

	// Envoyer le message
	let content = target === null ? "Aucun joueur n'a été éliminé !" : `Le joueur ${formatPlayer(target)} a été éliminé !`
	content += `\n\n${players.map(player => {
		const playerVote = votes.find(vote => vote.authorId === player.id)
		if (!playerVote) return `${formatPlayer(player)} n'a pas voté`
		const playerVoteTarget = players.find(player => player.id === playerVote.targetId)
		if (!playerVoteTarget) return `${formatPlayer(player)} a voté pour passer le vote`
		return `${formatPlayer(player)} a voté pour ${formatPlayer(playerVoteTarget)}`
	}).join("\n")}`
	await command.editReply({
		embeds: [createCustomEmbed({
			title: "🗳️ Vote terminé",
			content
		})]
	})
	await channel.send({
		embeds: [createCustomEmbed({
			title: "🗳️ Vote terminé",
			content
		})]
	})
}