import type { EventExecute, EventName } from "@/utils/handler/event"
import { PlayerReportModalSchema, PlayerReportSchema } from "./player-report.util"
import type { CacheType, Interaction, ModalActionRowComponentBuilder } from "discord.js"
import { ButtonStyle, ChannelType } from "discord.js"
import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js"
import { prisma } from "@/lib/db"
import { createCustomEmbed, createErrorEmbed } from "@/utils/discord/components/embed"
import { createRow } from "@/utils/discord/components/row"
import { createButton } from "@/utils/discord/components/button"
import { guilds } from "@/configs/guild"
import { logger } from "@/utils/logger"
import { formatPlayer } from "@/utils/game/players"

export const enableInDev = true

export const event: EventName = "interactionCreate"

const playerReportEvent = async(interaction: Interaction<CacheType>, parsedCustomId: unknown): Promise<void> => {
	const customId = PlayerReportSchema.safeParse(parsedCustomId)
	if (!customId.success) return

	// Vérifier si l'interaction est un bouton
	if (!interaction.isButton()) return

	// Créer un modal
	const modal = new ModalBuilder()
		.setCustomId(JSON.stringify({ type: "playerReportModal" }))
		.setTitle("Signaler un cadavre")

	// Créer un TextInput
	const favoriteColorInput = new TextInputBuilder()
		.setCustomId("reportCode")
		.setLabel("Entrez le code du cadavre :")
		.setStyle(TextInputStyle.Short)

	// Ajouter le TextInput dans une ActionRow
	const modalRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(favoriteColorInput)
	modal.addComponents(modalRow)

	// Afficher le modal
	await interaction.showModal(modal)
}

const playerReportModalEvent = async(interaction: Interaction<CacheType>, parsedCustomId: unknown): Promise<void> => {
	const customId = PlayerReportModalSchema.safeParse(parsedCustomId)
	if (!customId.success) return

	// Vérifier si l'interaction est un modal
	if (!interaction.isModalSubmit()) return

	logger.info("playerReportModalEvent")

	// Récupérer le code du cadavre
	const reportCode = interaction.fields.getTextInputValue("reportCode")
	// Récupérer le joueur
	const reportPlayer = await prisma.player.findFirst({
		where: { reportCode },
		include: { user: true, color: true }
	})

	// Créer un bouton pour supprimer le message
	const deleteMessageButton = createButton({
		id: JSON.stringify({ type: "deleteMessage" }),
		label: "OK",
		style: ButtonStyle.Primary
	})

	// Vérifier si le code du cadavre est valide
	if (!reportPlayer) {
		await interaction.reply({
			embeds: [createErrorEmbed({ content: "Le code du cadavre est invalide." })],
			components: [createRow(deleteMessageButton)]
		})
		return
	}

	// Récupérer le channel admin
	const adminChannel = await interaction.guild?.channels.fetch(guilds.main.channels.admins).catch(() => null)
	if (!adminChannel || adminChannel.type !== ChannelType.GuildText) {
		logger.error("Impossible de récupérer le channel admin.")
		return
	}

	// Envoyer le message dans le channel admin
	await adminChannel.send({
		embeds: [createCustomEmbed({
			title: "Nouveau cadavre signalé",
			content: `Le cadavre du joueur ${formatPlayer(reportPlayer)} a été signalé.
Pour déclencher une réunion d'urgence, utilisez la commande \`/meeting\`.`
		})]
	})

	// Répondre
	await interaction.reply({
		embeds: [createCustomEmbed({
			title: "Cadavre signalé",
			content: `Le cadavre du joueur ${formatPlayer(reportPlayer)} a été signalé.`
		})
		],
		components: [createRow(deleteMessageButton)]
	})
}

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

	await playerReportEvent(interaction, parsedCustomId)
	await playerReportModalEvent(interaction, parsedCustomId)
}