import { prisma } from "@/lib/db"
import type { ConfigGetterArgs, ConfigSetterArgs } from "./config.type"

export class Config {

	static async add({ key, value }: ConfigSetterArgs): Promise<void> {
		if (await Config.exists({ key })) return

		await prisma.config.create({
			data: {
				key,
				value
			}
		})
	}

	static async get({ key }: ConfigGetterArgs): Promise<string | null> {
		const config = await prisma.config.findFirst({
			where: {
				key
			}
		})

		return config?.value ?? null
	}

	static async getAll(): Promise<Record<string, string>> {
		const config = await prisma.config.findMany({
			select: {
				key: true,
				value: true
			}
		})

		const output: Record<string, string> = {}
		Object.entries(config).forEach(([_, value]) => {
			if (value.value === null) return
			output[value.key] = value.value
		})

		return output
	}

	static async set({ key, value }: ConfigSetterArgs): Promise<void> {
		if (!await Config.exists({ key })) {
			await Config.add({ key, value })
			return
		}

		await prisma.config.update({
			where: {
				key
			},
			data: {
				value
			}
		})
	}

	static async delete({ key }: ConfigGetterArgs): Promise<void> {
		await prisma.config.delete({
			where: {
				key
			}
		})
	}

	static async exists({ key }: ConfigGetterArgs): Promise<boolean> {
		return !!(await Config.get({ key }))
	}

}