import type { Snowflake } from "discord.js"

export type GuildType = "main"

export type Guild = {
	guildId: Snowflake
	channels: Record<string, Snowflake>
	roles: Record<string, Snowflake>
}