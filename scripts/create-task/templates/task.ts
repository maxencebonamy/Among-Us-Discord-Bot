import type { CreateTaskArgs } from "../create-task.type"

// eslint-disable-next-line no-empty-pattern
export default ({  }: CreateTaskArgs): string => {
	return (
		`import type { TaskExecute, TaskInterval } from "@/utils/handler/task"

export const enableInDev = true

export const interval: TaskInterval = "* * * * * *"

export const execute: TaskExecute = async() => {
	
}`
	)
}