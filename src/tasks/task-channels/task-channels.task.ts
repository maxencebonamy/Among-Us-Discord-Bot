import { client } from "@/client"
import { getGuild, guilds } from "@/configs/guild"
import { prisma } from "@/lib/db"
import type { TaskExecute, TaskInterval } from "@/utils/handler/task"
import { logger } from "@/utils/logger"
import { checkRoomChannels, checkTaskChannels } from "./task-channel.util"
import { ChannelType } from "discord.js"

export const enableInDev = true

export const interval: TaskInterval = "0 10 * * * *"

export const execute: TaskExecute = async() => {
	// Récupérer le serveur principal
	const guild = await getGuild(client, "main")
	await guild.channels.fetch()

	// Récupérer les salles et les tasks
	const tasks = await prisma.task.findMany({ include: { room: true } })
	const rooms = (await prisma.room.findMany({})).filter(room => tasks.some(task => task.roomId === room.id))

	// Supprimer les channels qui ne sont plus utiles
	const categories = Object.values(guilds.main.channels)
	const channels = guild.channels.cache.filter(
		channel => !categories.includes(channel.id) && !categories.includes(channel.parentId ?? "")
	)
	await Promise.all(channels.map(async(channel) => {
		if (rooms.some(room => room.channelId === channel.id)) return
		if (tasks.some(task => task.channelId === channel.id)) return
		await channel.delete()
	}))

	// Pour chaque salle et chaque task, vérifier si les channels existent
	await checkRoomChannels(guild, rooms).then(async() => await checkTaskChannels(guild, tasks))

	// Si aucune partie en cours, vider tous les channels de tasks
	const game = await prisma.game.findFirst({ where: { status: { in: ["RUNNING", "WAITING"] } } })
	if (!game) {
		await Promise.all(channels.map(async(channel) => {
			if (channel.type !== ChannelType.GuildText) return
			const messages = await channel.messages.fetch()
			await Promise.all(messages.map(async(message) => message.delete()))
		}))
	}

	// Log
	logger.info("Les channels de tasks ont bien été mis à jour.")
}