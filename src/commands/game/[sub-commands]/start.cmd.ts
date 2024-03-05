import { prisma } from "@/lib/db"
import { log } from "@/utils/discord/channels"
import { replyError } from "@/utils/discord/command"
import { createCustomEmbed } from "@/utils/discord/components/embed"
import { isAdmin } from "@/utils/discord/roles"
import type { CommandExecute } from "@/utils/handler/command"
import { ChannelType } from "discord.js"
import { texts } from "./start.util"
import { formatPlayer } from "@/utils/game/players"

export const execute: CommandExecute = async(command) => {
	// Vérifier si l'utilisateur est un administrateur
	if (!await isAdmin(command.member)) {
		await replyError(command, "Vous n'avez pas la permission d'utiliser cette commande.")
		return
	}

	// Vérifier si une partie en attente existe
	const game = await prisma.game.findFirst({ where: { status: { in: ["WAITING"] } } })
	if (!game) {
		await replyError(command, "Aucune partie est en attente.")
		return
	}

	// Lancer la partie
	await prisma.game.update({
		where: {
			id: game.id
		},
		data: {
			status: "RUNNING"
		}
	})

	// Envoyer un message dans chaque salon de joueur
	const players = await prisma.player.findMany({ where: { gameId: game.id }, include: { user: true, color: true } })
	for (const player of players) {
		const playerChannel = await command.guild?.channels.fetch(player.channelId)
		if (!playerChannel) continue
		if (playerChannel.type !== ChannelType.GuildText) continue

		let content = ""
		if (player.role === "IMPOSTOR") {
			const impostor = players.find(p => p.id !== player.id && p.role === "IMPOSTOR")
			if (!impostor) continue
			content += texts.IMPOSTOR.replace("[impostor]", formatPlayer(impostor))
		} else {
			content += texts.CREWMATE
		}

		await playerChannel.send({
			embeds: [createCustomEmbed({
				title: "🎮 Début de la partie",
				content
			})]
		})
	}

	// Répondre
	await command.reply({
		embeds: [createCustomEmbed({
			title: "🎮 Lancement de la partie",
			content: "La partie a été lancée."
		})],
		ephemeral: true
	})

	// Log
	const commandUser = await prisma.user.findUnique({ where: { discordId: command.user.id } })
	await log("🎮 Partie lancée", `La partie #${game.id} a été lancée par ${commandUser?.name ?? "?"}.`)
}