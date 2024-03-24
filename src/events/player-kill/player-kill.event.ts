import type { EventExecute, EventName } from "@/utils/handler/event"
import { PlayerKillSchema } from "./player-kill.util"
import { createCustomEmbed } from "@/utils/discord/components/embed"
import { createRow } from "@/utils/discord/components/row"
import { StringSelectMenuBuilder } from "discord.js"
import { formatPlayer } from "@/utils/game/players"
import { prisma } from "@/lib/db"
import { logger } from "@/utils/logger"

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
		components: [createRow(playerSelectMenu)]
	})
}