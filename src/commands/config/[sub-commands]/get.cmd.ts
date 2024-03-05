import { prisma } from "@/lib/db"
import { createErrorEmbed, createSuccessEmbed } from "@/utils/discord/components/embed"
import { isAdmin } from "@/utils/discord/roles"
import type { CommandExecute } from "@/utils/handler/command"

export const execute: CommandExecute = async(command) => {
	if (!await isAdmin(command.member)) {
		await command.reply("Vous n'avez pas la permission d'utiliser cette commande.")
		return
	}

	const key = command.options.getString("key", true)
	let value = null

	let embed = null

	try {
		value = await prisma.config.findFirst({ where: { key } }).then(config => config?.value ?? null)
		if (value === null) throw new Error("La valeur est nulle.")
		embed = createSuccessEmbed({ content: `La valeur de configuration "${key}" est égale à "${value}".` })
	} catch (error) {
		embed = createErrorEmbed({ content: `Une erreur est survenue lors de la récupération de la valeur de configuration "${key}".` })
	}

	await command.reply({ embeds: [embed], ephemeral: true })
}