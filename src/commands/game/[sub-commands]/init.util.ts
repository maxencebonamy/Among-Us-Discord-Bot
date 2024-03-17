import { prisma } from "@/lib/db"
import { createRow } from "@/utils/discord/components/row"
import { shuffle } from "@/utils/function/random/random.util"
import { Color } from "@/utils/game/colors"
import type { Game, PlayerColor } from "@prisma/client"
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
	const colors = await prisma.playerColor.findMany()
	if (!colors) return
	if (colors.length < selectedMembers.length) return
	const shuffledColors = shuffle(colors)
	const membersColors = Object.fromEntries(
		selectedMembers.map((player, index) => [player.id, shuffledColors[index]])
	)

	await Promise.all(selectedMembers.map(async(player) => {
		const color = membersColors[player.id]

		const playerChannel = await guild.channels.create({
			name: `${color.emoji}｜${player.displayName}`,
			type: ChannelType.GuildText,
			parent: category.id
		}).then(channel => channel.permissionOverwrites.edit(player.id, {
			ReadMessageHistory: true,
			SendMessages: true,
			ViewChannel: true
		}))

		const user = await prisma.user.findUnique({ where: { discordId: player.id } })
		if (!user) return

		await prisma.player.createMany({
			data: {
				gameId: game.id,
				userId: user.id,
				role: PlayerRole.CREWMATE,
				channelId: playerChannel.id,
				colorId: color.id
			}
		})
	}))
}

export const drawRandomImpostors = (players: GuildMember[]): GuildMember[] => {
	return [...players].sort(() => Math.random() - 0.5).slice(0, 2)
}