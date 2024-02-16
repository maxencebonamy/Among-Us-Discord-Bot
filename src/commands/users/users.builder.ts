import type { SlashCommandDefition } from "@/utils/handler/command"
import { SlashCommandBuilder } from "discord.js"

export const enableInDev = true

export const slashCommand: SlashCommandDefition = new SlashCommandBuilder()
	.setName("users")
	.setDescription("Gérer les utilisateurs")

	// update
	.addSubcommand(subCommand => subCommand
		.setName("update")
		.setDescription("Mettre à jour les utilisateurs selon leurs rôles"))