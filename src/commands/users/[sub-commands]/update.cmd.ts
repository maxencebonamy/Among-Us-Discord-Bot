import { prisma } from "@/lib/db"
import { createSuccessEmbed } from "@/utils/discord/components/embed"
import type { CommandExecute } from "@/utils/handler/command"

export const execute: CommandExecute = async(command) => {
	const members = await command.guild?.members.fetch().then(members => members
		.filter(member => !member.user.bot)
		.map(member => ({
			discordId: member.user.id,
			name: member.displayName
		})))
	if (!members) return

	const users = await prisma.user.findMany()

	for (const user of users) {
		const member = members.find(member => member.discordId === user.discordId)
		if (member) continue

		await prisma.user.delete({
			where: {
				id: user.id
			}
		})
	}

	for (const member of members) {
		const user = users.find(user => member.discordId === user.discordId)
		if (user) {
			await prisma.user.update({
				where: {
					id: user.id
				},
				data: {
					name: member.name
				}
			})
		} else {
			await prisma.user.create({
				data: {
					discordId: member.discordId,
					name: member.name
				}
			})
		}
	}

	await command.reply({
		embeds: [
			createSuccessEmbed({
				content: "Les utilisateurs ont bien été mis à jour."
			})
		]
	})
}