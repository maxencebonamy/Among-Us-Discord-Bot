import { client } from "@/client"
import { getGuild } from "@/configs/guild"
import { prisma, prismaConnected } from "@/lib/db"
import { replyError } from "@/utils/discord/command"
import { createSuccessEmbed } from "@/utils/discord/components/embed"
import { isAdmin } from "@/utils/discord/roles"
import type { CommandExecute } from "@/utils/handler/command"
import { logger } from "@/utils/logger"

export const execute: CommandExecute = async(command) => {
	// Vérifier si l'utilisateur est un administrateur
	if (!await isAdmin(command.member)) {
		await replyError(command, "Vous n'avez pas la permission d'utiliser cette commande.")
		return
	}

	// Indiquer que la réponse est en cours
	await command.deferReply({ ephemeral: true })

	// Vérifier si la base de données est connectée
	if (!await prismaConnected()) {
		await replyError(command, "La base de données n'est pas connectée.")
		return
	}

	// Récupérer le serveur principal
	const guild = await getGuild(client, "main")
	await guild.members.fetch()

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

	// Réponse
	await command.editReply({
		embeds: [createSuccessEmbed({ content: "Les utilisateurs ont bien été mis à jour." })]
	})
}