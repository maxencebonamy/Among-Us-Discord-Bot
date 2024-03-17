import type { SlashCommandDefition } from "@/utils/handler/command"
import { SlashCommandBuilder } from "discord.js"

export const enableInDev = true

export const slashCommand: SlashCommandDefition = new SlashCommandBuilder()
	.setName("say")
	.setDescription("Faire dire quelque chose au bot")
	.addStringOption(option => option
		.setName("message")
		.setDescription("Le message à faire dire au bot")
		.setRequired(true))