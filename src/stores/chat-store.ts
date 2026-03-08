import { create } from "zustand";

interface ChatState {
  activeConversationId: number | null;
  activePhone: string | null;
  activeName: string | null;
  showContactPanel: boolean;

  setActiveConversation: (id: number | null, phone?: string | null, name?: string | null) => void;
  toggleContactPanel: () => void;
  setShowContactPanel: (show: boolean) => void;
  reset: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  activeConversationId: null,
  activePhone: null,
  activeName: null,
  showContactPanel: false,

  setActiveConversation: (id, phone = null, name = null) =>
    set({ activeConversationId: id, activePhone: phone, activeName: name }),

  toggleContactPanel: () =>
    set((state) => ({ showContactPanel: !state.showContactPanel })),

  setShowContactPanel: (show) => set({ showContactPanel: show }),

  reset: () =>
    set({
      activeConversationId: null,
      activePhone: null,
      activeName: null,
      showContactPanel: false,
    }),
}));
