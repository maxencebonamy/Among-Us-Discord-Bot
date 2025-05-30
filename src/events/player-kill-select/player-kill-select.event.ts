import type { EventExecute, EventName } from "@/utils/handler/event"
import { PlayerKillSelectSchema } from "./player-kill-select.util"
import { createCustomEmbed, createSuccessEmbed } from "@/utils/discord/components/embed"
import { prisma } from "@/lib/db"
import { logger } from "@/utils/logger"
import { checkGameEnd, formatPlayer } from "@/utils/game/players"
import { createButton } from "@/utils/discord/components/button"
import { ButtonStyle, ChannelType } from "discord.js"
import { createRow } from "@/utils/discord/components/row"
import { getIntConfig } from "@/commands/game/[sub-commands]/init.util"

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
	const customId = PlayerKillSelectSchema.safeParse(parsedCustomId)
	if (!customId.success) return

	if (!interaction.isStringSelectMenu()) return

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

	if (!impostor.alive) {
		logger.error("Impostor is dead")
		await interaction.message.delete()
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
		await interaction.message.delete()
		return
	}

	// Récupérer le joueur
	const player = await prisma.player.findUnique({
		where: { id: parseInt(interaction.values[0]) },
		include: { user: true, color: true }
	})
	if (!player) {
		logger.error("Joueur non trouvé.")
		return
	}

	// Répondre à l'interaction
	await interaction.reply({
		embeds: [createSuccessEmbed({
			content: `Êtes-vous bien sûr de vouloir tuer ${formatPlayer(player)} ?`
		})],
		components: [createRow(
			createButton({
				id: JSON.stringify({ type: "playerKillConfirm", playerId: player.id }),
				label: "Confirmer",
				style: ButtonStyle.Primary
			}),
			createButton({
				id: JSON.stringify({ type: "deleteMessage" }),
				label: "Annuler",
				style: ButtonStyle.Secondary
			})
		)]
	})
	await interaction.message.delete()
}