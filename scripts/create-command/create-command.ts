import yargs from "yargs"
import path from "path"
import { createFileIfNotExists, createFolderIfNotExists } from "../utils/path"
import type { CreateCommandArgs } from "./create-command.type"
import commandTemplate from "./templates/command"
import builderTemplate from "./templates/builder"

export default (): void => {
	void yargs.command<CreateCommandArgs>(
		"$0 <name>",
		"Create a command",
		(yargs) => {
			return yargs
				.positional("name", {
					describe: "Name of the command",
					type: "string"
				})
		},
		({ name }: CreateCommandArgs) => {
			const commandPath = path.join("src/commands", name)
			createFolderIfNotExists(commandPath)

			createFileIfNotExists(
				path.join(commandPath, `${name}.cmd.ts`),
				commandTemplate({ name })
			)

			createFileIfNotExists(
				path.join(commandPath, `${name}.builder.ts`),
				builderTemplate({ name })
			)

			console.log(`Command ${name} created at ${commandPath}`)
		}
	).argv
}