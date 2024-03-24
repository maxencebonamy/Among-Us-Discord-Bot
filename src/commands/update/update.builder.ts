import type { SlashCommandDefition } from "@/utils/handler/command"
import { SlashCommandBuilder } from "discord.js"

export const enableInDev = true

export const slashCommand: SlashCommandDefition = new SlashCommandBuilder()
	.setName("update")
	.setDescription("Mettre à jour le bot")

	// tasks
	.addSubcommand(subCommand => subCommand
		.setName("tasks")
		.setDescription("Mettre à jour les channels des tasks conformément à la base de données"))

	// users
	.addSubcommand(subCommand => subCommand
		.setName("users")
		.setDescription("Mettre à jour les utilisateurs conformément à la base de données"))

	// players
	.addSubcommand(subCommand => subCommand
		.setName("players")
		.setDescription("Mettre à jour les channels des joueurs conformément à la base de données"))