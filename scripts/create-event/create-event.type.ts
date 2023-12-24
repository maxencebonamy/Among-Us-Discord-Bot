import type { EventName } from "@/utils/handler/event"

export type CreateEventArgs = {
	name: string
	type: EventName
}