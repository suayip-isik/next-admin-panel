import { z } from "zod";
import { PERMISSIONS, type Permission } from "@/shared/utils/permissions";

type TranslationFn = (
  key: string,
  params?: Record<string, string | number>,
) => string;

const permissionsSchema = z.array(
  z.enum(PERMISSIONS as unknown as readonly [Permission, ...Permission[]]),
);

export function createRoleSchema(t: TranslationFn) {
  return z.object({
    name: z
      .string()
      .min(1, { error: t("roleNameRequired") })
      .regex(/^[a-z][a-z0-9_]*$/, {
        error: t("roleNamePattern"),
      }),
    description: z.string().optional(),
    permissions: permissionsSchema.optional(),
  });
}

export function createUpdateRoleSchema() {
  return z.object({
    description: z.string().optional(),
    permissions: permissionsSchema.optional(),
  });
}

export type CreateRoleInput = z.infer<ReturnType<typeof createRoleSchema>>;
export type UpdateRoleInput = z.infer<
  ReturnType<typeof createUpdateRoleSchema>
>;
