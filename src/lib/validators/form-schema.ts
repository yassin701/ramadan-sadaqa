import { z } from "zod";

export const chatSchema = z.object({
    message: z.string().min(1, "Le message ne peut pas être vide").max(2000, "Message trop long"),
});

export const authSchema = z.object({
    email: z.string().email({ message: "Émail invalide" }),
    password: z.string().min(8, { message: "8 caractères minimum" }),
    name: z.string().min(2, { message: "Nom trop court" }).optional(),
});

export const uploadSchema = z.object({
    file: z.instanceof(File, { message: "Veuillez sélectionner un fichier PDF" })
        .refine((file) => file.type === "application/pdf", "Seuls les fichiers PDF sont acceptés")
        .refine((file) => file.size <= 5 * 1024 * 1024, "Le fichier ne doit pas dépasser 5 Mo"),
});

export type ChatInput = z.infer<typeof chatSchema>;
export type AuthInput = z.infer<typeof authSchema>;
export type UploadInput = z.infer<typeof uploadSchema>;
