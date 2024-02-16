import type { SlashCommandDefition } from "@/utils/handler/command"
import { SlashCommandBuilder } from "discord.js"

export const enableInDev = true

export const slashCommand: SlashCommandDefition = new SlashCommandBuilder()
	.setName("task")
	.setDescription("Gérer les différentes tasks")

	// create
	.addSubcommand(subCommand => subCommand
		.setName("create")
		.setDescription("Créer une task")
		.addStringOption(option => option
			.setName("name")
			.setDescription("Nom de la task")
			.setRequired(true))
		.addStringOption(option => option
			.setName("level")
			.setDescription("Niveau de la task")
			.setRequired(true)
			.addChoices(
				{ name: "Facile", value: "EASY" },
				{ name: "Moyen", value: "MEDIUM" },
				{ name: "Difficile", value: "HARD" }
			))
		.addStringOption(option => option
			.setName("description")
			.setDescription("Description de la task")
			.setRequired(false)))

	// list
	.addSubcommand(subCommand => subCommand
		.setName("list")
		.setDescription("Afficher la liste des tasks"))

	// info
	.addSubcommand(subCommand => subCommand
		.setName("info")
		.setDescription("Afficher les informations d'une task")
		.addStringOption(option => option
			.setName("id")
			.setDescription("Identifiant de la task")
			.setRequired(true)))

	// edit
	.addSubcommand(subCommand => subCommand
		.setName("edit")
		.setDescription("Modifier une task")
		.addStringOption(option => option
			.setName("id")
			.setDescription("Identifiant de la task")
			.setRequired(true))
		.addStringOption(option => option
			.setName("name")
			.setDescription("Nom de la task")
			.setRequired(false))
		.addStringOption(option => option
			.setName("description")
			.setDescription("Description de la task")
			.setRequired(false))
		.addStringOption(option => option
			.setName("level")
			.setDescription("Niveau de la task")
			.setRequired(false)
			.addChoices(
				{ name: "Facile", value: "EASY" },
				{ name: "Moyen", value: "MEDIUM" },
				{ name: "Difficile", value: "HARD" }
			)))

	// delete
	.addSubcommand(subCommand => subCommand
		.setName("delete")
		.setDescription("Supprimer une task")
		.addStringOption(option => option
			.setName("id")
			.setDescription("Identifiant de la task")
			.setRequired(true)))