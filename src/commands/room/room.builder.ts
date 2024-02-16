import type { SlashCommandDefition } from "@/utils/handler/command"
import { SlashCommandBuilder } from "discord.js"

export const enableInDev = true

export const slashCommand: SlashCommandDefition = new SlashCommandBuilder()
	.setName("room")
	.setDescription("Gérer les salles")

	// list
	.addSubcommand(subCommand => subCommand
		.setName("list")
		.setDescription("Afficher la liste des salles"))

	// delete
	.addSubcommand(subCommand => subCommand
		.setName("delete")
		.setDescription("Supprimer une salle")
		.addStringOption(option => option
			.setName("id")
			.setDescription("Identifiant de la salle")
			.setRequired(true)))

	// create
	.addSubcommand(subCommand => subCommand
		.setName("create")
		.setDescription("Créer une salle")
		.addStringOption(option => option
			.setName("name")
			.setDescription("Nom de la salle")
			.setRequired(true)))