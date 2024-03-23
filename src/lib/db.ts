import { PrismaClient } from "@prisma/client"

declare global {
    // eslint-disable-next-line no-var
    var prismaGlobal: PrismaClient | undefined
}

export const prisma = globalThis.prismaGlobal || new PrismaClient()

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma

export const prismaConnected = async(): Promise<boolean> => {
	try {
		await prisma.$queryRaw`SELECT 1;`
		return true
	} catch {
		return false
	}
}