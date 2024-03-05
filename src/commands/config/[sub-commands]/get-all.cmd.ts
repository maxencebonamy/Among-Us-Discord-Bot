import { prisma } from "@/lib/db"
import { createSuccessEmbed } from "@/utils/discord/components/embed"
import { isAdmin } from "@/utils/discord/roles"
import type { CommandExecute } from "@/utils/handler/command"

export const execute: CommandExecute = async(command) => {
	if (!await isAdmin(command.member)) {
		await command.reply("Vous n'avez pas la permission d'utiliser cette commande.")
		return
	}

	const config = await prisma.config.findMany({
		select: {
			key: true,
			value: true
		}
	}).then(config => {
		const output: Record<string, string> = {}
		Object.entries(config).forEach(([_, value]) => {
			if (value.value === null) return
			output[value.key] = value.value
		})
		return output
	})

	const configString = JSON.stringify(config, null, 4)

	const embed = createSuccessEmbed({ content: `Voici toutes les valeurs de configuration :\n\`\`\`json\n${configString}\`\`\`` })

	await command.reply({ embeds: [embed], ephemeral: true })
}