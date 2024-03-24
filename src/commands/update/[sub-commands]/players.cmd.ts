import { prisma } from "@/lib/db"
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

	// Récupérer le serveur principal
	const guild = command.guild
	if (!guild) {
		await replyError(command, "Impossible de récupérer le serveur.")
		return
	}
	await guild.channels.fetch()

	// Récupérer tous les channels de joueurs
	const players = await prisma.player.findMany({
		where: { game: { status: { in: ["CANCELED", "FINISHED"] } } },
		select: { channelId: true }
	})
	await Promise.all(players.map(async player => {
		const channel = await guild.channels.fetch(player.channelId).catch(() => null)
		if (!channel) return
		await channel.delete()
	}))

	// Log
	logger.info("Les channels de joueurs ont bien été mis à jour.")

	// Réponse
	await command.editReply({
		embeds: [createSuccessEmbed({ content: "Les channels de joueurs ont bien été mis à jour." })]
	})
}