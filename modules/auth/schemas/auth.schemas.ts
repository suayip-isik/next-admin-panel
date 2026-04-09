import { z } from "zod";

type TranslationFn = (
  key: string,
  params?: Record<string, string | number>,
) => string;

export function createLoginSchema(t: TranslationFn) {
  return z.object({
    email: z.email({ error: t("email") }),
    password: z.string().min(1, { error: t("passwordRequired") }),
  });
}

export function createTotpChallengeSchema(t: TranslationFn) {
  return z.object({
    code: z
      .string()
      .min(6, { error: t("codeMinLength", { min: 6 }) })
      .max(8, { error: t("codeMaxLength", { max: 8 }) }),
  });
}

export function createForgotPasswordSchema(t: TranslationFn) {
  return z.object({
    email: z.email({ error: t("email") }),
  });
}

export function createResetPasswordSchema(t: TranslationFn) {
  return z
    .object({
      token: z.string().min(1),
      new_password: z
        .string()
        .min(8, { error: t("passwordMinLength", { min: 8 }) })
        .regex(/[A-Z]/, { error: t("passwordUppercase") })
        .regex(/[a-z]/, { error: t("passwordLowercase") })
        .regex(/[0-9]/, { error: t("passwordNumber") }),
      confirm_password: z.string().min(1),
    })
    .refine((data) => data.new_password === data.confirm_password, {
      error: t("passwordMismatch"),
      path: ["confirm_password"],
    });
}

export type LoginInput = z.infer<ReturnType<typeof createLoginSchema>>;
export type TOTPChallengeInput = z.infer<
  ReturnType<typeof createTotpChallengeSchema>
>;
export type ForgotPasswordInput = z.infer<
  ReturnType<typeof createForgotPasswordSchema>
>;
export type ResetPasswordInput = z.infer<
  ReturnType<typeof createResetPasswordSchema>
>;
