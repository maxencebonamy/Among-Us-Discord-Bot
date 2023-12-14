import type { Guild } from "discord.js"
import { Client } from "discord.js"
import { config } from "@/config"

declare global {
    // eslint-disable-next-line no-var
    var discordClient: Client | undefined
}

export const client = globalThis.discordClient || new Client({
	intents: ["Guilds", "GuildMessages", "DirectMessages"]
})

if (client.user) {
	client.user.setStatus("invisible")
}

export const getGuild = (): Guild | undefined => {
	return client.guilds.cache.get(config.GUILD_ID)
}