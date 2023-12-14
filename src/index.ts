import { Client } from "discord.js"
import { deployCommands } from "./deploy-commands"
import { commands } from "./commands"
import { config } from "./config"

const client = new Client({
	intents: ["Guilds", "GuildMessages", "DirectMessages"]
})

client.once("ready", async() => {
	console.log("Discord bot is ready! 🤖")
	await deployCommands({ guildId: config.GUILD_ID })
})

client.on("interactionCreate", async(interaction) => {
	if (!interaction.isCommand()) {
		return
	}
	const { commandName } = interaction
	if (commands[commandName]) {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
		await commands[commandName].execute(interaction)
	}
})

void client.login(config.DISCORD_TOKEN)