export const authKeys = {
  all: ['auth'] as const,
  loginMutation: () => [...authKeys.all, 'login'] as const,
  registerMutation: () => [...authKeys.all, 'register'] as const,
  resetPasswordRequestMutation: () => [...authKeys.all, 'reset-password-request'] as const,
  resetPasswordConfirmMutation: () => [...authKeys.all, 'reset-password-confirm'] as const,
};
