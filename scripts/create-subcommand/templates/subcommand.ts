import type { CreateSubcommandArgs } from "../create-subcommand.type"

// eslint-disable-next-line no-empty-pattern
export default ({  }: CreateSubcommandArgs): string => {
	return (
		`import type { CommandExecute } from "@/utils/handler/command"

export const execute: CommandExecute = async(command) => {

}`
	)
}