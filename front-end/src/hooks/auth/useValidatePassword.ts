import { useState } from "react";
import { PasswordValidation } from "@/utils/interface/interface";

export default function useValidatePassword() {
  const [passwordValidation, setPasswordValidation] = useState<PasswordValidation>({
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecial: false,
    hasLength: false,
  })

  const validatePassword = (password: string) => {
    setPasswordValidation({
        hasUppercase: /[A-Z]/.test(password),
        hasLowercase: /[a-z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecial: /[@$!%*?&]/.test(password),
        hasLength: password.length >= 8,
      })

    return
  }

  const isStrongPassword = (password: string): boolean => {
    // Check how password strong
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  }

  return { validatePassword, isStrongPassword, passwordValidation  }
}