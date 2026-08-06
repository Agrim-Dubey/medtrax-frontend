export interface PasswordRequirement {
  id: string;
  label: string;
  met: boolean;
}

export interface PasswordStrength {
  score: number; // 0 to 4
  label: 'Too Weak' | 'Weak' | 'Fair' | 'Strong' | 'Very Strong';
  color: string;
  percent: number;
  requirements: PasswordRequirement[];
}

export const validation = {
  // RFC 5322 compliant email regex
  emailRegex: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/,

  // International phone regex (E.164 or national 10-digit format)
  phoneRegex: /^\+?[1-9]\d{1,14}$|^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/,

  // Blood pressure: systolic/diastolic (e.g. 120/80)
  bloodPressureRegex: /^(\d{2,3})\/(\d{2,3})$/,

  // Medical license / registration number (alphanumeric with optional hyphens/slashes)
  regNumberRegex: /^[A-Z0-9/-]{4,20}$/i,

  // 6-digit OTP regex
  otpRegex: /^\d{6}$/,

  isValidEmail(email: string): boolean {
    if (!email || typeof email !== 'string') return false;
    return this.emailRegex.test(email.trim());
  },

  isValidPhone(phone: string): boolean {
    if (!phone) return false;
    const clean = phone.replace(/[\s\-\(\)]/g, '');
    return clean.length >= 8 && clean.length <= 15 && /^\+?\d+$/.test(clean);
  },

  isValidBloodPressure(bp: string): { valid: boolean; message?: string } {
    if (!bp) return { valid: true };
    const match = bp.trim().match(this.bloodPressureRegex);
    if (!match) return { valid: false, message: 'Format should be like 120/80' };
    const systolic = parseInt(match[1], 10);
    const diastolic = parseInt(match[2], 10);
    if (systolic < 70 || systolic > 240) return { valid: false, message: 'Systolic value usually 70-240' };
    if (diastolic < 40 || diastolic > 140) return { valid: false, message: 'Diastolic value usually 40-140' };
    return { valid: true };
  },

  isValidTemperature(temp: number | string): { valid: boolean; message?: string } {
    if (temp === '' || temp === null || temp === undefined) return { valid: true };
    const num = typeof temp === 'string' ? parseFloat(temp) : temp;
    if (isNaN(num)) return { valid: false, message: 'Must be a valid number' };
    if (num < 94 || num > 108) return { valid: false, message: 'Normal clinical range is 94°F - 108°F' };
    return { valid: true };
  },

  isValidPulseRate(pulse: number | string): { valid: boolean; message?: string } {
    if (pulse === '' || pulse === null || pulse === undefined) return { valid: true };
    const num = typeof pulse === 'string' ? parseInt(pulse, 10) : pulse;
    if (isNaN(num)) return { valid: false, message: 'Must be an integer' };
    if (num < 35 || num > 220) return { valid: false, message: 'Clinical pulse is typically 35-220 bpm' };
    return { valid: true };
  },

  isValidWeight(weight: number | string): { valid: boolean; message?: string } {
    if (weight === '' || weight === null || weight === undefined) return { valid: true };
    const num = typeof weight === 'string' ? parseFloat(weight) : weight;
    if (isNaN(num)) return { valid: false, message: 'Must be a valid number' };
    if (num < 1 || num > 450) return { valid: false, message: 'Enter realistic body weight (1-450 kg)' };
    return { valid: true };
  },

  isValidMedicalRegNumber(reg: string): boolean {
    if (!reg) return false;
    return this.regNumberRegex.test(reg.trim());
  },

  isValidOTP(otp: string): boolean {
    return this.otpRegex.test(otp.trim());
  },

  evaluatePasswordStrength(password: string): PasswordStrength {
    const requirements: PasswordRequirement[] = [
      { id: 'length', label: 'At least 8 characters', met: password.length >= 8 },
      { id: 'lowercase', label: 'At least one lowercase letter', met: /[a-z]/.test(password) },
      { id: 'uppercase', label: 'At least one uppercase letter', met: /[A-Z]/.test(password) },
      { id: 'number', label: 'At least one number', met: /\d/.test(password) },
      { id: 'special', label: 'At least one special character (!@#$%^&*)', met: /[^a-zA-Z0-9]/.test(password) },
    ];

    const metCount = requirements.filter(r => r.met).length;

    let score = 0;
    let label: PasswordStrength['label'] = 'Too Weak';
    let color = '#ef4444'; // red

    if (password.length === 0) {
      score = 0;
      label = 'Too Weak';
      color = '#64748b';
    } else if (metCount <= 2) {
      score = 1;
      label = 'Weak';
      color = '#ef4444';
    } else if (metCount === 3) {
      score = 2;
      label = 'Fair';
      color = '#f59e0b'; // amber
    } else if (metCount === 4) {
      score = 3;
      label = 'Strong';
      color = '#38bdf8'; // sky blue
    } else if (metCount === 5) {
      score = 4;
      label = 'Very Strong';
      color = '#22c55e'; // emerald green
    }

    const percent = Math.min(100, Math.round((metCount / 5) * 100));

    return { score, label, color, percent, requirements };
  },
};
