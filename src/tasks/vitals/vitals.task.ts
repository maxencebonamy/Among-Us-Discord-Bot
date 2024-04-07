import { client } from "@/client"
import { getGuild, guilds } from "@/configs/guild"
import { prisma, prismaConnected } from "@/lib/db"
import { createCustomEmbed } from "@/utils/discord/components/embed"
import { formatPlayer } from "@/utils/game/players"
import type { TaskExecute, TaskInterval } from "@/utils/handler/task"
import { logger } from "@/utils/logger"
import { ChannelType } from "discord.js"

export const enableInDev = true

export const interval: TaskInterval = "*/3 * * * * *"

export const execute: TaskExecute = async() => {
	// Récupérer le serveur principal
	const guild = await getGuild(client, "main")

	// Récupérer le channel des vitals
	await guild.channels.fetch()
	const channel = guild.channels.cache.find(channel => channel.id === guilds.main.channels.vitals)
	if (!channel || channel.type !== ChannelType.GuildText) {
		logger.error("Le channel des vitals n'existe pas.")
		return
	}

	// Vérifier si la base de données est connectée
	if (!await prismaConnected()) {
		logger.error("La base de données n'est pas connectée.")
		return
	}

	// Récupérer la partie en cours
	const game = await prisma.game.findFirst({
		where: {
			status: "RUNNING"
		}
	})
	if (!game) {
		// Supprimer tous les messages des vitals
		const messages = await channel.messages.fetch()
		await Promise.all(messages.map(async message => {
			await message.delete().catch(() => null)
		}))
		return
	}

	// Récupérer les joueurs
	const players = await prisma.player.findMany({
		where: {
			game
		},
		include: {
			user: true,
			color: true
		}
	})
	if (!players) {
		logger.error("Aucun joueur n'est enregistré.")
		return
	}

	// Créer l'embed
	const embed = createCustomEmbed({
		title: "📈 Vitals",
		content: `${players.map(
			player => `# ${player.alive ? "✅" : "💀"} ${formatPlayer(player)} est ${player.alive ? "en vie" : "mort(e)"}.`
		).join("\n")}`
	})

	// Créer les embeds
	// const embeds = players.map(player => createEmbed({
	// 	color: (player.color.hex as `#${string}`) ?? getColor("Noir")?.hex,
	// 	title: `${player.alive ? "✅" : "💀"} ${formatPlayer(player)}`,
	// 	content: `${formatPlayer(player)} est ${player.alive ? "en vie" : "mort(e)"}.`
	// }))

	// Message
	const messages = await channel.messages.fetch()
	const lastMessage = messages.filter(message => message.author.bot).last()
	if (lastMessage) {
		await Promise.all(
			messages.map(async message => {
				if (message.id === lastMessage.id) return
				await message.delete().catch(() => null)
			})
		)
		await lastMessage.edit({ embeds: [embed] })
		return
	}
	await channel.send({ embeds: [embed] })
}