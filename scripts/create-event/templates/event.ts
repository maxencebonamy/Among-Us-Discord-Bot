import type { CreateEventArgs } from "../create-event.type"

export default ({ type }: CreateEventArgs): string => {
	return (
		`import type { EventExecute, EventName } from "@/utils/handler/event"

export const enableInDev = true

export const event: EventName = "${type}"

export const execute: EventExecute<"${type}"> = async(message) => {
	
}`
	)
}