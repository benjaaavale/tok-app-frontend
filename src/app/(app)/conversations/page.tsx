"use client";

import { useChatStore } from "@/stores/chat-store";
import { ConversationList } from "@/components/chat/ConversationList";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { ContactPanel } from "@/components/chat/ContactPanel";
import { ConnectEmptyState } from "@/components/ui/ConnectEmptyState";
import { WhatsAppLogo } from "@/components/ui/BrandLogos";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { cn } from "@/lib/utils";

export default function ConversationsPage() {
  const { activeConversationId } = useChatStore();
  const { data: settings, isLoading } = useCompanySettings();

  const hasChannel =
    !!settings?.ycloud_apikey ||
    settings?.messenger_connected ||
    settings?.instagram_connected;

  if (!isLoading && !hasChannel) {
    return (
      <ConnectEmptyState
        icon={<WhatsAppLogo size={32} />}
        title="Conecta algún canal para usar esta función"
        description="Necesitas conectar WhatsApp, Messenger o Instagram para ver y responder conversaciones."
        ctaLabel="Ir a integraciones"
        ctaHref="/settings?section=whatsapp"
      />
    );
  }

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
