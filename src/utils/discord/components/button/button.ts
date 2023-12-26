import { ButtonBuilder, ButtonStyle } from "discord.js"
import type { ButtonArgs } from "."

export const createButton = ({ id, label, style = ButtonStyle.Primary }: ButtonArgs): ButtonBuilder => {
	return new ButtonBuilder()
		.setCustomId(id)
		.setLabel(label)
		.setStyle(style)
}

export const createOkButton = (): ButtonBuilder => {
	return createButton({
		id: "ok",
		label: "OK",
		style: ButtonStyle.Success
	})
}

export const createCancelButton = (): ButtonBuilder => {
	return createButton({
		id: "cancel",
		label: "Annuler",
		style: ButtonStyle.Danger
	})
}