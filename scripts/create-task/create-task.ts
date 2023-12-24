import yargs from "yargs"
import path from "path"
import type { CreateTaskArgs } from "./create-task.type"
import { createFileIfNotExists, createFolderIfNotExists } from "../utils/path"
import taskTemplate from "./templates/task"

export default (): void => {
	void yargs.command<CreateTaskArgs>(
		"$0 <name>",
		"Create a task",
		(yargs) => {
			return yargs
				.positional("name", {
					describe: "Name of the task",
					type: "string"
				})
		},
		({ name }: CreateTaskArgs) => {
			const taskPath = path.join("src/tasks", name)
			createFolderIfNotExists(taskPath)

			createFileIfNotExists(
				path.join(taskPath, `${name}.task.ts`),
				taskTemplate({ name })
			)

			console.log(`Task ${name} created at ${taskPath}`)
		}
	).argv
}