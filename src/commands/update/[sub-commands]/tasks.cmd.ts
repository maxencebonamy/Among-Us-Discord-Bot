import { prisma } from "@/lib/db"
import type { CommandExecute } from "@/utils/handler/command"
import { checkRoomChannels, checkTaskChannels } from "./tasks.util"
import { ChannelType } from "discord.js"
import { logger } from "@/utils/logger"
import { createSuccessEmbed } from "@/utils/discord/components/embed"
import { isAdmin } from "@/utils/discord/roles"
import { replyError } from "@/utils/discord/command"
import { guilds } from "@/configs/guild"

export const execute: CommandExecute = async(command) => {
	// Vérifier si l'utilisateur est un administrateur
	if (!await isAdmin(command.member)) {
		await replyError(command, "Vous n'avez pas la permission d'utiliser cette commande.")
		return
	}

	// Indiquer que la réponse est en cours
	await command.deferReply({ ephemeral: true })

	// Récupérer le serveur principal
	const guild = command.guild
	if (!guild) {
		await replyError(command, "Impossible de récupérer le serveur.")
		return
	}
	await guild.channels.fetch()

	// Récupérer les salles et les tasks
	let tasks = await prisma.task.findMany({ include: { room: true } })
	const rooms = await prisma.room.findMany({ where: { tasks: { some: {} } } })

	// Récupérer les channels de tasks
	const categories = Object.values(guilds.main.channels)
	const channels = guild.channels.cache.filter(
		channel => !categories.includes(channel.id) && !categories.includes(channel.parentId ?? "")
	)

	// Si aucune partie en cours, vider tous les channels de tasks
	const game = await prisma.game.findFirst({ where: { status: { in: ["RUNNING", "WAITING"] } } })
	if (!game) {
		await Promise.all(channels.map(async(channel) => {
			if (channel.type !== ChannelType.GuildText) return
			const messages = await channel.messages.fetch()
			for (const message of messages.values()) {
				await message.delete()
			}
		}))
	}

	// Supprimer les channels qui ne sont plus utiles
	await Promise.all(channels.map(async(channel) => {
		if (rooms.some(room => room.channelId === channel.id)) return
		if (tasks.some(task => task.channelId === channel.id)) return
		await channel.delete()
	}))

	// Pour chaque salle et chaque task, vérifier si les channels existent
	await checkRoomChannels(guild, rooms).then(
		async() => {
			tasks = await prisma.task.findMany({ include: { room: true } })
			await checkTaskChannels(guild, tasks)
		}
	)

	// Log
	logger.info("Les channels de tasks ont bien été mis à jour.")

	// Réponse
	await command.editReply({
		embeds: [createSuccessEmbed({ content: "Les channels de tasks ont bien été mis à jour." })]
	})
}