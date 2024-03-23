import { EmbedBuilder } from "discord.js"
import { global } from "@/configs/global"
import type { EmbedArgs, ErrorEmbedArgs, SuccessEmbedArgs, CustomEmbedArgs } from "."

type EmbedType = "normal" | "error";

export const simpleEmbed = (message: string, type: EmbedType = "normal", title?: string): EmbedBuilder => {
	const embed = new EmbedBuilder()

	const color = type === "normal" ? global.colors.primary : global.colors.error
	embed.setColor(color)

	if (message) embed.setDescription(message === "" ? " " : message)
	if (title) embed.setTitle(title)

	return embed
}

export const createEmbed = ({ title, content, color }: EmbedArgs): EmbedBuilder => {
	return new EmbedBuilder()
		.setTitle(title)
		.setDescription(content === "" ? " " : content)
		.setColor(color)
}

export const createSuccessEmbed = ({ content }: SuccessEmbedArgs): EmbedBuilder => {
	return createEmbed({
		title: "✅ Succès",
		content,
		color: global.colors.primary
	})
}

export const createErrorEmbed = ({ content }: ErrorEmbedArgs): EmbedBuilder => {
	return createEmbed({
		title: "❌ Erreur",
		content,
		color: global.colors.error
	})
}

export const createCustomEmbed = ({ title, content }: CustomEmbedArgs): EmbedBuilder => {
	return createEmbed({
		title,
		content,
		color: global.colors.primary
	})
}