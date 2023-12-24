import type { CreateCommandArgs } from "../create-command.type"

// eslint-disable-next-line no-empty-pattern
export default ({  }: CreateCommandArgs): string => {
	return (
		`import type { CommandExecute } from "@/utils/handler/command"

export const execute: CommandExecute = async(command) => {
	
}`
	)
}