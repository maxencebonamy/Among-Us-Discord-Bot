import type { HexColorString } from "discord.js"

export type GlobalColor = "primary" | "error"

export type GlobalConfig = {
	localFormat: string
	colors: Record<GlobalColor, HexColorString>
}