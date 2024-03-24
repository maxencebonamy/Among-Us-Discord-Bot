import { prisma, prismaConnected } from "@/lib/db"
import { replyError } from "@/utils/discord/command"
import { createCustomEmbed, createSuccessEmbed } from "@/utils/discord/components/embed"
import { isAdmin } from "@/utils/discord/roles"
import type { Color } from "@/utils/game/colors"
import { getColor } from "@/utils/game/colors"
import { checkGameEnd, dispatchTasks, formatPlayer } from "@/utils/game/players"
import type { CommandExecute } from "@/utils/handler/command"
import { logger } from "@/utils/logger"
import { ChannelType } from "discord.js"

export const execute: CommandExecute = async(command) => {
	// Vérifier si l'utilisateur est un administrateur
	if (!await isAdmin(command.member)) {
		await replyError(command, "Vous n'avez pas la permission d'utiliser cette commande.")
		return
	}

	// Vérifier si la base de données est connectée
	if (!await prismaConnected()) {
		await replyError(command, "La base de données n'est pas connectée.")
		return
	}

	// Vérifier si une partie en cours existe
	const game = await prisma.game.findFirst({ where: { status: { in: ["RUNNING", "PAUSED"] } } })
	if (!game) {
		await replyError(command, "Aucune partie est déjà en cours.")
		return
	}

	// Récupérer le joueur à tuer
	const colorName = command.options.getString("couleur", true)
	const color = getColor(colorName as Color["name"])
	if (!color) {
		await replyError(command, "La couleur du joueur est invalide.")
		return
	}
	const playerColor = await prisma.playerColor.findFirst({ where: { hex: color.hex } })
	if (!playerColor) {
		await replyError(command, "La couleur du joueur est invalide.")
		return
	}
	const player = await prisma.player.findFirst({
		where: { color: playerColor, game },
		include: { color: true, user: true }
	})
	if (!player) {
		await replyError(command, "Le joueur n'est pas dans la partie.")
		return
	}
	if (!player.alive) {
		await replyError(command, "Le joueur est déjà mort.")
		return
	}
	await command.deferReply({ ephemeral: true })

	// Tuer le joueur
	await prisma.player.update({ where: { id: player.id }, data: { alive: false } })

	// Récupérer le channel du joueur
	const playerChannel = await command.guild?.channels.fetch(player.channelId).catch(() => null)
	if (!playerChannel || playerChannel.type !== ChannelType.GuildText) {
		logger.error("Impossible de récupérer le channel du joueur.")
		return
	}

	// Supprimer les messages d'action et de progression
	const playerChannelMessages = await playerChannel.messages.fetch()
	await Promise.all(playerChannelMessages.map(async(message) => {
		if (message.id === player.progressionMessageId || message.id === player.actionMessageId) {
			await message.delete()
		}
	}))

	// Envoyer un message au joueur
	await playerChannel.send({
		embeds: [createCustomEmbed({
			title: "🔪 Vous avez été éliminé !",
			content: "Attendez qu'un modo vienne vous chercher."
		})]
	})

	await dispatchTasks(player)
	await checkGameEnd()

	// Répondre
	await command.editReply({
		embeds: [createSuccessEmbed({
			content: `Le joueur ${formatPlayer(player)} a été tué avec succès.`
		})]
	})
}