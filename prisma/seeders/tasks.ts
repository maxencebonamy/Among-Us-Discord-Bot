/* eslint-disable max-len */

import type { PrismaClient, TaskLevel } from "@prisma/client"
import type { Room } from "./rooms"

type TaskData = {
	name: string
	description: string
	level: TaskLevel
	room: Room
	emoji: string
}

const TASKS: TaskData[] = [
	{
		name: "Docteur Maboul",
		description: "Retirer X items du corps sans faire sonner le jeu. Sinon il faut recommencer les X items. Les X items sont au choix du joueur.",
		level: "EASY",
		room: "Hôpital",
		emoji: "🩹"
	},
	{
		name: "Dossier à reconstituer",
		description: "Le joueur soit reconstituer un dossier en allant les chercher les X pages dans la salle hantée, il doit après ramener le dossier constitué dans la salle de stockage auprès du Modo.",
		level: "HARD",
		room: "Stockage",
		emoji: "📂"
	},
	{
		name: "Document officiel",
		description: "Le joueur doit récupérer un exemplaire officiel d'un document dans le centre de contrôle et le replacer dans la pochette correspondante dans la salle de stockage.",
		level: "EASY",
		room: "Stockage",
		emoji: "📄"
	},
	{
		name: "Jeu du dino",
		description: "Le joueur doit réaliser un score de X pour valider la tâche.",
		level: "EASY",
		room: "Jungle",
		emoji: "🦖"
	},
	{
		name: "Lancer de pochons",
		description: "Le joueur doit remonter X canards pour valider la tâche.",
		level: "EASY",
		room: "Pont supérieur",
		emoji: "💰"
	},
	{
		name: "Space Invaders",
		description: "Le joueur doit atteindre X en score au jeu.",
		level: "EASY",
		room: "Retro",
		emoji: "👾"
	},
	{
		name: "Câbles",
		description: "Le joueur passe derrière la borne d'arcade et doit rebrancher les câbles. Le modo valide le branchement.",
		level: "EASY",
		room: "Retro",
		emoji: "🔌"
	},
	{
		name: "Lodidibon",
		description: "Le joueur remplit son jerrycan au premier étage devant les toilettes, il doit aller le vider au rdc vers les toilettes.",
		level: "HARD",
		room: "Pont inférieur",
		emoji: "⛽"
	},
	{
		name: "Clé USB",
		description: "Le joueur doit retrouver une clé USB (qui porte sa couleur) dans la salle hantée, et doit aller la brancher dans le centre de contrôle. Il recherche alors dans son contenu le code caché.",
		level: "HARD",
		room: "Centre de contrôle",
		emoji: "💾"
	},
	{
		name: "Mini Cluedo",
		description: "Le joueur doit fouiller la salle hantée afin de trouver des indices sur le coupable. Il doit les mémoriser et aller au bureau de l'inspecteur pour consulter les différents suspects. Il doit alors dire au modo le nom du coupable et l'arme du crime.",
		level: "HARD",
		room: "Bureau",
		emoji: "🔍"
	},
	{
		name: "Crack the code",
		description: "Le joueur doit ouvrir le cadenas à code présent dans la pièce, en utilisant les différents indices qui seront accrochés sur les murs ou sur le bureau.",
		level: "HARD",
		room: "Bureau",
		emoji: "🔐"
	},
	{
		name: "Boules",
		description: "Le joueur doit retrouver la balle avec le numéro qui lui a été attribué et la montrer au modo.",
		level: "HARD",
		room: "Salle de jeu",
		emoji: "🎱"
	},
	{
		name: "Anneaux",
		description: "Le joueur doit réussir à placer X anneaux autours du poteau. Le joueur est placé a une certaine distance du poteau.",
		level: "EASY",
		room: "Salle de jeu",
		emoji: "⭕"
	},
	{
		name: "Puzzle",
		description: "Le joueur doit réaliser un puzzle (entre 20 et 30 pièces) et montrer le résultat final au modo.",
		level: "HARD",
		room: "Salle de jeu",
		emoji: "🧩"
	},
	{
		name: "Beer Pong",
		description: "Le joueur doit lancer X balles dans des gobelets posés sur une table à une certaine distance",
		level: "EASY",
		room: "Réfectoire",
		emoji: "🍺"
	},
	{
		name: "Recettes de cuisine",
		description: "Le joueur doit réaliser une recette de cuisine, le modo valide la recette.",
		level: "HARD",
		room: "Réfectoire",
		emoji: "🍳"
	}
] as const

export const seedTasks = async(prisma: PrismaClient): Promise<void> => {
	console.log("Seeding tasks...")

	await prisma.task.deleteMany({})

	await Promise.all(
		TASKS.map(async(taskData) => {
			await prisma.task.create({
				data: {
					name: taskData.name,
					description: taskData.description,
					level: taskData.level,
					room: { connect: { name: taskData.room } },
					emoji: taskData.emoji
				}
			})
		})
	)

	console.log("Seeding tasks completed ✅")
}