import { prisma } from "@/lib/db"
import { replyError } from "@/utils/discord/command"
import { createButton } from "@/utils/discord/components/button"
import { createCustomEmbed } from "@/utils/discord/components/embed"
import { createRow } from "@/utils/discord/components/row"
import { isAdmin } from "@/utils/discord/roles"
import { dispatchTasks } from "@/utils/game/players"
import type { CommandExecute } from "@/utils/handler/command"
import { ButtonStyle, ChannelType } from "discord.js"

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
	await command.deferReply({ ephemeral: true })

	// Récupérer les tasks
	const tasks = await prisma.playerTask.findMany({
		where: { player: { game, role: "CREWMATE" } },
		include: { task: true }
	})

	// Calculer le pourcentage de tasks réalisées
	const nbTasks = tasks.length
	const nbTasksDone = tasks.filter(task => task.done).length
	const percentage = Math.round(nbTasksDone / nbTasks * 100)

	// Créer une barre de progression avec des emojis
	const progressBar = `${"🟩".repeat(Math.round(percentage / 10)) + "⬛".repeat(10 - Math.round(percentage / 10))} **${percentage}%**`

	const players = await prisma.player.findMany({ where: { game, alive: true } })
	await Promise.all(players.map(async(player) => {
		const channel = await command.guild?.channels.fetch(player.channelId).catch(() => null)
		if (!channel || channel.type !== ChannelType.GuildText) return

		// Envoyer le message de réunion
		await channel.send({
			embeds: [createCustomEmbed({
				title: "🚨 Réunion d'urgence",
				content: "Une réunion d'urgence a été déclenchée.\nArrêtez ce que vous faites et rendez-vous tout de suite dans la salle de réunion !"
			})],
			components: [createRow(createButton({
				id: JSON.stringify({ type: "deleteMessage" }),
				label: "OK",
				style: ButtonStyle.Primary
			}))]
		})

		// Récupérer le message de progression
		const message = await channel.messages.fetch().then(messages => messages.find(message => message.id === player.progressionMessageId))
		if (!message) return

		// Envoyer le message
		await message.edit({
			embeds: [createCustomEmbed({
				title: "📈 Progression de la partie",
				content: `**${nbTasksDone}/${nbTasks}** tasks réalisées\n${progressBar}`
			})]
		})
	}))

	// Répondre
	await command.editReply({
		embeds: [createCustomEmbed({
			title: "🚨 Réunion d'urgence",
			content: "Une réunion d'urgence a été déclenchée."
		})]
	})

	// Redistribuer les tasks
	const playersToDispatch = await prisma.player.findMany({
		where: { game, alive: false, role: "CREWMATE", playerTask: { some: {} } },
		include: { user: true, color: true }
	})
	for (const playerToDispatch of playersToDispatch) {
		await dispatchTasks(playerToDispatch)
	}
}