import { prisma } from "@/lib/db"
import { log } from "@/utils/discord/channels"
import { replyError } from "@/utils/discord/command"
import { createCancelButton, createOkButton } from "@/utils/discord/components/button"
import { createCustomEmbed } from "@/utils/discord/components/embed"
import { createRow } from "@/utils/discord/components/row"
import { isAdmin } from "@/utils/discord/roles"
import type { CommandExecute } from "@/utils/handler/command"

export const execute: CommandExecute = async(command) => {
	// Vérifier si l'utilisateur est un administrateur
	if (!await isAdmin(command.member)) {
		await replyError(command, "Vous n'avez pas la permission d'utiliser cette commande.")
		return
	}

	// Vérifier si une partie en attente ou en cours existe
	const game = await prisma.game.findFirst({ where: { status: { in: ["WAITING", "STARTED"] } } })
	if (!game) {
		await replyError(command, "Aucune partie est en attente ou en cours.")
		return
	}

	// Créer le message de confirmation
	const confirmationResponse = await command.reply({
		embeds: [createCustomEmbed({
			title: "🎮 Annulation de la partie",
			content: "Êtes-vous sûr de vouloir annuler la partie ?"
		})],
		components: [createRow(createOkButton(), createCancelButton())]
	})

	// Attendre la confirmation
	let confirmation = true
	await confirmationResponse.awaitMessageComponent({
		filter: interaction => interaction.customId === "ok" || interaction.customId === "cancel",
		time: 300_000  // 5 min
	}).then(async interaction => {
		if (interaction.customId !== "ok") {
			confirmation = false
			await command.editReply({
				embeds: [createCustomEmbed({
					title: "🎮 Annulation de la partie",
					content: "La partie n'a pas été annulée."
				})],
				components: []
			})
		}
	})
	if (!confirmation) return

	// Annuler la partie
	await prisma.game.update({
		where: {
			id: game.id
		},
		data: {
			status: "FINISHED"
		}
	})
	await command.editReply({
		embeds: [createCustomEmbed({
			title: "🎮 Partie annulée",
			content: "La partie a été annulée."
		})],
		components: []
	})

	// Supprimer les channels des joueurs
	const players = await prisma.player.findMany({ where: { game } })
	for (const player of players) {
		const channel = await command.guild?.channels.fetch(player.channelId)
		if (channel) {
			await channel.delete()
		}
	}

	// Log
	const commandUser = await prisma.user.findUnique({ where: { discordId: command.user.id } })
	await log("🎮 Partie annulée", `La partie #${game.id} a été annulée par ${commandUser?.name ?? "?"}.`)
}