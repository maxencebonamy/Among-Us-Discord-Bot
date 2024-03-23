export type Color = {
	name: "Rouge" | "Bleu" | "Vert foncé" | "Jaune" | "Rose" | "Orange" | "Noir" | "Blanc" | "Violet" | "Marron" | "Vert clair" | "Cyan"
	hex: `#${string}`
	emoji: string
}

export const colors: Color[] = [
	{
		name: "Rouge",
		hex: "#d21f32",
		emoji: "🔴"
	},
	{
		name: "Bleu",
		hex: "#032467",
		emoji: "🔵"
	},
	{
		name: "Vert foncé",
		hex: "#014d29",
		emoji: "🟢"
	},
	{
		name: "Jaune",
		hex: "#ffdf38",
		emoji: "🟡"
	},
	{
		name: "Rose",
		hex: "#efaabd",
		emoji: "🟣"
	},
	{
		name: "Orange",
		hex: "#e05711",
		emoji: "🟠"
	},
	{
		name: "Noir",
		hex: "#131313",
		emoji: "⚫"
	},
	{
		name: "Blanc",
		hex: "#eeeaf0",
		emoji: "⚪"
	},
	{
		name: "Violet",
		hex: "#411e5b",
		emoji: "🟣"
	},
	{
		name: "Marron",
		hex: "#4b3329",
		emoji: "🟤"
	},
	{
		name: "Vert clair",
		hex: "#6dab30",
		emoji: "🟢"
	},
	{
		name: "Cyan",
		hex: "#18aad9",
		emoji: "🔵"
	}
]

export const getColor = (name: Color["name"]): Color | null => {
	return colors.find(color => color.name.toLowerCase() === name.toLowerCase()) ?? null
}