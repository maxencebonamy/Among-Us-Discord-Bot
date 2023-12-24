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
	const value = command.options.getString("value", true)

	let embed = null

	try {
		await Config.set({ key, value })
		embed = simpleEmbed(
			`La valeur de configuration "${key}" est maintenant égale à "${value}".`,
			"normal",
			"✅ Valeur modifiée avec succès"
		)
	} catch (error) {
		embed = simpleEmbed(
			`Une erreur est survenue lors de la modification de la valeur de configuration "${key}".`,
			"error",
			"❌ Erreur lors de la modification de la valeur"
		)
	}

	await command.reply({ embeds: [embed], ephemeral: true })
}