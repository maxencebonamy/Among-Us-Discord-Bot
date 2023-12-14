import type { ChatInputCommandInteraction } from "discord.js"
import { SlashCommandBuilder } from "discord.js"

export const data = new SlashCommandBuilder()
	.setName("test")
	.setDescription("Test command")

export const execute = async(interaction: ChatInputCommandInteraction): Promise<void> => {
	interaction.options.getChannel("tests")
	// const guild = interaction.guild
	// if (!guild) return
	// await interaction.guild.members.fetch()
	// console.log(guild.members.cache)
	// const role = guild.roles.cache.find(role => role.name === "Admin")
	// const players = role?.members.map(member => member.user.tag)
	// console.log(players)
	// if (!players) return
	// await interaction.reply(players.length.toString())
}