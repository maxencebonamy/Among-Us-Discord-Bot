import { colors } from "@/utils/game/colors"
import type { SlashCommandDefition } from "@/utils/handler/command"
import { SlashCommandBuilder } from "discord.js"

export const enableInDev = true

export const slashCommand: SlashCommandDefition = new SlashCommandBuilder()
	.setName("player")
	.setDescription("Gérer les joueurs d'une partie")

	// kill
	.addSubcommand(subCommand => subCommand
		.setName("kill")
		.setDescription("Tuer un joueur")
		.addStringOption(option => option
			.setName("couleur")
			.setDescription("La couleur du joueur à tuer")
			.setRequired(true)
			.addChoices(
				...colors.map(color => ({ name: `${color.emoji} ${color.name}`, value: color.name }))
			)))