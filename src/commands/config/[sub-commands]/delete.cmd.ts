import { Config } from "@/models/config"
import { createErrorEmbed, createSuccessEmbed } from "@/utils/discord/components/embed"
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
		embed = createSuccessEmbed({ content: `La valeur de configuration "${key}" a été supprimée avec succès.` })
	} catch (error) {
		embed = createErrorEmbed({ content: `Une erreur est survenue lors de la suppression de la valeur de configuration "${key}".` })
	}

	await command.reply({ embeds: [embed], ephemeral: true })
}