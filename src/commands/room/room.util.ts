import { prisma } from "@/lib/db"
import type { Room } from "@prisma/client"
import { RoomSchema } from "prisma/zod"

export const findById = async(id: number): Promise<Room | null> => {
	return await prisma.room.findUnique({
		where: {
			id
		}
	})
}

export const SimpleRoomSchema = RoomSchema.pick({
	name: true
})