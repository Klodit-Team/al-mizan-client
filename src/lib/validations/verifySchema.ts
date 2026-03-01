import { z } from "zod";

export const verifySchema = z.object({
    code: z.string().length(6, "Verification code must be exactly 6 digits").regex(/^\d+$/, "Verification code must be numeric"),
});

export type VerifyFormData = z.infer<typeof verifySchema>;
