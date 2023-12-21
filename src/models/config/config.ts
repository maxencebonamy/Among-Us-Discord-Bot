import { db } from "@/lib/db"
import type { ConfigAddProps, ConfigEditProps, ConfigGetProps, ConfigExistsProps } from "."

export class Config {

	static async add({ key, value }: ConfigAddProps): Promise<void> {
		if (await Config.exists({ key })) return

		await db.config.create({
			data: {
				key,
				value
			}
		})
	}

	static async get({ key }: ConfigGetProps): Promise<string | null> {
		const config = await db.config.findFirst({
			where: {
				key
			}
		})

		return config?.value ?? null
	}

	static async edit({ key, value }: ConfigEditProps): Promise<void> {
		await db.config.update({
			where: {
				key
			},
			data: {
				value
			}
		})
	}

	static async exists({ key }: ConfigExistsProps): Promise<boolean> {
		return !!(await Config.get({ key }))
	}

}