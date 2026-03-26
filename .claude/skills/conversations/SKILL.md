---
description: "Expert skill for the ToK Conversations/Chat section. TRIGGER when the user mentions: conversations, chat, messages, WhatsApp, mensajes, contact panel, message bubble, conversation list, chat input, bot toggle, send message, inbound/outbound, media messages, or any work on the /conversations page."
---

# ToK Conversations/Chat Expert

You are an expert on the ToK Conversations & WhatsApp Chat section.

## Architecture

**Page**: `tok-frontend/src/app/(app)/conversations/page.tsx`
- 3-panel layout: ConversationList | ChatWindow | ContactPanel
- Mobile: shows list OR chat (not both), toggle via `activeConversationId`

**Components** (in `tok-frontend/src/components/chat/`):
- `ConversationList.tsx` — Left sidebar list of conversations with search, sort, filters
- `ChatWindow.tsx` — Main chat area with messages and input
- `ChatInput.tsx` — Message input with text, file upload, media support
- `MessageBubble.tsx` — Individual message display (text, images, video, audio, documents)
- `ContactPanel.tsx` — Right panel showing contact details, history, bot toggle, next appointment

**Hooks**:
- `useConversations.ts` — `GET /conversations`, query key `["conversations"]`
- `useMessages.ts` — `GET /conversations/:id/messages`, query key `["messages", conversationId]`, polls every 10s
- `useContact.ts` — `GET /contacts/:phone`, query key `["contact", phone]`, returns flattened Contact with history

**Store**: `tok-frontend/src/stores/chat-store.ts` (Zustand)
```typescript
interface ChatState {
  activeConversationId: number | null;
  activePhone: string | null;
  activeName: string | null;
  showContactPanel: boolean;
  setActiveConversation(id, phone?, name?): void;
  toggleContactPanel(): void;
}
```

**Types**:
```typescript
interface Conversation {
  id: number; contact_id: number; estado: string; etiqueta: string | null;
  nombre_whatsapp: string; nombre_real: string | null; telefono: string;
  etapa: string | null; ultimo_mensaje: string | null;
  ultimo_mensaje_timestamp: string | null; last_activity: string | null;
}
interface Message {
  id: number; conversation_id: number; direccion: "inbound" | "outbound";
  tipo: "texto" | "imagen" | "video" | "audio" | "documento";
  contenido: string; sender_type: "bot" | "human" | "whatsapp" | null;
  timestamp: string;
}
```

**Backend endpoints**:
- `GET /conversations` — List all open conversations for company
- `GET /conversations/:id/messages` — Messages for a conversation
- `POST /messages/send` — Proxy to n8n for sending WhatsApp messages
- `PUT /contacts/:phone/bot-toggle` — Toggle bot on/off for contact
- `PUT /contacts/update-etapa` — Update contact funnel stage
- `POST /webhook/n8n` (line 294) — Receives messages from n8n, saves to DB, emits socket

**Socket Events** (via `SocketProvider`):
- `nuevo_mensaje` — Invalidates conversations + messages queries
- `bot_status_changed` — Invalidates conversations + contact queries

## UI Patterns
- Conversation list width: `w-full lg:w-[320px] xl:w-[340px]`
- Mobile: list hidden when chat active, chat hidden when no selection
- Message sending goes: Frontend → `POST /messages/send` → Backend → n8n → YCloud → WhatsApp
- Message receiving: YCloud → n8n → `POST /webhook/n8n` → DB + Socket → Frontend
- Media: images/video/audio displayed inline, documents as download links
- Media URLs: stored as `/uploads/filename.ext`, resolved via `resolveMediaUrl()` in `lib/utils.ts`
- Bot toggle: per-contact, auto-disables when human sends message (if `bot_auto_desactivar` enabled)
