/* eslint-disable max-len */

import type { PrismaClient, TaskLevel } from "@prisma/client"
import type { Room } from "./rooms"

type TaskData = {
	name: string
	playerDescription: string
	modoDescription: string
	level: TaskLevel
	room: Room
	emoji: string
}

const TASKS: TaskData[] = [
	{
		name: "Docteur Maboul",
		playerDescription: "Tu dois faire sortir 4 objets du jeu sans faire sonner le docteur maboul. Si jamais tu le fais sonner, tu dois reposer un objet déjà sorti. Tu choisis les objets que tu veux.",
		modoDescription: "Le joueur doit faire sortir 4 objets du jeu sans faire sonner le docteur maboul. Si jamais il le fait sonner, il doit reposer un objet déjà sorti.",
		level: "EASY",
		room: "Hôpital",
		emoji: "🩹"
	},
	{
		name: "Jeu du dino",
		playerDescription: "Tu dois obtenir un score de 50 sur le jeu du dino. Si tu perds avant, tu dois recommencer jusqu'à y arriver.",
		modoDescription: "Le joueur doit obtenir un score de 50 sur le jeu du dino. S'il perd avant il doit recommencer jusqu'à y arriver.",
		level: "EASY",
		room: "Jungle",
		emoji: "🦖"
	},
	{
		name: "Dossier à reconstituer",
		playerDescription: "Tu dois te rendre au centre de contrôle et récupérer un dossier à reconstituer. Tu dois ensuite le reconstituer puis te rendre dans la salle de stockage pour le valider. Si le dossier est incorrect, tu dois retourner au centre de contrôle pour le corriger.",
		modoDescription: `Le joueur va arriver avec une pochette papier ESEO'P avec un numéro de dossier inscrit dessus (récupérée et complétée dans le centre de contrôle).

Afin de valider la tâche, il faut que le dossier à l'intérieur de cette pochette soit valide :
- Le dossier doit comporter toutes les pages (vérifier le bas de chaque feuille)
- Le dossier doit correspondre au numéro inscrit sur la pochette (vérifier le bas de chaque feuille aussi).
		
Si le dossier est incorrect le joueur doit retourner au centre de contrôle pour le corriger.`,
		level: "HARD",
		room: "Stockage",
		emoji: "📂"
	},
	{
		name: "Document officiel",
		playerDescription: "Tu dois te rendre au local de stockage et récupérer une feuille “Spécimen” parmi les pochettes colorées. Tu dois ensuite te rendre au centre de contrôle pour récupérer la même feuille mais sans la mention “Spécimen” puis la ramener au local de stockage.",
		modoDescription: `Le joueur arrive au local de stockage, il fouille les pochettes colorées (une des 4) et récupère une feuille “Spécimen”. Il se rend ensuite au Centre de contrôle pour récupérer la même feuille mais sans la mention “Spécimen” puis la ramène au local de stockage. 

Il donne au modérateur les deux feuilles et le modérateur met le vrai document à la place du “Spécimen” s'ils correspondent bien.`,
		level: "HARD",
		room: "Stockage",
		emoji: "📄"
	},
	{
		name: "Space Invaders",
		playerDescription: "Tu dois valider le niveau 1 du jeu Galaga sur la borne d'arcade.",
		modoDescription: "Le joueur doit valider le niveau 1 du jeu Galaga sur la borne d'arcade.",
		level: "EASY",
		room: "Retro Gaming",
		emoji: "👾"
	},
	{
		name: "Câbles",
		playerDescription: "Tu dois rebrancher les câbles de couleurs correctement en suivant le labyrinthe aux traits noirs situé au dos de la borne d'arcade.",
		modoDescription: "Le joueur doit rebrancher les câbles de couleurs correctement en suivant le labyrinthe aux traits noirs situé au dos de la borne d'arcade.",
		level: "EASY",
		room: "Retro Gaming",
		emoji: "🔌"
	},
	{
		name: "Clé USB",
		playerDescription: `Tu dois te rendre dans la salle hantée et récupérer la clé USB de la couleur suivante : [color].
Tu dois ensuite te rendre au centre de contrôle pour la brancher sur un PC et trouver le fichier “Log.txt” qui contient le texte “Bravo vous avez trouvé le bon fichier”.`,
		modoDescription: `Le joueur arrive dans le centre de contrôle avec une clé USB qu'il a pris dans la salle hantée. Il l'ouvre sur un PC allumé et doit trouvé le fichier “Log.txt” qui contient le texte “Bravo vous avez trouvé le bon fichier”.

Attention à bien vérifier que la couleur de la clé USB correspond bien à l'énoncé de la task sur le téléphone du joueur. Si la couleur n'est pas la bonne, le joueur doit retourner dans la salle hantée pour trouver la bonne clé.`,
		level: "HARD",
		room: "Centre de contrôle",
		emoji: "💾"
	},
	{
		name: "Mini Cluedo",
		playerDescription: "Tu dois te rendre dans la salle hantée, où se trouve une scène de crime. Tu dois récupérer un maximum d'indices te permettant d'élucider ce meurtre et de trouver le coupable. Ensuite, tu dois te rendre dans le bureau de l'inspecteur et à partir des différents suspects, identifier le coupable.",
		modoDescription: `Le joueur revient de la salle hantée avec en tête les différents indices de la scène de crime. Il doit ouvrir le classeur sur le bureau de l'inspecteur qui contient les photos des différents suspects.

Afin de valider la tâche, le joueur doit donner le nom du coupable au modérateur. Si jamais il se trompe ne le laissez pas proposer tout de suite une solution. Laissez le attendre ou ne répondez pas à ses propositions pendant un laps de temps (cela évite qu'il donne tous les noms à la suite).`,
		level: "HARD",
		room: "Bureau de l'inspecteur",
		emoji: "🔍"
	},
	{
		name: "Crack the code",
		playerDescription: "Tu dois te rendre dans le bureau de l'inspecteur, où se trouve un boitier à code. Tu dois résoudre les énigmes pour trouver le code à 4 chiffres qui te permettra d'ouvrir le boitier.",
		modoDescription: `Le joueur arrive dans le bureau de l'inspecteur, des énigmes sont disposées sur le bureau. Ces énigmes permettent de trouver un code à 4 chiffres qui permet d'ouvrir le boitier à code.

Le modérateur valide la tâche dès lors que le joueur a réussi à ouvrir le boitier.`,
		level: "HARD",
		room: "Bureau de l'inspecteur",
		emoji: "🔐"
	},
	{
		name: "Boules",
		playerDescription: "Tu dois réussir à trouver la balle correspondant au numéro [number] dans la bassine qui contient 100 balles numérotées.",
		modoDescription: "Le joueur doit réussir à retrouver la balle correspondant au numéro qui lui a été attribuée dans la bassine qui contient 100 balles numérotées. Attention à vérifier le numéro attribué au joueur sur son téléphone avant de valider la tâche.",
		level: "HARD",
		room: "Salle de jeu",
		emoji: "🎱"
	},
	{
		name: "Anneaux",
		playerDescription: "Tu dois réussir à placer 3 anneaux sur les piquets. Si tu n'y arrives pas, tu récupères les anneaux perdus pour les relancer. La progression est sauvegardée.",
		modoDescription: `Le joueur doit réussir à placer 3 anneaux sur les piquets. Il se place à 2m et a 5 anneaux à sa disposition.

S'il ne réussit pas à mettre les 3 anneaux sur les 5, il récupère les anneaux perdus pour pouvoir les relancer. La progression est quand même sauvegardée.`,
		level: "EASY",
		room: "Salle de jeu",
		emoji: "⭕"
	},
	{
		name: "Puzzle",
		playerDescription: "Tu dois reconstituer le puzzle composée de 28 pièces. Pour valider la tâche, tu dois penser à dire “Est ce que c'est bon pour vous ?”.",
		modoDescription: `Le joueur doit reconstituer le puzzle composée de 28 pièces. 

Pour valider la tâche, regardez si le puzzle est terminé et le joueur doit vous dire “Est ce que c'est bon pour vous ?”`,
		level: "HARD",
		room: "Salle de jeu",
		emoji: "🧩"
	},
	{
		name: "Beer Pong",
		playerDescription: "Tu dois réussir à rentrer 2 balles dans deux gobelets en 5 tentatives. Si tu n'y arrives pas en 5 tentatives, tu recommences depuis le début.",
		modoDescription: "Le joueur doit réussir à rentrer 2 balles dans deux gobelets en 5 tentatives. S'il n'y arrive pas en 5 tentatives, il recommence depuis le début.",
		level: "EASY",
		room: "Réfectoire",
		emoji: "🍺"
	},
	{
		name: "Recettes de cuisine",
		playerDescription: "Tu dois demander au modérateur ce qu'il souhaite manger. Tu dois ensuite trouver les fiches recettes correspondantes et les ingrédients nécessaires pour les réaliser. Pour valider la tâche, les ingrédients doivent correspondre aux recettes.",
		modoDescription: `Le joueur vient vous voir et vous demande ce que vous souhaitez manger. Vous pouvez donc lui donner soit 1 recette compliquée ou 2 recettes simples. 
		
Le joueur doit trouver la fiche recette correspondante, prendre un ou deux saladiers (en fonction du nombre de recettes) et rassembler les éléments nécessaires.
		
Pour valider la tâche, les ingrédients doivent correspondre aux recettes.`,
		level: "HARD",
		room: "Réfectoire",
		emoji: "🍳"
	},
	{
		name: "Lancer de balles",
		playerDescription: "Tu dois mettre une balle dans la cible pour valider la tâche.",
		modoDescription: `Le joueur doit se rendre au pont supérieur pour essayer de mettre une balle dans la cible. Tant qu'il ne réussit pas, il continue d'essayer. 
		
S'il n'arrive pas avec les balles à disposition, le modérateur met les balles dans un sac et le joueur remonte le sac grâce à la corde.
		
La tâche est validée dès qu'il met une balle dans le contenant.`,
		level: "EASY",
		room: "Pont supérieur",
		emoji: "⚾"
	},
	{
		name: "Lodidibon",
		playerDescription: "Tu dois te rendre aux toilettes du pont supérieur pour remplir une bouteille jusqu'au trait. Tu dois ensuite te rendre au pont inférieur, montrer la bouteille remplie au modérateur pour faire valider la tâche, puis la vider dans les toilettes du pont inférieur.",
		modoDescription: "Le joueur se rend d'abord aux toitelles du pont supérieur pour remplir une bouteille jusqu'au trait. Il doit ensuite se rendre au pont inférieur, montrer la bouteille remplie au modérateur pour faire valider la tâche, puis la vider dans les toilettes du pont inférieur.",
		level: "HARD",
		room: "Pont inférieur",
		emoji: "⛽"
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
					playerDescription: taskData.playerDescription,
					modoDescription: taskData.modoDescription,
					level: taskData.level,
					room: { connect: { name: taskData.room } },
					emoji: taskData.emoji
				}
			})
		})
	)

	console.log("Seeding tasks completed ✅")
}