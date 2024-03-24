import type { EventExecute, EventName } from "@/utils/handler/event"
import { PlayerKillSelectSchema } from "./player-kill-select.util"
import { createCustomEmbed, createSuccessEmbed } from "@/utils/discord/components/embed"
import { prisma } from "@/lib/db"
import { logger } from "@/utils/logger"
import { dispatchTasks, formatPlayer } from "@/utils/game/players"
import { createButton } from "@/utils/discord/components/button"
import { ButtonStyle, ChannelType } from "discord.js"
import { createRow } from "@/utils/discord/components/row"

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

	// Récupérer la partie
	const game = await prisma.game.findFirst({ where: { status: { in: ["RUNNING"] } } })
	if (!game) {
		logger.error("Aucune partie en cours.")
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

	// Récupérer le channel du joueur
	const playerChannel = await interaction.guild?.channels.fetch(player.channelId).catch(() => null)
	if (!playerChannel || playerChannel.type !== ChannelType.GuildText) {
		logger.error("Impossible de récupérer le channel du joueur.")
		return
	}

	// Supprimer les messages d'action et de progression
	const playerChannelMessages = await playerChannel.messages.fetch()
	await Promise.all(playerChannelMessages.map(async(message) => {
		if (message.id === player.progressionMessageId || message.id === player.actionMessageId) {
			await message.delete()
		}
	}))

	// Générer le code à 4 chiffres
	const reportCode = Math.floor(1000 + Math.random() * 9000).toString()

	// Envoyer un message
	await playerChannel.send({
		embeds: [createCustomEmbed({
			title: "🔪 Vous avez été éliminé !",
			content: `Allongez-vous par terre et attendez qu'un joueur vous trouve.
Donnez-lui le code suivant pour qu'il puisse signaler votre cadavre :\n# ${reportCode}`
		})]
	})

	// Tuer le joueur
	await prisma.player.update({
		where: { id: player.id },
		data: {
			alive: false,
			reportCode
		}
	})

	// Répondre à l'interaction
	await interaction.reply({
		embeds: [createSuccessEmbed({
			content: `Le joueur ${formatPlayer(player)} a été tué.`
		})],
		components: [createRow(createButton({
			id: JSON.stringify({ type: "deleteMessage" }),
			label: "OK",
			style: ButtonStyle.Primary
		}))]
	})
	await interaction.message.delete()

	// Redistribuer les tasks
	await dispatchTasks(player)
}