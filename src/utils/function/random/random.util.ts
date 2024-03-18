export const shuffle = <T>(array: T[]): T[] => {
	const newArray = [...array] // Crée une copie de l'array pour ne pas modifier l'original
	for (let i = newArray.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1)); // Génère un indice aléatoire
		[newArray[i], newArray[j]] = [newArray[j], newArray[i]] // Échange les éléments aux indices i et j
	}
	return newArray
}