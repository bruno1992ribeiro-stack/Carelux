import { z } from "zod";

export const roomSchema = z.object({
  facilityId: z.string().min(1),
  number: z.string().min(1),
  floor: z.string().optional(),
  capacity: z.number().min(1),
  description: z.string().optional(),
});

export type RoomInput = z.infer<typeof roomSchema>;