import { Config } from "@/models/config"
import { simpleEmbed } from "@/utils/discord/embed"
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
		value = await Config.get({ key })
		if (value === null) throw new Error("La valeur est nulle.")
		embed = simpleEmbed(
			`La valeur de configuration "${key}" est égale à "${value}".`,
			"normal",
			"✅ Valeur récupérée avec succès"
		)
	} catch (error) {
		embed = simpleEmbed(
			`Une erreur est survenue lors de la récupération de la valeur de configuration "${key}".`,
			"error",
			"❌ Erreur lors de la récupération de la valeur"
		)
	}

	await command.reply({ embeds: [embed], ephemeral: true })
}