// hooks/usePasswordUI.ts
import { getPasswordCriteria } from "@/lib/validation";
import { useState } from "react";

export default function usePasswordUI() {
  const [validation, setValidation] = useState({
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecial: false,
    hasLength: false,
  });

  const handleValidation = (password: string) => {
    setValidation(getPasswordCriteria(password));
  };

  return { validation, handleValidation };
}