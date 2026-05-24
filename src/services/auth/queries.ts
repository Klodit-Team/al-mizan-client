import { useMutation } from '@tanstack/react-query';
import {
  login,
  register,
  requestPasswordReset,
  confirmPasswordReset,
  type LoginRequest,
  type LoginResponse,
  type RegisterRequest,
  type RegisterResponse,
  type ResetPasswordRequestPayload,
  type ResetPasswordRequestResponse,
  type ResetPasswordConfirmPayload,
  type ResetPasswordConfirmResponse,
} from './api';
import { authKeys } from './keys';

export function useLoginMutation() {
  return useMutation<LoginResponse, Error, LoginRequest>({
    mutationKey: authKeys.loginMutation(),
    mutationFn: login,
  });
}

export function useRegisterMutation() {
  return useMutation<RegisterResponse, Error, RegisterRequest>({
    mutationKey: authKeys.registerMutation(),
    mutationFn: register,
  });
}

export function useResetPasswordRequestMutation() {
  return useMutation<ResetPasswordRequestResponse, Error, ResetPasswordRequestPayload>({
    mutationKey: authKeys.resetPasswordRequestMutation(),
    mutationFn: requestPasswordReset,
  });
}

export function useResetPasswordConfirmMutation() {
  return useMutation<ResetPasswordConfirmResponse, Error, ResetPasswordConfirmPayload>({
    mutationKey: authKeys.resetPasswordConfirmMutation(),
    mutationFn: confirmPasswordReset,
  });
}
