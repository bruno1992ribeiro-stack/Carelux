export type CreateBedDTO = {
  roomId: string;
  identifier: string;
  active: boolean;
  occupied: boolean;
};

export type UpdateBedDTO = Partial<CreateBedDTO>;