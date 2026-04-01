import { z } from "zod";

export const serviceContractantLoginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});

export type ServiceContractantLoginFormData = z.infer<typeof serviceContractantLoginSchema>;
