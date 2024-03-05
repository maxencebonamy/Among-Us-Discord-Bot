export type Color = {
	name: "Rouge" | "Bleu" | "Vert" | "Jaune" | "Rose" | "Orange" | "Noir" | "Blanc" | "Violet" | "Cyan" | "Vert clair" | "Bleu clair"
	hex: `#${string}`
	emoji: string
}

export const colors: Color[] = [
	{
		name: "Rouge",
		hex: "#FF0000",
		emoji: "🔴"
	},
	{
		name: "Bleu",
		hex: "#0000FF",
		emoji: "🔵"
	},
	{
		name: "Vert",
		hex: "#00FF00",
		emoji: "🟢"
	},
	{
		name: "Jaune",
		hex: "#FFFF00",
		emoji: "🟡"
	},
	{
		name: "Rose",
		hex: "#FF00FF",
		emoji: "🟣"
	},
	{
		name: "Orange",
		hex: "#FFA500",
		emoji: "🟠"
	},
	{
		name: "Noir",
		hex: "#000000",
		emoji: "⚫"
	},
	{
		name: "Blanc",
		hex: "#FFFFFF",
		emoji: "⚪"
	},
	{
		name: "Violet",
		hex: "#800080",
		emoji: "🟪"
	},
	{
		name: "Cyan",
		hex: "#00FFFF",
		emoji: "🟦"
	},
	{
		name: "Vert clair",
		hex: "#90EE90",
		emoji: "🟩"
	},
	{
		name: "Bleu clair",
		hex: "#ADD8E6",
		emoji: "🟦"
	}
]

export const getColor = (name: Color["name"]): Color | null => {
	return colors.find(color => color.name.toLowerCase() === name.toLowerCase()) ?? null
}