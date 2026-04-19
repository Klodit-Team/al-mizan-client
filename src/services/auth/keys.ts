export const authKeys = {
  all: ['auth'] as const,
  loginMutation: () => [...authKeys.all, 'login'] as const,
  registerMutation: () => [...authKeys.all, 'register'] as const,
};
