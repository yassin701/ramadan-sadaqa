import { z } from "zod";

export const chatSchema = z.object({
    message: z.string()
        .min(1, "Le message ne peut pas être vide")
        .max(2000, "Message trop long")
        .refine((val) => val.trim().length > 0, "Le message ne peut pas être uniquement des espaces"),
});

export const authSchema = z.object({
    email: z.string().email({ message: "Émail invalide" }),
    password: z.string().min(8, { message: "8 caractères minimum (doit être sécurisé)" }),
    name: z.string().min(2, { message: "Nom trop court" }).optional(),
});

export const uploadSchema = z.object({
    file: z.any()
        .refine((files) => files instanceof FileList && files.length > 0, "Veuillez sélectionner un fichier (PDF ou Excel)")
        .transform((files) => files[0] as File)
        .refine(
            (file) => [
                "application/pdf",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "application/vnd.ms-excel",
                "text/csv"
            ].includes(file.type),
            "Seuls les fichiers PDF et Excel (.xlsx, .xls) sont acceptés"
        )
        .refine((file) => file.size <= 5 * 1024 * 1024, "Le fichier ne doit pas dépasser 5 Mo (limite de l'association)"),
});

export type ChatInput = z.infer<typeof chatSchema>;
export type AuthInput = z.infer<typeof authSchema>;
export type UploadInput = z.infer<typeof uploadSchema>;
