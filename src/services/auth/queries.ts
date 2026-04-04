import { useMutation } from '@tanstack/react-query';
import {
  login,
  register,
  type LoginRequest,
  type LoginResponse,
  type RegisterRequest,
  type RegisterResponse,
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
