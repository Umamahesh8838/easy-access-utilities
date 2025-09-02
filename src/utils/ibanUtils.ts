// IBAN generation, validation, and formatting utilities
// For test and development purposes only

export interface CountryInfo {
  code: string;
  name: string;
  length: number;
  bbanDescription: string;
  bbanPattern: string;
  example: string;
}

export interface GeneratedIBAN {
  raw: string;          // Unformatted IBAN (e.g., "DE89370400440532013000")
  pretty: string;       // Formatted IBAN (e.g., "DE89 3704 0044 0532 0130 00")
  masked: string;       // Masked IBAN (e.g., "DE89 **** **** **** **** **")
  country: string;      // Country code (e.g., "DE")
  length: number;       // Total length
  isValid: boolean;     // Whether checksum is correct
  generatedAt: string;  // ISO timestamp
}

export interface ValidationResult {
  isValid: boolean;
  formatted?: string;
  details?: {
    country?: string;
    length?: number;
    checkDigits?: string;
  };
  errors?: string[];
}

export interface IBANConfig {
  country: string;
  mode: "valid" | "invalid";
  quantity: number;
  useCustomBank?: boolean;
  customBankCode?: string;
  timestamp: number;
}

export interface GenerationOptions {
  mode: "valid" | "invalid";
  customBankCode?: string;
}

// IBAN country configurations
const COUNTRY_CONFIGS: Record<string, CountryInfo> = {
  AD: { code: "AD", name: "Andorra", length: 24, bbanDescription: "Bank(4) + Account(12)", bbanPattern: "\\d{4}\\d{12}", example: "AD1200012030200359100100" },
  AE: { code: "AE", name: "UAE", length: 23, bbanDescription: "Bank(3) + Account(16)", bbanPattern: "\\d{3}\\d{16}", example: "AE070331234567890123456" },
  AL: { code: "AL", name: "Albania", length: 28, bbanDescription: "Bank(3) + Branch(4) + Check(1) + Account(16)", bbanPattern: "\\d{8}\\d{16}", example: "AL47212110090000000235698741" },
  AT: { code: "AT", name: "Austria", length: 20, bbanDescription: "Bank(5) + Account(11)", bbanPattern: "\\d{5}\\d{11}", example: "AT611904300234573201" },
  AZ: { code: "AZ", name: "Azerbaijan", length: 28, bbanDescription: "Bank(4) + Account(20)", bbanPattern: "[A-Z]{4}\\d{20}", example: "AZ21NABZ00000000137010001944" },
  BA: { code: "BA", name: "Bosnia and Herzegovina", length: 20, bbanDescription: "Bank(3) + Branch(3) + Account(8) + Check(2)", bbanPattern: "\\d{3}\\d{3}\\d{8}\\d{2}", example: "BA391290079401028494" },
  BE: { code: "BE", name: "Belgium", length: 16, bbanDescription: "Bank(3) + Account(7) + Check(2)", bbanPattern: "\\d{3}\\d{7}\\d{2}", example: "BE68539007547034" },
  BG: { code: "BG", name: "Bulgaria", length: 22, bbanDescription: "Bank(4) + Branch(4) + Account(2) + Account(8)", bbanPattern: "[A-Z]{4}\\d{4}\\d{2}\\d{8}", example: "BG80BNBG96611020345678" },
  BH: { code: "BH", name: "Bahrain", length: 22, bbanDescription: "Bank(4) + Account(14)", bbanPattern: "[A-Z]{4}\\d{14}", example: "BH67BMAG00001299123456" },
  BR: { code: "BR", name: "Brazil", length: 29, bbanDescription: "Bank(8) + Branch(5) + Account(10) + Check(1)", bbanPattern: "\\d{8}\\d{5}\\d{10}[A-Z]{1}", example: "BR9700360305000010009795493P1" },
  BY: { code: "BY", name: "Belarus", length: 28, bbanDescription: "Bank(4) + Balance(4) + Account(16)", bbanPattern: "\\d{4}\\d{4}\\d{16}", example: "BY13NBRB3600900000002Z00AB00" },
  CH: { code: "CH", name: "Switzerland", length: 21, bbanDescription: "Bank(5) + Account(12)", bbanPattern: "\\d{5}\\d{12}", example: "CH9300762011623852957" },
  CR: { code: "CR", name: "Costa Rica", length: 22, bbanDescription: "Bank(4) + Account(14)", bbanPattern: "\\d{4}\\d{14}", example: "CR72012300000171549015" },
  CY: { code: "CY", name: "Cyprus", length: 28, bbanDescription: "Bank(3) + Branch(5) + Account(16)", bbanPattern: "\\d{3}\\d{5}\\d{16}", example: "CY17002001280000001200527600" },
  CZ: { code: "CZ", name: "Czech Republic", length: 24, bbanDescription: "Bank(4) + Account(6) + Account(10)", bbanPattern: "\\d{4}\\d{6}\\d{10}", example: "CZ6508000000192000145399" },
  DE: { code: "DE", name: "Germany", length: 22, bbanDescription: "Bank(8) + Account(10)", bbanPattern: "\\d{8}\\d{10}", example: "DE89370400440532013000" },
  DK: { code: "DK", name: "Denmark", length: 18, bbanDescription: "Bank(4) + Account(9) + Check(1)", bbanPattern: "\\d{4}\\d{9}\\d{1}", example: "DK5000400440116243" },
  DO: { code: "DO", name: "Dominican Republic", length: 28, bbanDescription: "Bank(4) + Account(20)", bbanPattern: "[A-Z]{4}\\d{20}", example: "DO28BAGR00000001212453611324" },
  EE: { code: "EE", name: "Estonia", length: 20, bbanDescription: "Bank(2) + Branch(2) + Account(11) + Check(1)", bbanPattern: "\\d{2}\\d{2}\\d{11}\\d{1}", example: "EE382200221020145685" },
  EG: { code: "EG", name: "Egypt", length: 29, bbanDescription: "Bank(4) + Branch(4) + Account(17)", bbanPattern: "\\d{4}\\d{4}\\d{17}", example: "EG800002000156789012345180002" },
  ES: { code: "ES", name: "Spain", length: 24, bbanDescription: "Bank(4) + Branch(4) + Check(1) + Check(1) + Account(10)", bbanPattern: "\\d{4}\\d{4}\\d{1}\\d{1}\\d{10}", example: "ES9121000418450200051332" },
  FI: { code: "FI", name: "Finland", length: 18, bbanDescription: "Bank(3) + Account(11)", bbanPattern: "\\d{3}\\d{11}", example: "FI2112345600000785" },
  FO: { code: "FO", name: "Faroe Islands", length: 18, bbanDescription: "Bank(4) + Account(9) + Check(1)", bbanPattern: "\\d{4}\\d{9}\\d{1}", example: "FO6264600001631634" },
  FR: { code: "FR", name: "France", length: 27, bbanDescription: "Bank(5) + Branch(5) + Account(11) + Check(2)", bbanPattern: "\\d{5}\\d{5}\\d{11}\\d{2}", example: "FR1420041010050500013M02606" },
  GB: { code: "GB", name: "United Kingdom", length: 22, bbanDescription: "Bank(4) + Branch(6) + Account(8)", bbanPattern: "[A-Z]{4}\\d{6}\\d{8}", example: "GB29NWBK60161331926819" },
  GE: { code: "GE", name: "Georgia", length: 22, bbanDescription: "Bank(2) + Account(16)", bbanPattern: "[A-Z]{2}\\d{16}", example: "GE29NB0000000101904917" },
  GI: { code: "GI", name: "Gibraltar", length: 23, bbanDescription: "Bank(4) + Account(15)", bbanPattern: "[A-Z]{4}\\d{15}", example: "GI75NWBK000000007099453" },
  GL: { code: "GL", name: "Greenland", length: 18, bbanDescription: "Bank(4) + Account(9) + Check(1)", bbanPattern: "\\d{4}\\d{9}\\d{1}", example: "GL8964710001000206" },
  GR: { code: "GR", name: "Greece", length: 27, bbanDescription: "Bank(3) + Branch(4) + Account(16)", bbanPattern: "\\d{3}\\d{4}\\d{16}", example: "GR1601101250000000012300695" },
  GT: { code: "GT", name: "Guatemala", length: 28, bbanDescription: "Bank(4) + Currency(2) + Account(2) + Account(16)", bbanPattern: "[A-Z]{4}\\d{2}\\d{2}\\d{16}", example: "GT82TRAJ01020000001210029690" },
  HR: { code: "HR", name: "Croatia", length: 21, bbanDescription: "Bank(7) + Account(10)", bbanPattern: "\\d{7}\\d{10}", example: "HR1210010051863000160" },
  HU: { code: "HU", name: "Hungary", length: 28, bbanDescription: "Bank(3) + Branch(4) + Account(1) + Account(15) + Check(1)", bbanPattern: "\\d{3}\\d{4}\\d{1}\\d{15}\\d{1}", example: "HU42117730161111101800000000" },
  IE: { code: "IE", name: "Ireland", length: 22, bbanDescription: "Bank(4) + Branch(6) + Account(8)", bbanPattern: "[A-Z]{4}\\d{6}\\d{8}", example: "IE29AIBK93115212345678" },
  IL: { code: "IL", name: "Israel", length: 23, bbanDescription: "Bank(3) + Branch(3) + Account(13)", bbanPattern: "\\d{3}\\d{3}\\d{13}", example: "IL620108000000099999999" },
  IS: { code: "IS", name: "Iceland", length: 26, bbanDescription: "Bank(2) + Branch(2) + Account(2) + Account(6) + Account(10)", bbanPattern: "\\d{2}\\d{2}\\d{2}\\d{6}\\d{10}", example: "IS140159260076545510730339" },
  IT: { code: "IT", name: "Italy", length: 27, bbanDescription: "Check(1) + Bank(5) + Branch(5) + Account(12)", bbanPattern: "[A-Z]{1}\\d{5}\\d{5}\\d{12}", example: "IT60X0542811101000000123456" },
  JO: { code: "JO", name: "Jordan", length: 30, bbanDescription: "Bank(4) + Branch(4) + Account(18)", bbanPattern: "[A-Z]{4}\\d{4}\\d{18}", example: "JO94CBJO0010000000000131000302" },
  KW: { code: "KW", name: "Kuwait", length: 30, bbanDescription: "Bank(4) + Account(22)", bbanPattern: "[A-Z]{4}\\d{22}", example: "KW81CBKU0000000000001234560101" },
  KZ: { code: "KZ", name: "Kazakhstan", length: 20, bbanDescription: "Bank(3) + Account(13)", bbanPattern: "\\d{3}\\d{13}", example: "KZ86125KZT5004100100" },
  LB: { code: "LB", name: "Lebanon", length: 28, bbanDescription: "Bank(4) + Account(20)", bbanPattern: "\\d{4}\\d{20}", example: "LB62099900000001001901229114" },
  LC: { code: "LC", name: "Saint Lucia", length: 32, bbanDescription: "Bank(4) + Account(24)", bbanPattern: "[A-Z]{4}\\d{24}", example: "LC07HEMM000100010012001200013015" },
  LI: { code: "LI", name: "Liechtenstein", length: 21, bbanDescription: "Bank(5) + Account(12)", bbanPattern: "\\d{5}\\d{12}", example: "LI21088100002324013AA" },
  LT: { code: "LT", name: "Lithuania", length: 20, bbanDescription: "Bank(5) + Account(11)", bbanPattern: "\\d{5}\\d{11}", example: "LT121000011101001000" },
  LU: { code: "LU", name: "Luxembourg", length: 20, bbanDescription: "Bank(3) + Account(13)", bbanPattern: "\\d{3}\\d{13}", example: "LU280019400644750000" },
  LV: { code: "LV", name: "Latvia", length: 21, bbanDescription: "Bank(4) + Account(13)", bbanPattern: "[A-Z]{4}\\d{13}", example: "LV80BANK0000435195001" },
  MC: { code: "MC", name: "Monaco", length: 27, bbanDescription: "Bank(5) + Branch(5) + Account(11) + Check(2)", bbanPattern: "\\d{5}\\d{5}\\d{11}\\d{2}", example: "MC5811222000010123456789030" },
  MD: { code: "MD", name: "Moldova", length: 24, bbanDescription: "Bank(2) + Account(18)", bbanPattern: "[A-Z]{2}\\d{18}", example: "MD24AG000225100013104168" },
  ME: { code: "ME", name: "Montenegro", length: 22, bbanDescription: "Bank(3) + Account(13) + Check(2)", bbanPattern: "\\d{3}\\d{13}\\d{2}", example: "ME25505000012345678951" },
  MK: { code: "MK", name: "North Macedonia", length: 19, bbanDescription: "Bank(3) + Account(10) + Check(2)", bbanPattern: "\\d{3}\\d{10}\\d{2}", example: "MK07250120000058984" },
  MR: { code: "MR", name: "Mauritania", length: 27, bbanDescription: "Bank(5) + Branch(5) + Account(11) + Check(2)", bbanPattern: "\\d{5}\\d{5}\\d{11}\\d{2}", example: "MR1300020001010000123456753" },
  MT: { code: "MT", name: "Malta", length: 31, bbanDescription: "Bank(4) + Branch(5) + Account(18)", bbanPattern: "[A-Z]{4}\\d{5}\\d{18}", example: "MT84MALT011000012345MTLCAST001S" },
  MU: { code: "MU", name: "Mauritius", length: 30, bbanDescription: "Bank(4) + Branch(2) + Account(2) + Account(12) + Currency(3)", bbanPattern: "[A-Z]{4}\\d{2}\\d{2}\\d{12}[A-Z]{3}", example: "MU17BOMM0101101030300200000MUR" },
  NL: { code: "NL", name: "Netherlands", length: 18, bbanDescription: "Bank(4) + Account(10)", bbanPattern: "[A-Z]{4}\\d{10}", example: "NL91ABNA0417164300" },
  NO: { code: "NO", name: "Norway", length: 15, bbanDescription: "Bank(4) + Account(6) + Check(1)", bbanPattern: "\\d{4}\\d{6}\\d{1}", example: "NO9386011117947" },
  PK: { code: "PK", name: "Pakistan", length: 24, bbanDescription: "Bank(4) + Account(16)", bbanPattern: "[A-Z]{4}\\d{16}", example: "PK36SCBL0000001123456702" },
  PL: { code: "PL", name: "Poland", length: 28, bbanDescription: "Bank(3) + Branch(4) + Check(1) + Account(16)", bbanPattern: "\\d{3}\\d{4}\\d{1}\\d{16}", example: "PL61109010140000071219812874" },
  PS: { code: "PS", name: "Palestine", length: 29, bbanDescription: "Bank(4) + Account(21)", bbanPattern: "[A-Z]{4}\\d{21}", example: "PS92PALS000000000400123456702" },
  PT: { code: "PT", name: "Portugal", length: 25, bbanDescription: "Bank(4) + Branch(4) + Account(11) + Check(2)", bbanPattern: "\\d{4}\\d{4}\\d{11}\\d{2}", example: "PT50000201231234567890154" },
  QA: { code: "QA", name: "Qatar", length: 29, bbanDescription: "Bank(4) + Account(21)", bbanPattern: "[A-Z]{4}\\d{21}", example: "QA58DOHB00001234567890ABCDEFG" },
  RO: { code: "RO", name: "Romania", length: 24, bbanDescription: "Bank(4) + Account(16)", bbanPattern: "[A-Z]{4}\\d{16}", example: "RO49AAAA1B31007593840000" },
  RS: { code: "RS", name: "Serbia", length: 22, bbanDescription: "Bank(3) + Account(13) + Check(2)", bbanPattern: "\\d{3}\\d{13}\\d{2}", example: "RS35260005601001611379" },
  SA: { code: "SA", name: "Saudi Arabia", length: 24, bbanDescription: "Bank(2) + Account(18)", bbanPattern: "\\d{2}\\d{18}", example: "SA0380000000608010167519" },
  SE: { code: "SE", name: "Sweden", length: 24, bbanDescription: "Bank(3) + Account(16) + Check(1)", bbanPattern: "\\d{3}\\d{16}\\d{1}", example: "SE4550000000058398257466" },
  SI: { code: "SI", name: "Slovenia", length: 19, bbanDescription: "Bank(2) + Branch(3) + Account(8) + Check(2)", bbanPattern: "\\d{2}\\d{3}\\d{8}\\d{2}", example: "SI56263300012039086" },
  SK: { code: "SK", name: "Slovakia", length: 24, bbanDescription: "Bank(4) + Account(6) + Account(10)", bbanPattern: "\\d{4}\\d{6}\\d{10}", example: "SK3112000000198742637541" },
  SM: { code: "SM", name: "San Marino", length: 27, bbanDescription: "Check(1) + Bank(5) + Branch(5) + Account(12)", bbanPattern: "[A-Z]{1}\\d{5}\\d{5}\\d{12}", example: "SM86U0322509800000000270100" },
  TN: { code: "TN", name: "Tunisia", length: 24, bbanDescription: "Bank(2) + Branch(3) + Account(13) + Check(2)", bbanPattern: "\\d{2}\\d{3}\\d{13}\\d{2}", example: "TN5910006035183598478831" },
  TR: { code: "TR", name: "Turkey", length: 26, bbanDescription: "Bank(5) + Reserved(1) + Account(16)", bbanPattern: "\\d{5}\\d{1}\\d{16}", example: "TR330006100519786457841326" },
  UA: { code: "UA", name: "Ukraine", length: 29, bbanDescription: "Bank(6) + Account(19)", bbanPattern: "\\d{6}\\d{19}", example: "UA213996220000026007233566001" },
  VG: { code: "VG", name: "British Virgin Islands", length: 24, bbanDescription: "Bank(4) + Account(16)", bbanPattern: "[A-Z]{4}\\d{16}", example: "VG96VPVG0000012345678901" },
  XK: { code: "XK", name: "Kosovo", length: 20, bbanDescription: "Bank(2) + Branch(2) + Account(10) + Check(2)", bbanPattern: "\\d{2}\\d{2}\\d{10}\\d{2}", example: "XK051212012345678906" },
};

// Character mapping for MOD 97-10 algorithm
const CHAR_TO_NUM: Record<string, string> = {
  'A': '10', 'B': '11', 'C': '12', 'D': '13', 'E': '14', 'F': '15', 'G': '16', 'H': '17', 'I': '18',
  'J': '19', 'K': '20', 'L': '21', 'M': '22', 'N': '23', 'O': '24', 'P': '25', 'Q': '26', 'R': '27',
  'S': '28', 'T': '29', 'U': '30', 'V': '31', 'W': '32', 'X': '33', 'Y': '34', 'Z': '35'
};

/**
 * Calculate MOD 97-10 check digits for IBAN
 */
function calculateCheckDigits(countryCode: string, bban: string): string {
  // Step 1: Create the rearranged string (BBAN + Country + "00")
  const rearranged = bban + countryCode + "00";
  
  // Step 2: Replace letters with numbers
  let numericString = "";
  for (const char of rearranged) {
    if (char in CHAR_TO_NUM) {
      numericString += CHAR_TO_NUM[char];
    } else {
      numericString += char;
    }
  }
  
  // Step 3: Calculate MOD 97
  const remainder = mod97(numericString);
  
  // Step 4: Calculate check digits
  const checkDigits = 98 - remainder;
  
  return checkDigits.toString().padStart(2, "0");
}

/**
 * Validate IBAN using MOD 97-10 algorithm
 */
function validateCheckDigits(iban: string): boolean {
  // Remove spaces and convert to uppercase
  const cleanIban = iban.replace(/\s/g, "").toUpperCase();
  
  if (cleanIban.length < 4) return false;
  
  // Rearrange: move first 4 chars to end
  const rearranged = cleanIban.slice(4) + cleanIban.slice(0, 4);
  
  // Replace letters with numbers
  let numericString = "";
  for (const char of rearranged) {
    if (char in CHAR_TO_NUM) {
      numericString += CHAR_TO_NUM[char];
    } else if (/\d/.test(char)) {
      numericString += char;
    } else {
      return false; // Invalid character
    }
  }
  
  // Calculate MOD 97
  const remainder = mod97(numericString);
  
  return remainder === 1;
}

/**
 * Efficient MOD 97 calculation for large numbers represented as strings
 */
function mod97(numStr: string): number {
  let remainder = 0;
  
  for (let i = 0; i < numStr.length; i++) {
    remainder = (remainder * 10 + parseInt(numStr[i])) % 97;
  }
  
  return remainder;
}

/**
 * Generate a random BBAN for the given country
 */
function generateRandomBban(countryCode: string, customBankCode?: string): string {
  const config = COUNTRY_CONFIGS[countryCode];
  if (!config) {
    throw new Error(`Unsupported country code: ${countryCode}`);
  }
  
  const bbanLength = config.length - 4; // Subtract country code and check digits
  let bban = "";
  
  // For some countries, we can use custom bank codes
  if (customBankCode && customBankCode.length > 0) {
    bban = customBankCode.padEnd(Math.min(customBankCode.length, 8), "0");
    // Fill remaining with random digits
    while (bban.length < bbanLength) {
      bban += Math.floor(Math.random() * 10).toString();
    }
    bban = bban.slice(0, bbanLength);
  } else {
    // Generate completely random BBAN
    for (let i = 0; i < bbanLength; i++) {
      if (config.bbanPattern.includes("[A-Z]") && Math.random() < 0.1) {
        // 10% chance for letter in mixed patterns
        bban += String.fromCharCode(65 + Math.floor(Math.random() * 26));
      } else {
        bban += Math.floor(Math.random() * 10).toString();
      }
    }
  }
  
  return bban;
}

/**
 * Generate a fake IBAN
 */
export function generateFakeIban(countryCode: string, options: GenerationOptions = { mode: "valid" }): GeneratedIBAN {
  const config = COUNTRY_CONFIGS[countryCode];
  if (!config) {
    throw new Error(`Unsupported country code: ${countryCode}`);
  }
  
  // Generate BBAN
  const bban = generateRandomBban(countryCode, options.customBankCode);
  
  let checkDigits: string;
  let isValid: boolean;
  
  if (options.mode === "valid") {
    // Generate valid check digits
    checkDigits = calculateCheckDigits(countryCode, bban);
    isValid = true;
  } else {
    // Generate invalid check digits (for negative testing)
    do {
      checkDigits = Math.floor(Math.random() * 100).toString().padStart(2, "0");
    } while (checkDigits === calculateCheckDigits(countryCode, bban));
    isValid = false;
  }
  
  const raw = countryCode + checkDigits + bban;
  const pretty = formatIBAN(raw);
  const masked = maskIBAN(pretty);
  
  return {
    raw,
    pretty,
    masked,
    country: countryCode,
    length: raw.length,
    isValid,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Format IBAN with spaces every 4 characters
 */
export function formatIBAN(iban: string): string {
  const clean = iban.replace(/\s/g, "").toUpperCase();
  return clean.replace(/(.{4})/g, "$1 ").trim();
}

/**
 * Mask IBAN for privacy (show first 4 and last 2 characters)
 */
function maskIBAN(formattedIban: string): string {
  const clean = formattedIban.replace(/\s/g, "");
  if (clean.length < 6) return formattedIban;
  
  const masked = clean.slice(0, 4) + "*".repeat(clean.length - 6) + clean.slice(-2);
  return formatIBAN(masked);
}

/**
 * Validate IBAN format and checksum
 */
export function validateIBAN(iban: string): ValidationResult {
  const errors: string[] = [];
  
  if (!iban || iban.trim().length === 0) {
    return {
      isValid: false,
      errors: ["IBAN is required"],
    };
  }
  
  // Clean and normalize
  const clean = iban.replace(/\s/g, "").toUpperCase();
  
  // Check minimum length
  if (clean.length < 4) {
    return {
      isValid: false,
      errors: ["IBAN must be at least 4 characters long"],
    };
  }
  
  // Extract country code
  const countryCode = clean.slice(0, 2);
  const checkDigits = clean.slice(2, 4);
  
  // Validate country code
  if (!/^[A-Z]{2}$/.test(countryCode)) {
    errors.push("Country code must be 2 uppercase letters");
  }
  
  // Validate check digits
  if (!/^\d{2}$/.test(checkDigits)) {
    errors.push("Check digits must be 2 numbers");
  }
  
  // Check country configuration
  const config = COUNTRY_CONFIGS[countryCode];
  if (!config) {
    errors.push(`Unsupported country code: ${countryCode}`);
  } else {
    // Check length
    if (clean.length !== config.length) {
      errors.push(`Invalid length for ${countryCode}: expected ${config.length}, got ${clean.length}`);
    }
    
    // Validate character set
    if (!/^[A-Z0-9]+$/.test(clean)) {
      errors.push("IBAN contains invalid characters (only A-Z and 0-9 allowed)");
    }
  }
  
  // Validate checksum if basic format is correct
  let checksumValid = false;
  if (errors.length === 0) {
    checksumValid = validateCheckDigits(clean);
    if (!checksumValid) {
      errors.push("Invalid checksum (MOD 97-10 validation failed)");
    }
  }
  
  const isValid = errors.length === 0;
  
  return {
    isValid,
    formatted: isValid ? formatIBAN(clean) : undefined,
    details: {
      country: countryCode,
      length: clean.length,
      checkDigits,
    },
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Get country information
 */
export function getCountryInfo(countryCode: string): CountryInfo | null {
  return COUNTRY_CONFIGS[countryCode] || null;
}

/**
 * Get all supported countries
 */
export function getSupportedCountries(): CountryInfo[] {
  return Object.values(COUNTRY_CONFIGS).sort((a, b) => a.name.localeCompare(b.name));
}
