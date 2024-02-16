export const truncateString = (str: string, maxLength: number): string => {
	if (str.length <= maxLength) return str
	return str.substring(0, maxLength - 3) + "..."
}

export const alignRight = (str: string, length: number): string => {
	const numLength = str.length
	if (numLength >= length) return str

	const spacesToAdd = length - numLength
	const spaces = " ".repeat(spacesToAdd)
	return spaces + str
}