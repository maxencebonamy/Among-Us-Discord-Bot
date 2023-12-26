import { ActionRowBuilder } from "discord.js"
import type { AnyComponentBuilder } from "discord.js"

export const createRow = <T extends AnyComponentBuilder>(...components: T[]): ActionRowBuilder<T> => {
	return new ActionRowBuilder<T>({ components })
}