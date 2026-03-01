import { z } from "zod";

export const registerSchema = z.object({
    legalName: z.string().min(2, "Organization name is required"),
    nif: z.string().length(15, "NIF must be exactly 15 digits").regex(/^\d+$/, "NIF must be numeric"),
    nis: z.string().min(1, "NIS is required"),
    commercialRegister: z.string().min(1, "Commercial register number is required"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
