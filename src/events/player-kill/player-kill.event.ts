import type { EventExecute, EventName } from "@/utils/handler/event"
import { PlayerKillSchema } from "./player-kill.util"
import { createCustomEmbed } from "@/utils/discord/components/embed"
import { createRow } from "@/utils/discord/components/row"
import { ButtonStyle, ChannelType, StringSelectMenuBuilder } from "discord.js"
import { formatPlayer } from "@/utils/game/players"
import { prisma } from "@/lib/db"
import { logger } from "@/utils/logger"
import { createButton } from "@/utils/discord/components/button"

export const enableInDev = true

export const event: EventName = "interactionCreate"

export const execute: EventExecute<"interactionCreate"> = async(interaction) => {
	// Vérifier si l'interaction est une complétion de task
	if (!interaction.isMessageComponent()) return
	let parsedCustomId = null
	try {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		parsedCustomId = JSON.parse(interaction.customId)
	} catch (error) {
		return
	}
	const customId = PlayerKillSchema.safeParse(parsedCustomId)
	if (!customId.success) return

	// Récupérer les données
	// const {  } = customId.data

	// Vérifier si une partie en cours existe
	const game = await prisma.game.findFirst({ where: { status: { in: ["RUNNING"] } } })
	if (!game) {
		logger.error("Aucune partie en cours.")
		return
	}

	// Récupérer l'auteur du kill
	const channel = interaction.channel
	if (!channel || channel.type !== ChannelType.GuildText) {
		logger.error("Vote channel not found")
		return
	}
	const impostor = await prisma.player.findFirst({ where: { channelId: channel.id } })
	if (!impostor) {
		logger.error("Impostor not found")
		return
	}

	// Vérifier si l'imposteur a un cooldown
	if (impostor.cooldown && Date.now() < impostor.cooldown.getTime()) {
		const remainingTime = Math.round((impostor.cooldown.getTime() - Date.now()) / 1000)
		await interaction.reply({
			embeds: [createCustomEmbed({
				title: "🔪 Tuer un joueur",
				content: `Vous devez attendre **${remainingTime} secondes** pour tuer un autre joueur.`
			})],
			components: [createRow(createButton({
				id: JSON.stringify({ type: "deleteMessage" }),
				label: "OK",
				style: ButtonStyle.Primary
			}))]
		})
		return
	}

	// Créer le menu de sélection des joueurs
	const players = await prisma.player.findMany({
		where: { game, alive: true, role: "CREWMATE" },
		include: { user: true, color: true }
	})
	const playerSelectMenu = new StringSelectMenuBuilder({
		customId: JSON.stringify({ type: "playerKillSelect" }),
		placeholder: "Sélectionnez le joueur",
		minValues: 1,
		maxValues: 1,
		options: players.map(player => ({
			label: formatPlayer(player),
			value: player.id.toString()
		}))
	})

	// Sélectionner le joueur
	await interaction.reply({
		embeds: [createCustomEmbed({
			title: "🔪 Tuer un joueur",
			content: "Sélectionner le joueur à tuer."
		})],
		components: [createRow(playerSelectMenu), createRow(createButton({
			id: JSON.stringify({ type: "deleteMessage" }),
			label: "Annuler",
			style: ButtonStyle.Secondary
		}))]
	})
}