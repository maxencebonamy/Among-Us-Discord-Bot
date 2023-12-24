import fs from "fs"

export const exists = (path: string): boolean => {
	return fs.existsSync(path)
}

export const createFolderIfNotExists = (path: string): void => {
	if (!fs.existsSync(path)) {
		fs.mkdirSync(path)
	}
}

export const createFileIfNotExists = (path: string, content: string): void => {
	if (!fs.existsSync(path)) {
		fs.writeFileSync(path, content)
	}
}

export const appendOrCreateFile = (path: string, content: string): void => {
	if (fs.existsSync(path)) {
		fs.appendFileSync(path, content)
	} else {
		fs.writeFileSync(path, content)
	}
}