import { create } from "zustand";

export const useEditorStore = create((set) => ({
  step: 1,
  maxAllowedStep: 1,
  showPhonePreview: false,

  // AI Copilot
  showAiCopilot: false,
  aiTone: "romantic",
  aiDetails: "",
  aiGroom: "",
  aiBride: "",
  aiLoading: false,
  aiVariations: [],
  aiSelectedField: "",

  // Actions
  setStep: (step) => set({ step }),
  setMaxAllowedStep: (maxAllowedStep) => set({ maxAllowedStep }),
  setShowPhonePreview: (showPhonePreview) => set({ showPhonePreview }),

  setShowAiCopilot: (showAiCopilot) => set({ showAiCopilot }),
  setAiTone: (aiTone) => set({ aiTone }),
  setAiDetails: (aiDetails) => set({ aiDetails }),
  setAiGroom: (aiGroom) => set({ aiGroom }),
  setAiBride: (aiBride) => set({ aiBride }),
  setAiLoading: (aiLoading) => set({ aiLoading }),
  setAiVariations: (aiVariations) => set({ aiVariations }),
  setAiSelectedField: (aiSelectedField) => set({ aiSelectedField }),

  // Reset editor state
  resetEditor: () =>
    set({
      step: 1,
      maxAllowedStep: 1,
      showPhonePreview: false,
      showAiCopilot: false,
      aiTone: "romantic",
      aiDetails: "",
      aiGroom: "",
      aiBride: "",
      aiLoading: false,
      aiVariations: [],
      aiSelectedField: "",
    }),
}));
