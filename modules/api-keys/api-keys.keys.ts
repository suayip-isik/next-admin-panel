export const apiKeysKeys = {
  all: ["api-keys"] as const,
  list: () => [...apiKeysKeys.all, "list"] as const,
};
