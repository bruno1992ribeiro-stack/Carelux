import { z } from "zod";

export const facilitySchema = z.object({
  name: z
    .string()
    .min(3, "O nome deve ter pelo menos 3 caracteres"),

  address: z.string().optional(),

  city: z.string().optional(),

  postalCode: z.string().optional(),

  phone: z.string().optional(),

  email: z
    .string()
    .trim()
    .transform((value) => (value === "" ? undefined : value))
    .optional()
    .refine(
      (value) => !value || z.string().email().safeParse(value).success,
      {
        message: "Email inválido",
      }
    ),
});

export type FacilityInput = z.infer<typeof facilitySchema>;