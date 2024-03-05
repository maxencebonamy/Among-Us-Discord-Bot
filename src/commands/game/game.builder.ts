import type { SlashCommandDefition } from "@/utils/handler/command"
import { SlashCommandBuilder } from "discord.js"

export const enableInDev = true

export const slashCommand: SlashCommandDefition = new SlashCommandBuilder()
	.setName("game")
	.setDescription("Gérer les parties de Among Us")

	// init
	.addSubcommand(subCommand => subCommand
		.setName("init")
		.setDescription("Initialiser une partie"))

	// start
	.addSubcommand(subCommand => subCommand
		.setName("start")
		.setDescription("Lancer une partie"))

	// cancel
	.addSubcommand(subCommand => subCommand
		.setName("cancel")
		.setDescription("Annuler une partie"))

	// pause
	.addSubcommand(subCommand => subCommand
		.setName("pause")
		.setDescription("Mettre en pause une partie"))

	// unpause
	.addSubcommand(subCommand => subCommand
		.setName("unpause")
		.setDescription("Reprendre une partie en pause"))

	// status
	.addSubcommand(subCommand => subCommand
		.setName("status")
		.setDescription("Afficher le statut de la partie"))