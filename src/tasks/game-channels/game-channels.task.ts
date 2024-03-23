import { client } from "@/client"
import { getGuild, guilds } from "@/configs/guild"
import { prisma, prismaConnected } from "@/lib/db"
import { log } from "@/utils/discord/channels"
import type { TaskExecute, TaskInterval } from "@/utils/handler/task"
import { logger } from "@/utils/logger"
import { ChannelType } from "discord.js"

export const enableInDev = true

export const interval: TaskInterval = "0 0 * * * *"

export const execute: TaskExecute = async() => {
	// Récupérer le serveur principal
	const guild = await getGuild(client, "main")

	// Vérifier si la base de données est connectée
	if (!await prismaConnected()) {
		logger.error("La base de données n'est pas connectée.")
		return
	}

	// Récupérer la partie actuellement en attente ou en cours
	const game = await prisma.game.findFirst({ where: { status: { in: ["WAITING", "RUNNING", "PAUSED"] } } })
	if (!game) return

	// Récupérer les joueurs
	const players = await prisma.player.findMany({
		where: { gameId: game.id },
		include: { user: true, color: true }
	})

	// Récupérer la catégorie des joueurs
	const playersCategory = guild.channels.cache.get(guilds.main.channels.playersCategory)
	if (!playersCategory) {
		logger.error("La catégorie des joueurs n'a pas été trouvée.")
		return
	}

	// Pour chaque joueur, vérifier si le salon existe
	await Promise.all(players.map(async(player) => {
		// Vérifier que le joueur est sur le serveur
		const member = await guild.members.fetch(player.user.discordId).catch(() => null)
		if (!member) {
			logger.error(`Le joueur ${player.user.name} n'est pas sur le serveur.`)
			return
		}

		// Récupérer le salon du joueur
		let playerChannel = await guild.channels.fetch(player.channelId)

		// Si le channel n'existe pas, on le créé
		if (!playerChannel) {
			playerChannel = await guild.channels.create({
				name: `${player.color.emoji}｜${player.user.name}`,
				type: ChannelType.GuildText,
				parent: playersCategory.id
			}).then(channel => channel.permissionOverwrites.edit(player.user.discordId, {
				ReadMessageHistory: true,
				SendMessages: true,
				ViewChannel: true
			}))
			if (!playerChannel) return
		}

		// Si le salon n'est pas un salon texte, on ne fait rien
		if (playerChannel.type !== ChannelType.GuildText) {
			logger.error(`Le salon de ${player.user.name} n'est pas un salon texte.`)
			return
		}

		// Vérifier les permissions du joueur
		const permissions = playerChannel.permissionOverwrites.resolve(player.user.discordId)
		if (!permissions || !permissions.allow.has("SendMessages")
			|| !permissions.allow.has("ViewChannel") || !permissions.allow.has("ReadMessageHistory")) {
			await playerChannel.permissionOverwrites.edit(player.user.discordId, {
				ReadMessageHistory: true,
				SendMessages: true,
				ViewChannel: true
			}).catch(logger.error)
			await log("🪪 Permissions", `Permissions du salon de ${player.user.name} mises à jour.`)
		}
	}))
}