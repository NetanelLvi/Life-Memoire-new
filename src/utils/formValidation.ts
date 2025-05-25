
import { z } from "zod";

// Common validation schemas
export const emailSchema = z
  .string()
  .min(1, { message: "נדרשת כתובת אימייל" })
  .email({ message: "כתובת אימייל לא תקינה" });

export const passwordSchema = z
  .string()
  .min(8, { message: "הסיסמה חייבת להכיל לפחות 8 תווים" })
  .refine(
    (password) => /[A-Z]/.test(password),
    { message: "הסיסמה חייבת להכיל לפחות אות גדולה אחת" }
  )
  .refine(
    (password) => /[0-9]/.test(password),
    { message: "הסיסמה חייבת להכיל לפחות ספרה אחת" }
  );

// Biography answer validation
export const biographyAnswerSchema = z.object({
  answer: z.string().optional(),
});

// Auth form validation
export const loginFormSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: "נדרשת סיסמה" }),
});

export const signupFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(1, { message: "נדרשת אימות סיסמה" }),
}).refine(data => data.password === data.confirmPassword, {
  message: "הסיסמאות אינן תואמות",
  path: ["confirmPassword"],
});

// Helper for zodResolver with react-hook-form
export const createFormSchema = <T extends z.ZodType>(schema: T) => {
  return schema;
};

// Type inference helper
export type InferFormSchema<T extends z.ZodType> = z.infer<T>;
