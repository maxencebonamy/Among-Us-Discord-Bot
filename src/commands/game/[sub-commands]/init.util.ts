import { createRow } from "@/utils/discord/components/row"
import type { Collection, GuildMember, ActionRowBuilder, TextChannel, Guild } from "discord.js"
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