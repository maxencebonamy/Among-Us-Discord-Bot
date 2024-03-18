import { guilds } from "@/configs/guild"
import { prisma } from "@/lib/db"
import type { Room, Task } from "@prisma/client"
import type { OverwriteResolvable } from "discord.js"
import { ChannelType, type Guild } from "discord.js"

export const checkRoomChannels = async(guild: Guild, rooms: Room[]): Promise<void> => {
	await Promise.all(rooms.map(async(room) => {
		const expectedName = room.name
		const expectedPermissions: OverwriteResolvable[] = [
			{ id: guild.id, deny: ["ViewChannel"] },
			{ id: guilds.main.roles.player, deny: ["ViewChannel"] },
			{ id: guilds.main.roles.admin, allow: ["ViewChannel"] },
			{ id: guilds.main.roles.dev, allow: ["ViewChannel"] },
			{ id: guilds.main.roles.modo, allow: ["ViewChannel"] }
		]

		if (room.channelId) {
			const channel = guild.channels.cache.get(room.channelId)
			if (channel) {
				if (channel.name !== expectedName) await channel.edit({ name: expectedName })
				await channel.edit({ permissionOverwrites: expectedPermissions })
				return
			}
		}

		await guild.channels.create({
			name: expectedName,
			type: ChannelType.GuildCategory,
			permissionOverwrites: expectedPermissions
		}).then(async(channel) => {
			await prisma.room.update({
				where: { id: room.id },
				data: { channelId: channel.id }
			})
		})
	}))
}

export const checkTaskChannels = async(guild: Guild, tasks: (Task & { room: Room })[]): Promise<void> => {
	await Promise.all(tasks.map(async(task) => {
		const expectedParent = task.room.channelId
		const expectedName = `${task.emoji}｜${task.name}`
		const expectedPermissions: OverwriteResolvable[] = [
			{ id: guild.id, deny: ["ViewChannel"] },
			{ id: guilds.main.roles.player, deny: ["ViewChannel"] },
			{ id: guilds.main.roles.admin, allow: ["ViewChannel"] },
			{ id: guilds.main.roles.dev, allow: ["ViewChannel"] },
			{ id: guilds.main.roles.modo, allow: ["ViewChannel"] }
		]

		if (task.channelId) {
			const channel = guild.channels.cache.get(task.channelId)
			if (channel) {
				if (channel.parentId !== expectedParent)  await channel.edit({ parent: expectedParent })
				if (channel.name !== expectedName)  await channel.edit({ name: expectedName })
				await channel.edit({ permissionOverwrites: expectedPermissions })
				return
			}
		}

		await guild.channels.create({
			name: expectedName,
			type: ChannelType.GuildText,
			parent: expectedParent,
			permissionOverwrites: expectedPermissions
		}).then(async(channel) => {
			await prisma.task.update({
				where: { id: task.id },
				data: { channelId: channel.id }
			})
		})
	}))
}