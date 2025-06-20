import { z } from "zod";

export const postSchema = z.object({
  userId: z.string().optional(),
  content: z.string().max(1024).min(1),
  type: z.literal("note"),
  isInvisible: z.boolean().optional(),
  mood: z.number().min(1).max(7).optional(),
  moodType: z.enum(["manual", "estimated"]).optional(),
  trend: z
    .object({
      summary: z.string().optional(),
      consultation: z.string().optional(),
      trends: z.array(z.string()).optional(),
    })
    .optional(),
  contentEmbeddings: z.array(z.number()).nullable().optional(),
});

export type Post = z.infer<typeof postSchema>;

export type PostWithMetadata = Post & {
  createdAt: number;
  timestamp: number;
  updatedAt?: number;
  id: string;
};

export const medicineFormSchema = z.object({
  name: z.string().max(32),
  type: z.enum(["tranquilizer", "sleepInducer", "other"]),
});

export type MedicineType = "tranquilizer" | "sleepInducer" | "other";
export type Medicine = z.infer<typeof medicineFormSchema>;
