import { prisma } from "@/lib/db"
import type { PlayerRole } from "@prisma/client"

export const texts: Record<PlayerRole, string> = {

	IMPOSTOR: `Bienvenue dans **Among Us IRL** !

Votre couleur est : **[color]**

Votre rôle est : 🔪 **Imposteur**
Votre objectif est d'éliminer tous les membres de l'équipage sans vous faire repérer.

L'autre imposteur est : [impostor]

Bonne chance !`,

	CREWMATE: `Bienvenue dans **Among Us IRL** !

Votre couleur est : **[color]**

Votre rôle est : 👨‍🚀 **Crewmate** !
Votre objectif est de réparer le vaisseau et de trouver les imposteurs.

Bonne chance !`

}

export const getIntConfig = async(key: string): Promise<number | null> => {
	const config = await prisma.config.findUnique({ where: { key } })
	if (!config || !config.value) {
		return null
	}
	return Number.parseInt(config.value)
}