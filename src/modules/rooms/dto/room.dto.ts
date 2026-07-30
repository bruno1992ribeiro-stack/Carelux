export type CreateRoomDTO = {
  facilityId: string;
  number: string;
  floor?: string;
  capacity: number;
  description?: string;
};

export type UpdateRoomDTO = Partial<CreateRoomDTO>;