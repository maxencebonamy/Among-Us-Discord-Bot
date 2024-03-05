import { guilds } from "@/configs/guild"
import type { APIInteractionGuildMember, GuildMember, GuildMemberRoleManager } from "discord.js"

export const isAdmin = async(member: GuildMember | APIInteractionGuildMember | null): Promise<boolean> => {
	if (!member) return false

	const roles = member?.roles
	if (!roles) return false

	return (roles as GuildMemberRoleManager).cache.has(guilds.main.roles.admin)
}