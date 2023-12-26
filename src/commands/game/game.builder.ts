import type { SlashCommandDefition } from "@/utils/handler/command"
import { SlashCommandBuilder } from "discord.js"

export const enableInDev = true

export const slashCommand: SlashCommandDefition = new SlashCommandBuilder()
	.setName("game")
	.setDescription("Gérer les parties de Among Us")

	// launch
	.addSubcommand(subCommand => subCommand
		.setName("launch")
		.setDescription("Lancer une partie de Among Us"))