import type { Guild, GuildType } from "./guild.type"

export const guilds: Record<GuildType, Guild> = {
	"main": {
		guildId: "1160613124756492358",
		channels: {
			"admins": "1214266720764829726",
			"modos": "1214266722178301973",
			"logs": "1214266723474219018",
			"vitals": "1214266724833034341"
		},
		roles: {
			"player": "1162833038317723719",
			"modo": "1162833091979644980",
			"admin": "1162833152151138530",
			"dev": "1162833388286267564"
		}
	}
}