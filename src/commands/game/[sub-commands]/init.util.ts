import { prisma } from "@/lib/db"
import { createRow } from "@/utils/discord/components/row"
import { colors } from "@/utils/game/colors"
import type { Game, Player } from "@prisma/client"
import { PlayerRole } from "@prisma/client"
import type { Collection, GuildMember, ActionRowBuilder, TextChannel, Guild, GuildBasedChannel } from "discord.js"
import { ChannelType, StringSelectMenuBuilder } from "discord.js"

export const createPlayersSelectMenu = (
	players: Collection<string, GuildMember>, nbPlayers: number
): ActionRowBuilder<StringSelectMenuBuilder> => {
	const playerSelectMenu = new StringSelectMenuBuilder({
		customId: "players",
		placeholder: "Sélectionnez les joueurs de la partie",
		minValues: nbPlayers,
		maxValues: nbPlayers,
		options: players.map(player => ({
			label: player.displayName,
			value: player.user.id
		}))
	})

	return createRow(playerSelectMenu)
}

export const createChannel = async(guild: Guild, name: string, categoryId: string): Promise<TextChannel> => {
	return await guild.channels.create({
		name,
		type: ChannelType.GuildText,
		parent: categoryId
	})
}

export const createPlayersAndChannels = async(
	game: Game, guild: Guild, category: GuildBasedChannel, selectedMembers: GuildMember[]
): Promise<void> => {
	let index = 0

	for (const player of selectedMembers) {
		const color = await prisma.playerColor.findFirst({
			where: { name: colors[index].name }
		})
		if (!color) continue

		const playerChannel = await guild.channels.create({
			name: `${color.emoji}｜${player.displayName}`,
			type: ChannelType.GuildText,
			parent: category.id
		})
		await playerChannel.permissionOverwrites.edit(player.id, {
			ReadMessageHistory: true,
			SendMessages: true,
			ViewChannel: true
		})

		const user = await prisma.user.findUnique({ where: { discordId: player.id } })
		if (!user) continue

		await prisma.player.createMany({
			data: {
				gameId: game.id,
				userId: user.id,
				role: PlayerRole.CREWMATE,
				channelId: playerChannel.id,
				colorId: color.id
			}
		})

		index++
	}
}

export const drawRandomImpostors = (players: GuildMember[]): GuildMember[] => {
	return players.sort(() => Math.random() - 0.5).slice(0, 2)
}