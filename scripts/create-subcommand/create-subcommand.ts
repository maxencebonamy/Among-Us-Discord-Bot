import yargs from "yargs"
import path from "path"
import { appendOrCreateFile, createFileIfNotExists, createFolderIfNotExists, exists } from "../utils/path"
import type { CreateSubcommandArgs } from "./create-subcommand.type"
import subcommandTemplate from "./templates/subcommand"
import builderTemplate from "./templates/builder"

export default (): void => {
	void yargs.command<CreateSubcommandArgs>(
		"$0 <commandName> <name>",
		"Create a subcommand",
		(yargs) => {
			return yargs
				.positional("commandName", {
					describe: "Name of the command",
					type: "string"
				})
				.positional("name", {
					describe: "Name of the subcommand",
					type: "string"
				})
		},
		({ commandName, name }: CreateSubcommandArgs) => {
			const commandPath = path.join("src/commands", commandName)
			const builderPath = path.join(commandPath, `${commandName}.builder.ts`)
			if (!exists(commandPath) || !exists(builderPath)) {
				console.log(`Command ${commandName} does not exist`)
				return
			}

			const subcommandPath = path.join(commandPath, "[sub-commands]")
			createFolderIfNotExists(subcommandPath)

			createFileIfNotExists(
				path.join(subcommandPath, `${name}.cmd.ts`),
				subcommandTemplate({ commandName, name })
			)

			appendOrCreateFile(
				builderPath,
				builderTemplate({ commandName, name })
			)

			console.log(`Subcommand ${name} created at ${commandPath}`)
		}
	).argv
}