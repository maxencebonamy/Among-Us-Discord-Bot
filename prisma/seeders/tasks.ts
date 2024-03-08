/* eslint-disable max-len */

import type { PrismaClient, TaskLevel } from "@prisma/client"
import type { Room } from "./rooms"

type TaskData = {
	name: string
	description: string
	level: TaskLevel
	rooms: Room[]
}

const TASKS: TaskData[] = [
	{
		name: "Docteur Maboul",
		description: "Retirer X items du corps sans faire sonner le jeu. Sinon il faut recommencer les X items. Les X items sont au choix du joueur.",
		level: "EASY",
		rooms: ["Admin"]
	},
	{
		name: "Dossier à reconstituer",
		description: "Le joueur soit reconstituer un dossier en allant les chercher les X pages dans la salle hantée, il doit après ramener le dossier constitué dans la salle de stockage auprès du Modo.",
		level: "HARD",
		rooms: ["Salle hantée", "Stockage"]
	},
	{
		name: "Échanger les documents",
		description: "Le joueur doit récupérer un exemplaire officiel d'un document dans le centre de contrôle et le replacer dans la pochette correspondante dans la salle de stockage.",
		level: "MEDIUM",
		rooms: ["Centre de contrôle", "Stockage"]
	},
	{
		name: "T-Rex",
		description: "Le joueur doit réaliser un score de X pour valider la tâche.",
		level: "EASY",
		rooms: ["Jungle"]
	},
	{
		name: "Pêche aux canards",
		description: "Le joueur doit remonter X canards pour valider la tâche.",
		level: "EASY",
		rooms: ["Couloir du haut"]
	},
	{
		name: "Space Invaders",
		description: "Le joueur doit atteindre X en score au jeu.",
		level: "EASY",
		rooms: ["Retro Gaming"]
	},
	{
		name: "Rebrancher les câbles",
		description: "Le joueur passe derrière la borne d'arcade et doit rebrancher les câbles. Le modo valide le branchement.",
		level: "EASY",
		rooms: ["Retro Gaming"]
	},
	{
		name: "Remplir le réservoir",
		description: "Le joueur remplit son jerrycan au premier étage devant les toilettes, il doit aller le vider au rdc vers les toilettes.",
		level: "HARD",
		rooms: ["Couloir du bas"]
	},
	{
		name: "Clé USB",
		description: "Le joueur doit retrouver une clé USB (qui porte sa couleur) dans la salle hantée, et doit aller la brancher dans le centre de contrôle. Il recherche alors dans son contenu le code caché.",
		level: "HARD",
		rooms: ["Salle hantée", "Centre de contrôle"]
	},
	{
		name: "Mini Cluedo",
		description: "Le joueur doit fouiller la salle hantée afin de trouver des indices sur le coupable. Il doit les mémoriser et aller au bureau de l'inspecteur pour consulter les différents suspects. Il doit alors dire au modo le nom du coupable et l'arme du crime.",
		level: "HARD",
		rooms: ["Salle hantée", "Bureau"]
	},
	{
		name: "Crack the code",
		description: "Le joueur doit ouvrir le cadenas à code présent dans la pièce, en utilisant les différents indices qui seront accrochés sur les murs ou sur le bureau.",
		level: "MEDIUM",
		rooms: ["Bureau"]
	},
	{
		name: "Balles numérotées",
		description: "Le joueur doit retrouver la balle avec le numéro qui lui a été attribué et la montrer au modo.",
		level: "MEDIUM",
		rooms: ["Salle de jeu"]
	},
	{
		name: "Anneaux",
		description: "Le joueur doit réussir à placer X anneaux autours du poteau. Le joueur est placé a une certaine distance du poteau.",
		level: "EASY",
		rooms: ["Salle de jeu"]
	},
	{
		name: "Puzzle",
		description: "Le joueur doit réaliser un puzzle (entre 20 et 30 pièces) et montrer le résultat final au modo.",
		level: "EASY",
		rooms: ["Salle de jeu"]
	},
	{
		name: "Beer Pong",
		description: "Le joueur doit lancer X balles dans des gobelets posés sur une table à une certaine distance",
		level: "EASY",
		rooms: ["Réfectoire"]
	}
] as const

export const seedTasks = async(prisma: PrismaClient): Promise<void> => {
	console.log("Seeding tasks...")

	await prisma.task.deleteMany({})

	await Promise.all(
		TASKS.map(async(taskData) => {
			const task = await prisma.task.create({
				data: {
					name: taskData.name,
					description: taskData.description,
					level: taskData.level
				}
			})

			for (const roomName of taskData.rooms) {
				const room = await prisma.room.findFirst({ where: { name: roomName } })
				if (!room) continue
				await prisma.roomTask.create({
					data: {
						room: { connect: { id: room.id } },
						task: { connect: { id: task.id } }
					}
				})
			}
		})
	)

	console.log("Seeding tasks completed ✅")
}