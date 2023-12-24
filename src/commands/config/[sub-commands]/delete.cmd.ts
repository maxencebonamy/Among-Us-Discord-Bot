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

	let embed = null

	try {
		await Config.delete({ key })
		embed = simpleEmbed(
			`La valeur de configuration "${key}" a été supprimée avec succès.`,
			"normal",
			"✅ Valeur supprimée avec succès"
		)
	} catch (error) {
		embed = simpleEmbed(
			`Une erreur est survenue lors de la suppression de la valeur de configuration "${key}".`,
			"error",
			"❌ Erreur lors de la suppression de la valeur"
		)
	}

	await command.reply({ embeds: [embed], ephemeral: true })
}