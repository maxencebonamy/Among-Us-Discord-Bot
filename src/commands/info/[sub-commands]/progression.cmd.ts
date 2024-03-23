import { prisma } from "@/lib/db"
import { replyError } from "@/utils/discord/command"
import { createCustomEmbed } from "@/utils/discord/components/embed"
import { isAdmin } from "@/utils/discord/roles"
import type { CommandExecute } from "@/utils/handler/command"

export const execute: CommandExecute = async(command) => {
	// Vérifier si l'utilisateur est un administrateur
	if (!await isAdmin(command.member)) {
		await replyError(command, "Vous n'avez pas la permission d'utiliser cette commande.")
		return
	}

	// Récupérer la partie en cours
	const game = await prisma.game.findFirst({ where: { status: { in: ["RUNNING"] } } })
	if (!game) {
		await command.reply("Aucune partie en cours.")
		return
	}

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

	// Envoyer le message
	await command.reply({
		embeds: [createCustomEmbed({
			title: "📈 Progression de la partie",
			content: `**${nbTasksDone}/${nbTasks}** tasks réalisées\n${progressBar}`
		})],
		ephemeral: true
	})
}