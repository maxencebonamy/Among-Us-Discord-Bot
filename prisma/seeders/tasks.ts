/* eslint-disable max-len */

import type { PrismaClient, TaskLevel } from "@prisma/client"
import type { Room } from "./rooms"

type TaskData = {
	name: string
	playerDescription: string
	modoDescription: string
	level: TaskLevel
	room: Room
	validationRoom: Room
	emoji: string
}

const TASKS: TaskData[] = [
	{
		name: "Docteur Maboul",
		playerDescription: "Le patient est souffrant ! Retirez-lui 4 objets sans que son nez devienne rouge ! Attention : 1 erreur et c'est 1 objet à reposer !",
		modoDescription: "Le joueur doit faire sortir 4 objets du jeu sans faire sonner le docteur maboul. Si jamais il le fait sonner, il doit reposer un objet déjà sorti.",
		level: "EASY",
		room: "Hôpital",
		validationRoom: "Hôpital",
		emoji: "🩹"
	},
	{
		name: "Jeu du dino",
		playerDescription: "Sans connexion, atteignez le score de 50 sur ce jeu du Dino !",
		modoDescription: "Le joueur doit obtenir un score de 50 sur le jeu du dino. S'il perd avant il doit recommencer jusqu'à y arriver.",
		level: "EASY",
		room: "Jungle",
		validationRoom: "Jungle",
		emoji: "🦖"
	},
	{
		name: "Dossier à reconstituer",
		playerDescription: "Après avoir choisi un dossier à l'entrée du centre de contrôle, reconstituez-le avec les pages correspondantes. Faites attention au numéro de dossier ! Déposez ensuite le dossier complété dans la salle de stockage.",
		modoDescription: `Le joueur va arriver avec une pochette papier ESEO'P avec un numéro de dossier inscrit dessus (récupérée et complétée dans le centre de contrôle).

Afin de valider la tâche, il faut que le dossier à l'intérieur de cette pochette soit valide :
- Le dossier doit comporter toutes les pages (vérifier le bas de chaque feuille)
- Le dossier doit correspondre au numéro inscrit sur la pochette (vérifier le bas de chaque feuille aussi).
		
Si le dossier est incorrect le joueur doit retourner au centre de contrôle pour le corriger.`,
		level: "HARD",
		room: "Centre de contrôle",
		validationRoom: "Stockage",
		emoji: "📂"
	},
	{
		name: "Document officiel",
		playerDescription: "Fouillez une des pochettes colorées dans la salle de stockage. Après avoir trouvé une feuille « Spécimen », rendez-vous dans le centre de contrôle pour trouver la feuille originale. Retournez à la salle de stockage pour donner les deux feuilles au modo.",
		modoDescription: `Le joueur arrive au local de stockage, il fouille les pochettes colorées (une des 4) et récupère une feuille “Spécimen”. Il se rend ensuite au Centre de contrôle pour récupérer la même feuille mais sans la mention “Spécimen” puis la ramène au local de stockage. 

Il donne au modérateur les deux feuilles et le modérateur met le vrai document à la place du “Spécimen” s'ils correspondent bien.`,
		level: "HARD",
		room: "Stockage",
		validationRoom: "Stockage",
		emoji: "📄"
	},
	{
		name: "Space Invaders",
		playerDescription: "Terrassez les ennemis et finissez le niveau 1 du jeu Galaga sur la borne d'arcade.",
		modoDescription: "Le joueur doit valider le niveau 1 du jeu Galaga sur la borne d'arcade.",
		level: "EASY",
		room: "Retro Gaming",
		validationRoom: "Retro Gaming",
		emoji: "👾"
	},
	{
		name: "Câbles",
		playerDescription: "Démêlez les câbles et branchez-les sur la sortie correspondante pour rétablir le courant.",
		modoDescription: "Le joueur doit rebrancher les câbles de couleurs correctement en suivant le labyrinthe aux traits noirs situé au dos de la borne d'arcade.",
		level: "EASY",
		room: "Retro Gaming",
		validationRoom: "Retro Gaming",
		emoji: "🔌"
	},
	{
		name: "Clé USB",
		playerDescription: "Après avoir trouvé la clé de couleur [color] dans la salle hantée, rendez-vous au centre de contrôle et utilisez l'ordinateur pour trouver le fichier log.txt",
		modoDescription: `Le joueur arrive dans le centre de contrôle avec une clé USB qu'il a pris dans la salle hantée. Il l'ouvre sur un PC allumé et doit trouvé le fichier “Log.txt” qui contient le texte “Bravo vous avez trouvé le bon fichier”.

Attention à bien vérifier que la couleur de la clé USB correspond bien à l'énoncé de la task sur le téléphone du joueur. Si la couleur n'est pas la bonne, le joueur doit retourner dans la salle hantée pour trouver la bonne clé.`,
		level: "HARD",
		room: "Salle hantée",
		validationRoom: "Centre de contrôle",
		emoji: "💾"
	},
	{
		name: "Mini Cluedo",
		playerDescription: "Quelqu'un a été assassiné dans le vaisseau ! Après avoir analysé les indices dans la salle hantée, identifiez le suspect au bureau de l'inspecteur.",
		modoDescription: `Le joueur revient de la salle hantée avec en tête les différents indices de la scène de crime. Il doit ouvrir le classeur sur le bureau de l'inspecteur qui contient les photos des différents suspects.

Afin de valider la tâche, le joueur doit donner le nom du coupable au modérateur. Si jamais il se trompe ne le laissez pas proposer tout de suite une solution. Laissez le attendre ou ne répondez pas à ses propositions pendant un laps de temps (cela évite qu'il donne tous les noms à la suite).`,
		level: "HARD",
		room: "Salle hantée",
		validationRoom: "Bureau de l'inspecteur",
		emoji: "🔍"
	},
	{
		name: "Crack the code",
		playerDescription: "Des indices ont été déposés dans la pièce, à vous de reconstituer le code et d'ouvrir le boitier.",
		modoDescription: `Le joueur arrive dans le bureau de l'inspecteur, des énigmes sont disposées sur le bureau. Ces énigmes permettent de trouver un code à 4 chiffres qui permet d'ouvrir le boitier à code.

Le modérateur valide la tâche dès lors que le joueur a réussi à ouvrir le boitier.`,
		level: "HARD",
		room: "Bureau de l'inspecteur",
		validationRoom: "Bureau de l'inspecteur",
		emoji: "🔐"
	},
	{
		name: "Boules",
		playerDescription: "Y'a de quoi en perdre la tête ! Trouvez parmi les 100 boules numérotées celle qui porte le numéro [number]. Attention à ne pas laisser échapper les boules hors de la bassine !",
		modoDescription: "Le joueur doit réussir à retrouver la balle correspondant au numéro qui lui a été attribuée dans la bassine qui contient 100 balles numérotées. Attention à vérifier le numéro attribué au joueur sur son téléphone avant de valider la tâche.",
		level: "HARD",
		room: "Salle de jeu",
		validationRoom: "Salle de jeu",
		emoji: "🎱"
	},
	{
		name: "Anneaux",
		playerDescription: `5 Anneaux. 3 Piquets, et c'est gagné !
Vous avez échoué ? Récupérer les anneaux ratés et reprenez votre progression !`,
		modoDescription: `Le joueur doit réussir à placer 3 anneaux sur les piquets. Il se place à 2m et a 5 anneaux à sa disposition.

S'il ne réussit pas à mettre les 3 anneaux sur les 5, il récupère les anneaux perdus pour pouvoir les relancer. La progression est quand même sauvegardée.`,
		level: "EASY",
		room: "Salle de jeu",
		validationRoom: "Salle de jeu",
		emoji: "⭕"
	},
	{
		name: "Puzzle",
		playerDescription: "Après avoir reconstitué en entier le puzzle, adressez vous au modo et dites-lui la phrase magique ! Attention le puzzle doit être terminé pour pouvoir remplir cette tâche !",
		modoDescription: `Le joueur doit reconstituer le puzzle composée de 28 pièces. 

Pour valider la tâche, regardez si le puzzle est terminé et le joueur doit vous dire “Est ce que c'est bon pour vous ?”`,
		level: "HARD",
		room: "Salle de jeu",
		validationRoom: "Salle de jeu",
		emoji: "🧩"
	},
	{
		name: "Beer Pong",
		playerDescription: "Lancez les balles pour les faire rentrer dans les gobelets. 3 balles à rentrer pour valider la tâche !",
		modoDescription: "Le joueur doit réussir à rentrer 3 balles dans des gobelets.",
		level: "HARD",
		room: "Réfectoire",
		validationRoom: "Réfectoire",
		emoji: "🍺"
	},
	{
		name: "Recettes de cuisine",
		playerDescription: "Le modo à faim : demandez-lui ce qu'il souhaite manger et rassemblez les aliments pour lui cuisiner son/ses plat(s) favori(s) !",
		modoDescription: `Le joueur vient vous voir et vous demande ce que vous souhaitez manger. Vous pouvez donc lui donner soit 1 recette compliquée ou 2 recettes simples. 
		
Le joueur doit trouver la fiche recette correspondante, prendre un ou deux saladiers (en fonction du nombre de recettes) et rassembler les éléments nécessaires.
		
Pour valider la tâche, les ingrédients doivent correspondre aux recettes.`,
		level: "EASY",
		room: "Réfectoire",
		validationRoom: "Réfectoire",
		emoji: "🍳"
	},
	{
		name: "Lancer de balles",
		playerDescription: "Vous devez atteindre la cible depuis le pont supérieur. Attention à ne pas viser le modérateur !",
		modoDescription: `Le joueur doit se rendre au pont supérieur pour essayer de mettre une balle dans la cible. Tant qu'il ne réussit pas, il continue d'essayer. 
		
S'il n'arrive pas avec les balles à disposition, le modérateur met les balles dans un sac et le joueur remonte le sac grâce à la corde.
		
La tâche est validée dès qu'il met une balle dans le contenant.`,
		level: "EASY",
		room: "Pont supérieur",
		validationRoom: "Pont supérieur",
		emoji: "⚾"
	},
	{
		name: "Lodidibon",
		playerDescription: "Rendez-vous au pont supérieur pour remplir une bouteille. Ensuite, rendez-vous au pont inférieur pour montrer la bouteille remplie au modo puis retournez le vider au pont supérieur et remettez la bouteille à sa place.",
		modoDescription: "Le joueur se rend d'abord aux toilettes du pont supérieur pour remplir une bouteille jusqu'au trait. Il doit ensuite se rendre au pont inférieur, montrer la bouteille remplie au modérateur pour faire valider la tâche, puis il remonte aux toilettes du pont dupérieur pour la vider et remettre la bouteille à son emplacement initial.",
		level: "HARD",
		room: "Pont supérieur",
		validationRoom: "Pont inférieur",
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
					validationRoom: { connect: { name: taskData.validationRoom } },
					emoji: taskData.emoji
				}
			})
		})
	)

	console.log("Seeding tasks completed ✅")
}