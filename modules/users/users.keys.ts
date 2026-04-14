export const usersKeys = {
  all: ["users"] as const,
  lists: () => [...usersKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) =>
    [...usersKeys.lists(), filters] as const,
  deleted: (filters: Record<string, unknown>) =>
    [...usersKeys.all, "deleted", filters] as const,
  stats: () => [...usersKeys.all, "stats"] as const,
  detail: (id: string) => [...usersKeys.all, "detail", id] as const,
};
