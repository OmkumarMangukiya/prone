"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import ChatSheet from "@/components/ChatSheet";
import { useSession } from "next-auth/react";

interface ChatContextType {
    openChat: (userId?: string) => void;
    closeChat: () => void;
}

const ChatContext = createContext<ChatContextType>({
    openChat: () => { },
    closeChat: () => { },
});

export const useChat = () => useContext(ChatContext);

export function ChatProvider({ children }: { children: ReactNode }) {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const [targetUserId, setTargetUserId] = useState<string | null>(null);
    const [conversationId, setConversationId] = useState<string | null>(null);

    const openChat = async (userId?: string) => {
        setIsOpen(true);
        if (userId) {
            // If userId is provided, we need to find/create the conversation first or let ChatSheet handle it by ID?
            // ChatSheet takes `initialConversationId`.
            // API POST /api/chat/conversations returns the conversation object (containing ID).
            // So we should do the API call here or inside ChatSheet if we passed userId.
            // ChatSheet currently expects initialConversationId.
            // Let's do the API call here to get the ID.
            try {
                const res = await fetch("/api/chat/conversations", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId }),
                });
                if (res.ok) {
                    const conv = await res.json();
                    setConversationId(conv.id);
                }
            } catch (err) {
                console.error("Failed to initiate chat", err);
            }
        } else {
            setConversationId(null);
        }
    };

    const closeChat = () => {
        setIsOpen(false);
        setConversationId(null);
    };

    return (
        <ChatContext.Provider value={{ openChat, closeChat }}>
            {children}
            {session && (
                <ChatSheet
                    isOpen={isOpen}
                    onClose={closeChat}
                    initialConversationId={conversationId}
                />
            )}
        </ChatContext.Provider>
    );
}
