export interface ServiceContractantLoginPayload {
  email: string;
  password: string;
}

export interface ServiceContractantLoginResult {
  success: boolean;
  requiresMfa: boolean;
  errorCode?: "INVALID_CREDENTIALS" | "LOCKED";
  attemptsRemaining?: number;
}

export interface ServiceContractantVerifyPayload {
  code: string;
}

export interface ServiceContractantVerifyResult {
  success: boolean;
  errorCode?: "INVALID_CODE" | "LOCKED";
  attemptsRemaining?: number;
}

export interface ServiceContractantMfaSetupData {
  qrCodeSeed: string;
  manualEntryKey: string;
  canSkip: boolean;
}

export interface EnableServiceContractantMfaPayload {
  code: string;
}

export interface EnableServiceContractantMfaResult {
  success: boolean;
  errorCode?: "INVALID_CODE";
}

/**
 * Centralized service contractant login call.
 * Replace the mocked branch with a real API response mapping when backend is available.
 */
export async function loginServiceContractant(
  payload: ServiceContractantLoginPayload,
): Promise<ServiceContractantLoginResult> {
  const normalizedEmail = payload.email.trim().toLowerCase();

  // Temporary mock behaviors to unblock frontend flow integration.
  if (payload.password === "locked") {
    return {
      success: false,
      requiresMfa: false,
      errorCode: "LOCKED",
      attemptsRemaining: 0,
    };
  }

  if (payload.password === "invalid") {
    return {
      success: false,
      requiresMfa: false,
      errorCode: "INVALID_CREDENTIALS",
      attemptsRemaining: 2,
    };
  }

  const requiresMfa = normalizedEmail.includes("mfa");

  return {
    success: true,
    requiresMfa,
  };
}

/**
 * Centralized service contractant MFA verification call.
 * Replace this mock mapping with backend response mapping when API is available.
 */
export async function verifyServiceContractantMfa(
  payload: ServiceContractantVerifyPayload,
): Promise<ServiceContractantVerifyResult> {
  const code = payload.code.trim();

  // Temporary mock behavior: force locked branch for UI flow validation.
  if (code === "000000") {
    return {
      success: false,
      errorCode: "LOCKED",
      attemptsRemaining: 0,
    };
  }

  // Temporary mock behavior: 123456 acts as the only valid code.
  if (code !== "123456") {
    return {
      success: false,
      errorCode: "INVALID_CODE",
      attemptsRemaining: 2,
    };
  }

  return {
    success: true,
  };
}

/**
 * Returns MFA setup information for the connected service contractant user.
 * Replace mocked values with API data when backend endpoint is available.
 */
export async function getServiceContractantMfaSetup(): Promise<ServiceContractantMfaSetupData> {
  await new Promise((resolve) => setTimeout(resolve, 250));

  return {
    qrCodeSeed: "ALMIZAN-SERVICE-CONTRACTANT-MFA",
    manualEntryKey: "ALTZ-2N7M-XE24-85K4",
    canSkip: true,
  };
}

/**
 * Enables MFA after user validates the 6-digit code from authenticator app.
 * Replace mocked verification with backend response mapping when API is available.
 */
export async function enableServiceContractantMfa(
  payload: EnableServiceContractantMfaPayload,
): Promise<EnableServiceContractantMfaResult> {
  await new Promise((resolve) => setTimeout(resolve, 650));

  if (payload.code.trim() !== "123456") {
    return {
      success: false,
      errorCode: "INVALID_CODE",
    };
  }

  return {
    success: true,
  };
}
