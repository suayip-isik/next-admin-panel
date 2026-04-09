export const usersKeys = {
  all: ["users"] as const,
  lists: () => [...usersKeys.all, "list"] as const,
  list: (page: number, search: string) =>
    [...usersKeys.lists(), { page, search }] as const,
  deleted: (page: number, search: string) =>
    [...usersKeys.all, "deleted", { page, search }] as const,
  stats: () => [...usersKeys.all, "stats"] as const,
  detail: (id: string) => [...usersKeys.all, "detail", id] as const,
};
