import { z } from "zod";

const organisationTypeSchema = z.enum([
    "EPA",
    "EPIC",
    "MINISTERE",
    "ENTREPRISE_PRIVEE",
    "ENTREPRISE_PUBLIQUE",
    "GROUPEMENT",
]);

export const registerSchema = z.object({
    firstName: z.string().min(2, "First name is required"),
    lastName: z.string().min(2, "Last name is required"),
    legalName: z.string().min(2, "Organization name is required"),
    organisationType: organisationTypeSchema,
    nif: z.string().length(15, "NIF must be exactly 15 digits").regex(/^\d+$/, "NIF must be numeric"),
    nis: z.string().min(1, "NIS is required"),
    commercialRegister: z.string().min(1, "Commercial register number is required"),
    address: z.string().min(2, "Address is required"),
    wilaya: z.string().min(2, "Wilaya is required"),
    commune: z.string().min(2, "Commune is required"),
    phone: z.string().min(8, "Phone number must be at least 8 digits").max(20, "Phone number is too long"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    serviceCode: z.string().max(50, "Service code is too long").optional(),
    sectorActivity: z.string().max(255, "Sector activity is too long").optional(),
    ordonnateur: z.string().max(255, "Ordonnateur is too long").optional(),
    qualifications: z.string().optional(),
    categories: z.string().max(255, "Categories are too long").optional(),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
