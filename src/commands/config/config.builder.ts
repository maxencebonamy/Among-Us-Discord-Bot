import type { SlashCommandDefition } from "@/utils/handler/command"
import { SlashCommandBuilder } from "discord.js"

export const enableInDev = true

export const slashCommand: SlashCommandDefition = new SlashCommandBuilder()
	.setName("config")
	.setDescription("Modifier la configuration du bot")

	// get
	.addSubcommand(subCommand => subCommand
		.setName("get")
		.setDescription("Obtenir une valeur de configuration")
		.addStringOption(option => option
			.setName("key")
			.setDescription("La clé de la valeur de configuration à obtenir")
			.setRequired(true)))

	// set
	.addSubcommand(subCommand => subCommand
		.setName("set")
		.setDescription("Modifier une valeur de configuration")
		.addStringOption(option => option
			.setName("key")
			.setDescription("La clé de la valeur de configuration à modifier")
			.setRequired(true))
		.addStringOption(option => option
			.setName("value")
			.setDescription("La nouvelle valeur de configuration")
			.setRequired(true)))

	// delete
	.addSubcommand(subCommand => subCommand
		.setName("delete")
		.setDescription("Supprimer une valeur de configuration")
		.addStringOption(option => option
			.setName("key")
			.setDescription("La clé de la valeur de configuration à supprimer")
			.setRequired(true)))

	// get-all
	.addSubcommand(subCommand => subCommand
		.setName("get-all")
		.setDescription("Obtenir toutes les valeurs de configuration"))