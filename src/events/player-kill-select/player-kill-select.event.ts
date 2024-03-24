import type { EventExecute, EventName } from "@/utils/handler/event"
import { PlayerKillSelectSchema } from "./player-kill-select.util"
import { createCustomEmbed, createSuccessEmbed } from "@/utils/discord/components/embed"
import { prisma } from "@/lib/db"
import { logger } from "@/utils/logger"
import { checkGameEnd, dispatchTasks, formatPlayer } from "@/utils/game/players"
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

	// Récupérer la partie
	const game = await prisma.game.findFirst({ where: { status: { in: ["RUNNING"] } } })
	if (!game) {
		logger.error("Aucune partie en cours.")
		return
	}

	// Récupérer la variable de config pour le cooldown
	const killCooldown = await getIntConfig("KILL_COOLDOWN")
	if (!killCooldown) {
		logger.error("La variable de configuration \"KILL_COOLDOWN\" n'a pas été trouvée.")
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

	// Cooldown
	await prisma.player.updateMany({
		where: { channelId: channel.id },
		data: { cooldown: new Date(Date.now() + 1000 * killCooldown) }
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
	// await dispatchTasks(player)
	await checkGameEnd()
}