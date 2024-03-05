import { getGuild, guilds } from "@/configs/guild"
import { createCustomEmbed } from "./components/embed"
import { client } from "@/client"
import { ChannelType } from "discord.js"

export const log = async(title: string, content: string): Promise<void> => {
	const guild = await getGuild(client, "main")

	const logChannel = guild.channels.cache.find(channel => channel.id === guilds.main.channels.logs)
	if (!logChannel) {
		console.error("Log channel not found")
		return
	}

	if (logChannel.type !== ChannelType.GuildText) {
		console.error("Log channel is not a text channel")
		return
	}

	await logChannel.send({
		embeds: [createCustomEmbed({ title, content })]
	})
}