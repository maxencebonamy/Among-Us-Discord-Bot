import type { CacheType, ChatInputCommandInteraction } from "discord.js"
import { createCustomEmbed, createErrorEmbed } from "./components/embed"
import type { User } from "@prisma/client"
import { prisma } from "@/lib/db"

export const replyError = async(command: ChatInputCommandInteraction<CacheType>, content: string): Promise<void> => {
	await command.reply({
		embeds: [createErrorEmbed({ content })],
		ephemeral: true
	})
}

export const getCommandUser = async(command: ChatInputCommandInteraction<CacheType>): Promise<User | null> => {
	return await prisma.user.findUnique({ where: { discordId: command.user.id } })
}

export const editReplyEmbed = async(command: ChatInputCommandInteraction<CacheType>, title: string, content: string): Promise<void> => {
	await command.editReply({
		embeds: [createCustomEmbed({ title, content })],
		components: []
	})
}