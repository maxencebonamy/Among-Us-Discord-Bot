import { db } from "@/lib/db"
import type { ChatInputCommandInteraction } from "discord.js"
import { SlashCommandBuilder } from "discord.js"

export const data = new SlashCommandBuilder()
	.setName("init")
	.setDescription("Initializes the game")

export const execute = async(interaction: ChatInputCommandInteraction): Promise<void> => {
	const roles = await interaction.guild?.roles.fetch().then(roles => roles.map(r => ({ name: r.name, id: r.id, members: r.members })))
	if (!roles) return

	const players = roles.find(r => r.name === "Joueur")?.members

	if (!players) return

	const users = await db.user.findMany()

	players.forEach((player) => {
		const user = users.find(u => u.discordId === player.id)
		if (user && user.role) return
	})
}