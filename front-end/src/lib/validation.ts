// utils/password-utils.ts
export const checkStrongPassword = (password: string): boolean => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(password);
};

// แยกรายละเอียดเผื่ออยากใช้เช็คแยกข้อ
export const getPasswordCriteria = (password: string) => ({
  hasUppercase: /[A-Z]/.test(password),
  hasLowercase: /[a-z]/.test(password),
  hasNumber: /[0-9]/.test(password),
  hasSpecial: /[@$!%*?&]/.test(password),
  hasLength: password.length >= 8,
});