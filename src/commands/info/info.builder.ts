import type { SlashCommandDefition } from "@/utils/handler/command"
import { SlashCommandBuilder } from "discord.js"

export const enableInDev = true

export const slashCommand: SlashCommandDefition = new SlashCommandBuilder()
	.setName("info")
	.setDescription("Afficher des informations sur le serveur")

	// channels
	.addSubcommand(subCommand => subCommand
		.setName("channels")
		.setDescription("Afficher la liste des salons"))

	// users
	.addSubcommand(subCommand => subCommand
		.setName("users")
		.setDescription("Afficher la liste des membres"))

	// roles
	.addSubcommand(subCommand => subCommand
		.setName("roles")
		.setDescription("Afficher la liste des rôles"))