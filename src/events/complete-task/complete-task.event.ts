import type { EventExecute, EventName } from "@/utils/handler/event"
import { CompleteTaskSchema } from "./complete-task.util"
import { prisma } from "@/lib/db"
import { ChannelType } from "discord.js"
import { logger } from "@/utils/logger"
import { createCustomEmbed } from "@/utils/discord/components/embed"
import { formatPlayer } from "@/utils/game/players"
import { createRow } from "@/utils/discord/components/row"
import { createCancelButton, createOkButton } from "@/utils/discord/components/button"

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
	const customId = CompleteTaskSchema.safeParse(parsedCustomId)
	if (!customId.success) return

	// Récupérer les données
	const { playerId, taskId } = customId.data
	const playerTask = await prisma.playerTask.findFirst({
		// eslint-disable-next-line camelcase
		where: { playerId: playerId, taskId: taskId },
		include: { task: true, player: { include: { color: true, user: true } } }
	})
	if (!playerTask) return

	// Confirmer l'interaction
	// const confirmation = await interaction.reply({
	// 	embeds: [createCustomEmbed({
	// 		title: "📄 Compléter la task",
	// 		content: `Valider la task **${playerTask.task.emoji} ${playerTask.task.name}** pour **${formatPlayer(playerTask.player)}** ?`
	// 	})],
	// 	ephemeral: true,
	// 	components: [createRow(createOkButton(), createCancelButton())]
	// })
	// const confirmed = await confirmation.awaitMessageComponent({
	// 	// filter: interaction => interaction.customId === "ok" || interaction.customId === "cancel",
	// 	time: 300_000  // 5 min
	// }).then(interaction => {
	// 	logger.info(`La task ${playerTask.task.emoji} ${playerTask.task.name} pour ${formatPlayer(playerTask.player)} a été confirmée.`)

	// 	return interaction.customId === "ok"
	// })
	// await confirmation.delete()
	// if (!confirmed) return

	// Mettre à jour la task
	await prisma.playerTask.update({
		// eslint-disable-next-line camelcase
		where: { id: playerTask.id },
		data: { done: true }
	})

	// Récupérer le serveur principal
	const guild = interaction.guild
	if (!guild) {
		logger.error("Impossible de récupérer le serveur.")
		return
	}

	// Récupérer le channel du joueur
	const playerChannel = await guild.channels.fetch(playerTask.player.channelId).catch(() => null)
	if (!playerChannel || playerChannel.type !== ChannelType.GuildText) {
		logger.error("Impossible de récupérer le channel du joueur.")
		return
	}

	// Récupérer le message de task du joueur
	const message = await playerChannel.messages.fetch(playerTask.playerMessageId ?? "").catch(() => null)
	if (!message) {
		logger.error("Impossible de récupérer le message de la task.")
		return
	}
	await message.delete()

	// Supprimer le message
	await interaction.message.delete()
}