import type { CreateCommandArgs } from "../create-command.type"

export default ({ name }: CreateCommandArgs): string => {
	return (
		`import type { SlashCommandDefition } from "@/utils/handler/command"
import { SlashCommandBuilder } from "discord.js"

export const enableInDev = true

export const slashCommand: SlashCommandDefition = new SlashCommandBuilder()
	.setName("${name}")
	.setDescription("")`
	)
}