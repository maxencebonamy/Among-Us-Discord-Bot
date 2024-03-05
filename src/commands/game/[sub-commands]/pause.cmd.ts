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

	// Vérifier si une partie en cours existe
	const game = await prisma.game.findFirst({ where: { status: { in: ["RUNNING"] } } })
	if (!game) {
		await replyError(command, "Aucune partie est en cours.")
		return
	}

	// Créer le message de confirmation
	const confirmationResponse = await command.reply({
		embeds: [createCustomEmbed({
			title: "🎮 Mise en pause de la partie",
			content: "Êtes-vous sûr de vouloir mettre la partie en pause ?"
		})],
		components: [createRow(createOkButton(), createCancelButton())],
		ephemeral: true
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
					title: "🎮 Mise en pause de la partie",
					content: "La partie n'a pas été mise en pause."
				})],
				components: []
			})
		}
	})
	if (!confirmation) return

	// Mettre la partie en pause
	await prisma.game.update({
		where: {
			id: game.id
		},
		data: {
			status: "PAUSED"
		}
	})
	await command.editReply({
		embeds: [createCustomEmbed({
			title: "🎮 Partie mise en pause",
			content: "La partie a été mise en pause."
		})],
		components: []
	})

	// Log
	const commandUser = await prisma.user.findUnique({ where: { discordId: command.user.id } })
	await log("🎮 Partie mise en pause", `La partie #${game.id} a été mise en pause par ${commandUser?.name ?? "?"}.`)
}