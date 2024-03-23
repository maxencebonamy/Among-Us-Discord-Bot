import type { SlashCommandDefition } from "@/utils/handler/command"
import { SlashCommandBuilder } from "discord.js"

export const enableInDev = true

export const slashCommand: SlashCommandDefition = new SlashCommandBuilder()
	.setName("vote")
	.setDescription("Gérer les votes")

	// new
	.addSubcommand(subCommand => subCommand
		.setName("new")
		.setDescription("Créer un nouveau vote"))

	// status
	.addSubcommand(subCommand => subCommand
		.setName("status")
		.setDescription("Voir le statut du vote"))

	// end
	.addSubcommand(subCommand => subCommand
		.setName("end")
		.setDescription("Finir le vote"))