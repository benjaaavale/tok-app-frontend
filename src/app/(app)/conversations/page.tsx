"use client";

import { useChatStore } from "@/stores/chat-store";
import { ConversationList } from "@/components/chat/ConversationList";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { ContactPanel } from "@/components/chat/ContactPanel";
import { cn } from "@/lib/utils";

export default function ConversationsPage() {
  const { activeConversationId } = useChatStore();

  return (
    <div className="flex h-full overflow-hidden">
      {/* Conversation list - hides on mobile when chat is open */}
      <div
        className={cn(
          "w-full lg:w-[320px] xl:w-[340px] flex-shrink-0",
          activeConversationId ? "hidden lg:block" : "block"
        )}
      >
        <ConversationList />
      </div>

      {/* Chat window - hides on mobile when no conversation selected */}
      <div
        className={cn(
          "flex-1 min-w-0",
          activeConversationId ? "block" : "hidden lg:block"
        )}
      >
        <ChatWindow />
      </div>

      {/* Contact panel - only visible on desktop when toggled */}
      <ContactPanel />
    </div>
  );
}
