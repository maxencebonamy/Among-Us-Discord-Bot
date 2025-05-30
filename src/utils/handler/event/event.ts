/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import type { EventName, EventExecute, EventOnce } from "@/utils/handler/event"
import type { EnableInDev } from "@/utils/handler/handler.type"
import type { Client } from "discord.js"
import { isDevEnvironment } from "@/configs/env"
import { existsSync, readdirSync, statSync } from "fs"
import { sep } from "path"

export const load = async(client: Client, eventsFolder: string): Promise<number> => {
	const folders = readdirSync(eventsFolder)
	let eventsLoaded = 0

	for (const folder of folders) {
		if (folder === ".gitkeep") continue
		const path = `${eventsFolder}${sep}${folder}${sep}`

		if (!statSync(path).isDirectory()) continue

		const eventFileName = `${folder}.event.ts`

		if (!existsSync(`${path}${eventFileName}`)) throw new Error(`"${eventFileName}" file can't be found in \`${path}\``)

		const dynamicEventImport = await import(`${path}${eventFileName}`)
		const enableInDev: EnableInDev = dynamicEventImport.enableInDev ?? false

		if (!enableInDev && isDevEnvironment) continue

		const eventName: EventName = dynamicEventImport.event

		if (!eventName) throw new Error(`"event" isn't defined in ${path}${eventFileName}`)

		const execute: EventExecute<EventName> = dynamicEventImport.execute

		if (!execute) throw new Error(`"execute" isn't defined in ${path}${eventFileName}`)

		const isOnce: EventOnce = dynamicEventImport.once ?? false

		client[isOnce ? "once" : "on"](eventName, (...args) => execute(...args))

		eventsLoaded++
	}

	return eventsLoaded
}