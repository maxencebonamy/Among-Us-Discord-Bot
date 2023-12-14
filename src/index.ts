import { ActivityType, Client, type ChatInputCommandInteraction } from "discord.js"
import { deployCommands } from "./deploy-commands"
import { commands } from "./commands"
import { config } from "@/config"
import { client } from "./lib/client"

client.once("ready", async() => {
	console.log("Discord bot is ready! 🤖")
	await deployCommands({ guildId: config.GUILD_ID })
})

client.on("interactionCreate", async(interaction) => {
	if (!interaction.isCommand()) {
		return
	}
	const { commandName } = interaction
	const command = commands[commandName as keyof typeof commands]
	if (command) {
		await command.execute(interaction as ChatInputCommandInteraction)
	}
})

void client.login(config.DISCORD_TOKEN).then(() => {
	console.log("Discord bot is logged in! ✅")
	if (!client.user) return
	client.user.setPresence({ activities: [{ name: "Among Us", type: ActivityType.Playing }], status: "dnd" })
})