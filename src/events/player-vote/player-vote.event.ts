import type { EventExecute, EventName } from "@/utils/handler/event"
import { PlayerVoteSchema } from "./player-vote.util"
import { logger } from "@/utils/logger"
import { prisma } from "@/lib/db"
import { createSuccessEmbed } from "@/utils/discord/components/embed"
import { ChannelType } from "discord.js"

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
	const customId = PlayerVoteSchema.safeParse(parsedCustomId)
	if (!customId.success) return

	// Récupérer les données
	const { voteId } = customId.data

	if (!interaction.isStringSelectMenu()) return

	// Récupérer le vote
	const vote = await prisma.vote.findUnique({ where: { id: voteId } })
	if (!vote) {
		logger.error("Vote not found")
		return
	}

	// Récupérer l'auteur du vote
	const channel = interaction.channel
	if (!channel || channel.type !== ChannelType.GuildText) {
		logger.error("Vote channel not found")
		return
	}
	const playerChannel = await prisma.player.findFirst({ where: { channelId: channel.id } })
	if (!playerChannel) {
		logger.error("Player not found")
		return
	}

	// Créer le vote du joueur
	await prisma.playerVote.create({
		data: {
			voteId,
			targetId: interaction.values[0] === "pass" ? null : parseInt(interaction.values[0]),
			authorId: playerChannel.id
		}
	})

	// Répondre à l'interaction
	await interaction.reply({
		embeds: [createSuccessEmbed({
			content: "Votre vote a bien été pris en compte !"
		})],
		ephemeral: true
	})
	await interaction.message.delete()
}