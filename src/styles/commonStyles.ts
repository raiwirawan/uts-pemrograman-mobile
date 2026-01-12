// src/styles/commonStyles.ts

import colors from "@/constants/colors";
import { StyleSheet } from "react-native";

/**
 * Common reusable styles across the app
 * Organized by component type and usage pattern
 */
export const commonStyles = StyleSheet.create({
  // ============================================
  // CONTAINERS
  // ============================================
  container: {
    flex: 1,
    backgroundColor: colors.BACKGROUND,
  },

  containerWhite: {
    flex: 1,
    backgroundColor: colors.WHITE,
  },

  scrollContent: {
    flexGrow: 1,
    padding: 30,
    paddingTop: 60,
  },

  scrollContentPadding: {
    padding: 20,
    paddingBottom: 20,
  },

  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  // ============================================
  // INPUTS
  // ============================================
  input: {
    borderWidth: 1,
    borderColor: colors.INPUT_BORDER,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: colors.INPUT_BG,
    color: colors.TEXT_DARK,
  },

  titleInput: {
    fontSize: 20,
    fontWeight: "bold",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.DIVIDER,
    borderRadius: 12,
    marginBottom: 20,
    backgroundColor: colors.CARD_BG,
    color: colors.TEXT_DARK,
  },

  contentInput: {
    fontSize: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.DIVIDER,
    borderRadius: 12,
    minHeight: 320,
    backgroundColor: colors.CARD_BG,
    lineHeight: 24,
    color: colors.TEXT_DARK,
    textAlignVertical: "top",
  },

  // Password Input Container
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.INPUT_BORDER,
    borderRadius: 12,
    backgroundColor: colors.INPUT_BG,
    paddingHorizontal: 16,
  },

  passwordInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: colors.TEXT_DARK,
  },

  eyeIcon: {
    marginLeft: 10,
  },

  // Search Input
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.WHITE,
    height: 45,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: colors.DIVIDER,
    paddingHorizontal: 12,
    marginRight: 10,
  },

  searchInput: {
    flex: 1,
    top: 3,
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: colors.TEXT_DARK,
  },

  // ============================================
  // LABELS & TEXT
  // ============================================
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.TEXT_GREY,
    marginBottom: 8,
  },

  labelLarge: {
    fontSize: 16,
    color: colors.TEXT_DARK,
    marginBottom: 8,
    marginTop: 16,
  },

  helperText: {
    fontSize: 14,
    color: colors.TEXT_GREY,
    marginTop: 8,
  },

  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.DARK_PURPLE,
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 16,
    color: colors.TEXT_GREY,
    marginBottom: 40,
    lineHeight: 24,
  },

  // ============================================
  // BUTTONS
  // ============================================
  primaryButton: {
    backgroundColor: colors.PRIMARY_PURPLE,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    borderRadius: 30,
    gap: 10,
  },

  primaryButtonText: {
    color: colors.WHITE,
    fontSize: 18,
    fontWeight: "600",
  },

  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.GOOGLE_BORDER,
    paddingVertical: 14,
    borderRadius: 30,
    gap: 12,
    backgroundColor: colors.WHITE,
  },

  secondaryButtonText: {
    fontSize: 16,
    color: colors.GOOGLE_TEXT,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  // Icon Button
  iconBtn: {
    flex: 0.5,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.CARD_BG,
    borderWidth: 1,
    borderColor: colors.DIVIDER,
  },

  // ============================================
  // FOOTER ACTIONS
  // ============================================
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.WHITE,
    borderTopWidth: 1,
    borderTopColor: colors.DIVIDER,
    elevation: 8,
    shadowColor: colors.SHADOW,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },

  saveBtn: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: colors.FAB_BG,
    gap: 10,
  },

  saveBtnDisabled: {
    opacity: 0.7,
  },

  saveText: {
    color: colors.WHITE,
    fontSize: 16,
    fontWeight: "600",
  },

  // ============================================
  // FAB (Floating Action Button)
  // ============================================
  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: colors.FAB_BG,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: colors.FAB_SHADOW,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
  },

  // ============================================
  // CARDS
  // ============================================
  card: {
    backgroundColor: colors.WHITE,
    padding: 12,
    borderRadius: 12,
    shadowColor: colors.SHADOW,
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 2,
    borderWidth: 1,
    borderColor: "transparent",
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },

  cardFooter: {
    marginTop: "auto",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  // ============================================
  // MODAL
  // ============================================
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContent: {
    width: "80%",
    backgroundColor: colors.WHITE,
    borderRadius: 15,
    padding: 20,
    elevation: 5,
  },

  modalTitle: {
    fontFamily: "Poppins-Bold",
    fontSize: 16,
    marginBottom: 15,
    textAlign: "center",
  },

  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },

  // ============================================
  // DIVIDER
  // ============================================
  divider: {
    height: 1,
    backgroundColor: colors.DIVIDER,
    marginVertical: 15,
  },

  dividerThick: {
    height: 1,
    backgroundColor: colors.DIVIDER,
    marginVertical: 30,
  },

  // ============================================
  // IMAGE COMPONENTS
  // ============================================
  imageContainer: {
    position: "relative",
    marginBottom: 20,
    borderRadius: 12,
    overflow: "hidden",
  },

  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    backgroundColor: colors.DIVIDER,
  },

  removeImageBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: colors.WHITE,
    borderRadius: 16,
  },

  addImageBtn: {
    height: 120,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: colors.PRIMARY_PURPLE,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: colors.CARD_BG,
    gap: 8,
  },

  addImageText: {
    color: colors.PRIMARY_PURPLE,
    fontSize: 16,
    fontWeight: "600",
  },

  // ============================================
  // LOCATION COMPONENTS
  // ============================================
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderWidth: 1,
    borderColor: colors.PRIMARY_PURPLE,
    borderRadius: 12,
    marginBottom: 20,
    backgroundColor: colors.CARD_BG,
  },

  locationContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },

  locationTextContainer: {
    marginLeft: 10,
    flex: 1,
  },

  locationText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.TEXT_DARK,
    marginBottom: 2,
  },

  locationCoords: {
    fontSize: 11,
    color: colors.TEXT_GREY,
  },

  addLocationBtn: {
    height: 100,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: colors.PRIMARY_PURPLE,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: colors.CARD_BG,
    gap: 8,
  },

  addLocationText: {
    color: colors.PRIMARY_PURPLE,
    fontSize: 16,
    fontWeight: "600",
  },

  // ============================================
  // EMPTY STATE
  // ============================================
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 100,
  },

  emptyTitle: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: colors.TEXT_DARK,
    marginTop: 20,
  },

  // ============================================
  // SELECTION MODE
  // ============================================
  selectedCard: {
    backgroundColor: "#F3E5F5",
    borderColor: colors.PRIMARY_PURPLE,
  },

  selectionOverlay: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 10,
  },
});

/**
 * Utility functions for creating dynamic styles
 */
export const createDynamicStyles = {
  // Create padding with custom values
  padding: (value: number) => ({
    padding: value,
  }),

  // Create margin with custom values
  margin: (value: number) => ({
    margin: value,
  }),

  // Create flex with custom value
  flex: (value: number) => ({
    flex: value,
  }),

  // Create opacity
  opacity: (value: number) => ({
    opacity: value,
  }),
};

/**
 * Common style combinations for specific use cases
 */
export const stylePresets = {
  // KeyboardAvoidingView for iOS
  keyboardAvoidingView: {
    flex: 1,
  },

  // Standard scroll view content
  scrollViewContent: {
    flexGrow: 1,
    padding: 30,
    paddingTop: 60,
  },

  // Card in list view
  cardListView: {
    width: "100%",
    marginBottom: 10,
    minHeight: 80,
  },

  // Header row with search and actions
  headerRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: 12,
    marginBottom: 8,
    marginTop: 12,
  },

  // Filter info banner
  filterInfo: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    paddingHorizontal: 20,
    marginBottom: 10,
    alignItems: "center" as const,
  },
};