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

	// Vérifier si une partie en pause existe
	const game = await prisma.game.findFirst({ where: { status: { in: ["PAUSED"] } } })
	if (!game) {
		await replyError(command, "Aucune partie est en pause.")
		return
	}

	// Créer le message de confirmation
	const confirmationResponse = await command.reply({
		embeds: [createCustomEmbed({
			title: "🎮 Reprise de la partie",
			content: "Êtes-vous sûr de vouloir reprendre la partie ?"
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
					title: "🎮 Reprise de la partie",
					content: "La partie n'a pas été reprise."
				})],
				components: []
			})
		}
	})
	if (!confirmation) return

	// Reprendre la partie
	await prisma.game.update({
		where: {
			id: game.id
		},
		data: {
			status: "RUNNING"
		}
	})
	await command.editReply({
		embeds: [createCustomEmbed({
			title: "🎮 Partie reprise",
			content: "La partie a été reprise."
		})],
		components: []
	})

	// Log
	const commandUser = await prisma.user.findUnique({ where: { discordId: command.user.id } })
	await log("🎮 Partie reprise", `La partie #${game.id} a été reprise par ${commandUser?.name ?? "?"}.`)
}