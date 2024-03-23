import type { PlayerVote } from "@prisma/client"

export const eliminatePlayer = (votes: PlayerVote[]): number | null => {
	const voteCountMap: Map<number | null, number> = new Map()

	// Compter le nombre de votes pour chaque joueur
	for (const vote of votes) {
		const targetId = vote.targetId
		const currentCount = voteCountMap.get(targetId) || 0
		voteCountMap.set(targetId, currentCount + 1)
	}

	let maxVotes = 0
	let maxVotedPlayer: number | null = null
	let isTie = false

	// Trouver le joueur le plus voté et vérifier s'il y a une égalité
	for (const [player, count] of voteCountMap) {
		if (count > maxVotes) {
			maxVotes = count
			maxVotedPlayer = player
			isTie = false
		} else if (count === maxVotes) {
			isTie = true
		}
	}

	// Si c'est une égalité ou si le joueur le plus voté est un vote blanc, retourner null
	if (isTie || maxVotedPlayer === null) {
		return null
	}

	return maxVotedPlayer
}