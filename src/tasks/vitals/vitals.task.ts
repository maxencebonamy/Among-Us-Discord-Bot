import { client } from "@/client"
import { getGuild, guilds } from "@/configs/guild"
import { prisma } from "@/lib/db"
import { createEmbed } from "@/utils/discord/components/embed"
import { getColor } from "@/utils/game/colors"
import { formatPlayer } from "@/utils/game/players"
import type { TaskExecute, TaskInterval } from "@/utils/handler/task"
import { ChannelType } from "discord.js"

export const enableInDev = true

export const interval: TaskInterval = "*/3 * * * * *"

export const execute: TaskExecute = async() => {
	// Récupérer le serveur principal
	const guild = await getGuild(client, "main")

	// Récupérer le channel des vitals
	await guild.channels.fetch()
	const channel = guild.channels.cache.find(channel => channel.id === guilds.main.channels.vitals)
	if (!channel) {
		console.error("Le channel des vitals n'existe pas.")
		return
	}
	if (channel.type !== ChannelType.GuildText) {
		console.error("Le channel des vitals n'est pas un salon textuel.")
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
		for (const message of messages.values()) {
			await message.delete()
		}
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
		console.error("Aucun joueur n'est enregistré.")
		return
	}

	// Créer les embeds
	const embeds = players.map(player => createEmbed({
		color: (player.color.hex as `#${string}`) ?? getColor("Noir")?.hex,
		title: `${player.alive ? "✅" : "💀"} ${formatPlayer(player)} est ${player.alive ? "en vie" : "mort(e)"}.`,
		content: " "
	}))

	// Message
	const lastMessage = await channel.messages.fetch().then(messages => messages.filter(message => message.author.bot).last())
	if (lastMessage) {
		await lastMessage.edit({ embeds })
		return
	}
	await channel.send({ embeds })
}