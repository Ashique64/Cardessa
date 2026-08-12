import { create } from "zustand";

export const useAlertStore = create((set) => ({
  isOpen: false,
  message: "",
  type: "info", // "info" | "success" | "error"
  title: "",
  callback: null,

  showAlert: (message, type = "info", title = "", callback = null) => {
    let finalType = type;
    let cleanMsg = message ? String(message) : "";
    
    // Auto-detect type based on string prefix
    if (cleanMsg.startsWith("✓") || cleanMsg.toLowerCase().includes("success")) {
      finalType = "success";
      if (cleanMsg.startsWith("✓")) {
        cleanMsg = cleanMsg.substring(1).trim();
      }
    } else if (cleanMsg.startsWith("⚠") || cleanMsg.toLowerCase().includes("error") || cleanMsg.toLowerCase().includes("failed")) {
      finalType = "error";
      if (cleanMsg.startsWith("⚠")) {
        cleanMsg = cleanMsg.substring(1).trim();
      }
    }
    
    const finalTitle = title || (finalType === "success" ? "Success" : finalType === "error" ? "Notification" : "Notice");
    
    set({
      isOpen: true,
      message: cleanMsg,
      type: finalType,
      title: finalTitle,
      callback,
    });
  },

  hideAlert: () => {
    set((state) => {
      if (state.callback) {
        state.callback();
      }
      return { isOpen: false, message: "", callback: null };
    });
  },
}));
