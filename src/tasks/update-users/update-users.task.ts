import { client } from "@/client"
import { getGuild } from "@/configs/guild"
import { prisma } from "@/lib/db"
import type { TaskExecute, TaskInterval } from "@/utils/handler/task"
import { logger } from "@/utils/logger"

export const enableInDev = true

export const interval: TaskInterval = "0 * * * * *"

export const execute: TaskExecute = async() => {
	// Récupérer le serveur principal
	const guild = await getGuild(client, "main")

	// Récupérer les membres du serveur qui ne sont pas des bots
	const members = await guild.members.fetch().then(members => members
		.filter(member => !member.user.bot)
		.map(member => ({
			discordId: member.user.id,
			name: member.displayName
		})))
	if (!members) return

	// Récupérer les utilisateurs enregistrés dans la base de données
	const users = await prisma.user.findMany()

	// Supprimer les utilisateurs qui ne sont plus dans le serveur
	// for (const user of users) {
	// 	const member = members.find(member => member.discordId === user.discordId)
	// 	if (member) continue

	// 	await prisma.user.delete({
	// 		where: {
	// 			id: user.id
	// 		}
	// 	})
	// }

	// Mettre à jour les utilisateurs qui sont dans le serveur
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

	// Log
	logger.info("Les utilisateurs ont bien été mis à jour.")
}