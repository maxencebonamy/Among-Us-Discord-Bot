import { Client } from "discord.js"
import { deployCommands } from "./deploy-commands"
import { commands } from "./commands"
import { config } from "./config"

const client = new Client({
    intents: ["Guilds", "GuildMessages", "DirectMessages"]
})

client.once("ready", async () => {
    console.log("Discord bot is ready! 🤖")
    await deployCommands({ guildId: config.GUILD_ID })
})

client.on("interactionCreate", async(interaction) => {
    if (!interaction.isCommand()) {
        return
    }
    const { commandName } = interaction;
    if (commands[commandName]) {
        await commands[commandName].execute(interaction)
    }
})

client.login(config.DISCORD_TOKEN)