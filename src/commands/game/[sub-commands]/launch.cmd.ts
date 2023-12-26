import { createCancelButton, createOkButton } from "@/utils/discord/components/button"
import { createCustomEmbed } from "@/utils/discord/components/embed"
import { createRow } from "@/utils/discord/components/row"
import type { CommandExecute } from "@/utils/handler/command"
import { StringSelectMenuBuilder, type GuildMember, type StringSelectMenuInteraction } from "discord.js"
import { playersSelectionRow } from "./launch.util"
import { getGuild, guilds } from "@/configs/guild"
import { getGuildMembers } from "@/utils/discord/guild"
import { Config } from "@/models/config"

export const execute: CommandExecute = async(command) => {
	const guild = await getGuild(command.client, "main")
	const members = await getGuildMembers(guild)
	const players = members?.filter(member => !member.user.bot && member.roles.cache.has(guilds.main.roles.player))
	const minPlayers = Number.parseInt(await Config.get({ key: "min-players" }) ?? "0")
	const maxPlayers = Number.parseInt(await Config.get({ key: "max-players" }) ?? "20")

	const playerSelect = new StringSelectMenuBuilder({
		customId: "players",
		placeholder: "Sélectionnez les joueurs",
		minValues: Math.min(players?.size ?? 0, minPlayers),
		maxValues: Math.min(players?.size ?? 0, maxPlayers),
		options: players?.map(player => ({
			label: player.user.displayName,
			value: player.user.id
		})) ?? []
	})

	const playersSelection = createRow(playerSelect)
	const confirmationRow = createRow(createOkButton(), createCancelButton())

	const selectionResponse = await command.reply({
		embeds: [createCustomEmbed({
			title: "🙋 Sélection des joueurs",
			content: `Sélectionnez les joueurs qui participeront à la partie (entre ${minPlayers} et ${maxPlayers}).`
		})],
		components: [playersSelection],
		ephemeral: true
	})

	let selectedPlayers: (GuildMember)[] = []
	await selectionResponse.awaitMessageComponent({
		filter: interaction => interaction.customId === "players",
		time: 60000
	}).then(interaction => {
		interaction = interaction as StringSelectMenuInteraction
		selectedPlayers = interaction.values.map(value => interaction.guild?.members.cache.get(value))
			.filter(member => member !== undefined) as GuildMember[]
	})

	const confirmationResponse = await command.editReply({
		embeds: [createCustomEmbed({
			title: "🙋 Sélection des joueurs",
			content: `Les joueurs sélectionnés sont :\n${
				selectedPlayers.map(player => `- ${player?.user.displayName} (${player?.user.username})`).join("\n")
			}`
		})],
		components: [confirmationRow]
	})

	await confirmationResponse.awaitMessageComponent({
		filter: interaction => interaction.customId === "ok" || interaction.customId === "cancel",
		time: 60000
	}).then(async interaction => {
		if (interaction.customId === "ok") {
			await command.editReply({
				embeds: [createCustomEmbed({
					title: "🙋 Sélection des joueurs",
					content: "La partie va être lancée."
				})],
				components: []
			})
		} else {
			await command.editReply({
				embeds: [createCustomEmbed({
					title: "🙋 Sélection des joueurs",
					content: "La partie n'a pas été lancée."
				})],
				components: []
			})
		}
	})
}