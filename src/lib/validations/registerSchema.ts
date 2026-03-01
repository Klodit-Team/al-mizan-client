import { z } from "zod";

export const registerSchema = z.object({
    legalName: z.string().min(2, "Organization name is required"),
    nif: z.string().length(15, "NIF must be exactly 15 digits").regex(/^\d+$/, "NIF must be numeric"),
    nis: z.string().min(1, "NIS is required"),
    commercialRegister: z.string().min(1, "Commercial register number is required"),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
