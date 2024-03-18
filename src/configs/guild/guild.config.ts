import type { Guild, GuildType } from "./guild.type"

export const guilds: Record<GuildType, Guild> = {
	"main": {
		guildId: "1160613124756492358",
		channels: {
			"admins": "1219369452315869356",
			"modos": "1219369573607014411",
			"logs": "1219369423186563155",
			"vitals": "1219369678145716424",
			// "devCategory": "1160613125293355060",
			"waitingCategory": "1219369769464238100",
			"gameCategory": "1219369343347986503",
			"playersCategory": "1219369861013311538"
		},
		roles: {
			"player": "1162833038317723719",
			"modo": "1162833091979644980",
			"admin": "1162833152151138530",
			"dev": "1162833388286267564"
		}
	}
}