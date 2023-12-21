import { Config } from "@/models/config"
import type { ChatInputCommandInteraction } from "discord.js"
import { SlashCommandBuilder } from "discord.js"

export const data = new SlashCommandBuilder()
	.setName("config")
	.setDescription("Edit the bot's configuration")
	.addSubcommand(subcommand => subcommand
		.setName("get")
		.setDescription("Get a configuration value")
		.addStringOption(option => option
			.setName("key")
			.setDescription("The key of the configuration value to get")
			.setRequired(true)))
	.addSubcommand(subcommand => subcommand
		.setName("edit")
		.setDescription("Set a configuration value")
		.addStringOption(option => option
			.setName("key")
			.setDescription("The key of the configuration value to set")
			.setRequired(true))
		.addStringOption(option => option
			.setName("value")
			.setDescription("The value to set")
			.setRequired(true)))
	.addSubcommand(subcommand => subcommand
		.setName("add")
		.setDescription("Add a configuration value")
		.addStringOption(option => option
			.setName("key")
			.setDescription("The key of the configuration value to add")
			.setRequired(true))
		.addStringOption(option => option
			.setName("value")
			.setDescription("The value to add")
			.setRequired(true)))

export const execute = async(interaction: ChatInputCommandInteraction): Promise<void> => {
	const roles = interaction.member?.roles
	if (!roles) return
	const isAdmin = roles.cache.some(role => role.name === "Admin")
	if (!isAdmin) {
		await interaction.reply("Vous ne pouvez pas utiliser cette commande.")
		return
	}

	switch (interaction.options.getSubcommand()) {

	case "get": {
		const key = interaction.options.getString("key", true)
		const value = await Config.get({ key })
		if (!value) {
			await interaction.reply(`\`${key}\` n'existe pas.`)
			break
		}

		await interaction.reply(`\`${key}\` = \`${value}\``)

		break
	}

	case "edit": {
		const key = interaction.options.getString("key", true)
		const value = interaction.options.getString("value", true)

		await Config.edit({ key, value })

		await interaction.reply(`\`${key}\` = \`${value}\``)

		break
	}

	case "add": {
		const key = interaction.options.getString("key", true)
		const value = interaction.options.getString("value", true)

		await Config.add({ key, value })

		await interaction.reply(`\`${key}\` = \`${value}\``)

		break
	}

	}
}