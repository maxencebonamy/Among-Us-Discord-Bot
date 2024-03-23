import { prisma } from "@/lib/db"
import { log } from "@/utils/discord/channels"
import { replyError } from "@/utils/discord/command"
import { createCustomEmbed } from "@/utils/discord/components/embed"
import { createRow } from "@/utils/discord/components/row"
import { isAdmin } from "@/utils/discord/roles"
import { formatPlayer } from "@/utils/game/players"
import type { CommandExecute } from "@/utils/handler/command"
import { logger } from "@/utils/logger"
import { ChannelType, StringSelectMenuBuilder } from "discord.js"

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
	await command.deferReply({ ephemeral: true })

	// Récupérer les joueurs
	const players = await prisma.player.findMany({
		where: { game, alive: true },
		include: { user: true, color: true }
	})
	if (players.length === 0) {
		await replyError(command, "Aucun joueur dans la partie.")
		return
	}

	// Récupérer le serveur
	const guild = command.guild
	if (!guild) {
		await replyError(command, "Impossible de récupérer le serveur.")
		return
	}

	// Créer un vote
	const vote = await prisma.vote.create({
		data: {
			game: { connect: { id: game.id } }
		}
	})

	// Créer le menu de sélection des joueurs
	const playerSelectMenu = new StringSelectMenuBuilder({
		customId: JSON.stringify({ type: "playerVote", voteId: vote.id }),
		placeholder: "Sélectionnez le joueur",
		minValues: 1,
		maxValues: 1,
		options: [{
			label: "Passer le vote",
			value: "pass"
		}, ...players.map(player => ({
			label: formatPlayer(player),
			value: player.id.toString()
		}))]
	})

	// Envoyer un message de vote à chaque joueur
	await Promise.all(players.map(async(player) => {
		const channel = await guild.channels.fetch(player.channelId).catch(() => null)
		if (!channel || channel.type !== ChannelType.GuildText) {
			logger.error(`Impossible de récupérer le salon du joueur ${formatPlayer(player)}`)
			return
		}

		await channel.send({
			embeds: [createCustomEmbed({
				title: "🗳️ Vote",
				content: "Votez pour éliminer le joueur de votre choix."
			})],
			components: [createRow(playerSelectMenu)]
		})
	}))

	// Réponse
	await command.editReply({
		embeds: [createCustomEmbed({
			title: "🗳️ Vote",
			content: "Les joueurs ont reçu un message de vote."
		})]
	})
	await log("🗳️ Vote", "Un vote a été crée.")
}