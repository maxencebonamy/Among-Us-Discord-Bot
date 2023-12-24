import yargs from "yargs"
import path from "path"
import { createFileIfNotExists, createFolderIfNotExists } from "../utils/path"
import type { CreateEventArgs } from "./create-event.type"
import eventTemplate from "./templates/event"

export default (): void => {
	void yargs.command<CreateEventArgs>(
		"$0 <name> <type>",
		"Create an event",
		(yargs) => {
			return yargs
				.positional("name", {
					describe: "Name of the event",
					type: "string"
				})
				.positional("type", {
					describe: "Type of the event",
					type: "string",
					default: ""
				})
		},
		({ name, type }: CreateEventArgs) => {
			const eventPath = path.join("src/events", name)
			createFolderIfNotExists(eventPath)

			createFileIfNotExists(
				path.join(eventPath, `${name}.event.ts`),
				eventTemplate({ name, type })
			)

			console.log(`Event ${name} created at ${eventPath}`)
		}
	).argv
}