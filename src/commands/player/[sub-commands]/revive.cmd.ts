import { prisma, prismaConnected } from "@/lib/db"
import { replyError } from "@/utils/discord/command"
import { createSuccessEmbed } from "@/utils/discord/components/embed"
import { isAdmin } from "@/utils/discord/roles"
import type { Color } from "@/utils/game/colors"
import { getColor } from "@/utils/game/colors"
import { formatPlayer } from "@/utils/game/players"
import type { CommandExecute } from "@/utils/handler/command"

export const execute: CommandExecute = async(command) => {
	// Vérifier si l'utilisateur est un administrateur
	if (!await isAdmin(command.member)) {
		await replyError(command, "Vous n'avez pas la permission d'utiliser cette commande.")
		return
	}

	// Vérifier si la base de données est connectée
	if (!await prismaConnected()) {
		await replyError(command, "La base de données n'est pas connectée.")
		return
	}

	// Vérifier si une partie en cours existe
	const game = await prisma.game.findFirst({ where: { status: { in: ["RUNNING", "PAUSED"] } } })
	if (!game) {
		await replyError(command, "Aucune partie est déjà en cours.")
		return
	}

	// Récupérer le joueur à réssuciter
	const colorName = command.options.getString("couleur", true)
	const color = getColor(colorName as Color["name"])
	if (!color) {
		await replyError(command, "La couleur du joueur est invalide.")
		return
	}
	const playerColor = await prisma.playerColor.findFirst({ where: { hex: color.hex } })
	if (!playerColor) {
		await replyError(command, "La couleur du joueur est invalide.")
		return
	}
	const player = await prisma.player.findFirst({
		where: { color: playerColor, game },
		include: { color: true, user: true }
	})
	if (!player) {
		await replyError(command, "Le joueur n'est pas dans la partie.")
		return
	}
	if (player.alive) {
		await replyError(command, "Le joueur est déjà en vie.")
		return
	}

	// Réssuciter le joueur
	await prisma.player.update({ where: { id: player.id }, data: { alive: true } })
	await command.reply({
		embeds: [createSuccessEmbed({
			content: `Le joueur ${formatPlayer(player)} a été réssucité avec succès.`
		})],
		ephemeral: true
	})
}