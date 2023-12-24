import { Config } from "@/models/config"
import { simpleEmbed } from "@/utils/discord/embed"
import { isAdmin } from "@/utils/discord/roles"
import type { CommandExecute } from "@/utils/handler/command"

export const execute: CommandExecute = async(command) => {
	if (!await isAdmin(command.member)) {
		await command.reply("Vous n'avez pas la permission d'utiliser cette commande.")
		return
	}

	const config = await Config.getAll()

	const configString = JSON.stringify(config, null, 4)

	const embed = simpleEmbed(
		`Voici toutes les valeurs de configuration :\n\`\`\`json\n${configString}\`\`\``,
		"normal",
		"✅ Valeurs récupérées avec succès"
	)

	await command.reply({ embeds: [embed], ephemeral: true })
}