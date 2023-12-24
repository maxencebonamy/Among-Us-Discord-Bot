import { Config } from "@/models/config"
import type { APIInteractionGuildMember, GuildMember, GuildMemberRoleManager } from "discord.js"

export const isAdmin = async(member: GuildMember | APIInteractionGuildMember | null): Promise<boolean> => {
	const adminRole = await Config.get({ key: "admin-role" }) ?? "Admin"
	const roles = member?.roles
	if (!roles) return false
	return (roles as GuildMemberRoleManager).cache.some(role => role.name === adminRole)
}