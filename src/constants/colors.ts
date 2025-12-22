// constants/colors.ts
const colors = {
  // ===================================
  // ONBOARDING
  // ===================================
  ONBOARDING_BG: "#6A1B9A",
  TITLE_WHITE: "#FFFFFF",
  DOT_INACTIVE: "#C19BEF",
  DOT_ACTIVE: "#FFD54F",
  BUTTON_TEXT: "#6A1B9A",
  SHADOW: "#000000",

  // ===================================
  // AUTH SCREENS (Login, Register, etc)
  // ===================================
  PRIMARY_PURPLE: "#6A1B9A",
  DARK_PURPLE: "#4A148C",
  INPUT_BG: "#fafafa",
  INPUT_BORDER: "#ddd",
  GOOGLE_BORDER: "#ddd",
  GOOGLE_TEXT: "#333",

  // ===================================
  // GENERAL TEXT & BACKGROUND
  // ===================================
  BACKGROUND: "#FFFFFF",
  WHITE: "#FFFFFF",
  TEXT_DARK: "#333333",
  TEXT_GREY: "#666666",
  TEXT_LIGHT_GREY: "#999999",
  LOGOUT_RED: "#E53935",

  // ===================================
  // BOTTOM TAB & HEADER
  // ===================================
  TAB_ACTIVE: "#6A1B9A",
  TAB_INACTIVE: "#999999",
  TAB_BACKGROUND: "#FFFFFF",
  HEADER_TINT: "#6A1B9A",

  // ===================================
  // BONUS: UNTUK NOTES, TODO, PROFILE (SIAP PAKAI NANTI)
  // ===================================
  SUCCESS: "#4CAF50",
  WARNING: "#FF9800",
  DANGER: "#F44336",
  INFO: "#2196F3",
  CARD_BG: "#FAFAFA",
  DIVIDER: "#EEEEEE",
  OVERLAY: "rgba(0,0,0,0.4)",
  FAB_BG: "#6A1B9A",
  FAB_SHADOW: "rgba(106, 27, 154, 0.4)",

  // Di dalam colors object
  CARD_PURPLE: "#E1BEE7",
  CARD_BLUE: "#BBDEFB",
  CARD_GREEN: "#C8E6C9",
  CARD_YELLOW: "#FFF9C4",
  CARD_PINK: "#F8BBD0",
} as const;

export default colors;
