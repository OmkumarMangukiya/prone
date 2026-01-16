"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useSocket } from "@/components/SocketProvider";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MessageSquare, ArrowLeft } from "lucide-react";

interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
}

interface Message {
    id: string;
    content: string;
    senderId: string;
    createdAt: string;
    sender: User;
}

interface Conversation {
    id: string;
    participants: { user: User }[];
    messages: Message[];
    updatedAt: string;
}

interface ChatSheetProps {
    isOpen: boolean;
    onClose: () => void;
    initialConversationId?: string | null;
}

export default function ChatSheet({ isOpen, onClose, initialConversationId }: ChatSheetProps) {
    const { data: session } = useSession();
    const { socket } = useSocket();

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (initialConversationId) {
            setActiveConversationId(initialConversationId);
        }
    }, [initialConversationId]);

    // Fetch conversations list
    useEffect(() => {
        if (isOpen) {
            fetchConversations();
        }
    }, [isOpen]);

    // Join room and fetch messages when conversation is active
    useEffect(() => {
        if (!activeConversationId || !socket) return;

        socket.emit("join_conversation", activeConversationId);
        fetchMessages(activeConversationId);

        const handleReceiveMessage = (message: Message) => {
            setMessages((prev) => {
                // Avoid duplicates if any
                if (prev.some(m => m.id === message.id)) return prev;
                return [...prev, message];
            });
            // Also update conversation last message preview in list
            fetchConversations();
            scrollToBottom();
        };

        socket.on("receive_message", handleReceiveMessage);

        return () => {
            socket.off("receive_message", handleReceiveMessage);
        };
    }, [activeConversationId, socket]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };

    const fetchConversations = async () => {
        try {
            const res = await fetch("/api/chat/conversations");
            if (res.ok) {
                setConversations(await res.json());
            }
        } catch (error) {
            console.error("Failed to fetch conversations", error);
        }
    };

    const fetchMessages = async (conversationId: string) => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/chat/conversations/${conversationId}/messages`);
            if (res.ok) {
                setMessages(await res.json());
            }
        } catch (error) {
            console.error("Failed to fetch messages", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConversationId || !session?.user) return;

        try {
            const res = await fetch(`/api/chat/conversations/${activeConversationId}/messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: newMessage }),
            });

            if (res.ok) {
                const message = await res.json();
                socket?.emit("send_message", { ...message, conversationId: activeConversationId });
                // Optimistically add? Wait for socket? 
                // We actally get the socket event ourselves usually, or we can push it now.
                // Let's rely on the socket event for consistency or manually add it if we filter out self-messages in socket listener.
                // In the Setup, we emit back to everyone, including sender. So we wait for that.
                setNewMessage("");
            }
        } catch (error) {
            console.error("Failed to send message", error);
        }
    };

    const getOtherUser = (conversation: Conversation) => {
        return conversation.participants.find(p => p.user.id !== session?.user?.id)?.user || { name: "User", email: "", id: "" };
    };

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent side="right" className="w-[400px] sm:w-[540px] p-0 flex flex-col">
                <SheetHeader className="p-4 border-b">
                    {activeConversationId ? (
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={() => setActiveConversationId(null)}>
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                            <div className="flex items-center gap-2">
                                {(() => {
                                    const activeConv = conversations.find(c => c.id === activeConversationId);
                                    if (!activeConv) return <SheetTitle>Chat</SheetTitle>;
                                    const otherUser = getOtherUser(activeConv);
                                    return (
                                        <>
                                            <Avatar className="w-8 h-8">
                                                <AvatarImage src={otherUser.avatar} />
                                                <AvatarFallback>{otherUser.name?.[0]}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <SheetTitle className="text-sm font-medium">{otherUser.name || otherUser.email}</SheetTitle>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        </div>
                    ) : (
                        <SheetTitle>Messages</SheetTitle>
                    )}
                </SheetHeader>

                <div className="flex-1 overflow-hidden flex flex-col">
                    {!activeConversationId ? (
                        <ScrollArea className="h-full">
                            <div className="flex flex-col">
                                {conversations.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500">
                                        No conversations yet.
                                    </div>
                                ) : (
                                    conversations.map((conv) => {
                                        const otherUser = getOtherUser(conv);
                                        const lastMessage = conv.messages[0];
                                        return (
                                            <button
                                                key={conv.id}
                                                onClick={() => setActiveConversationId(conv.id)}
                                                className="flex items-center gap-3 p-4 hover:bg-gray-50 border-b text-left w-full transition-colors"
                                            >
                                                <Avatar>
                                                    <AvatarImage src={otherUser.avatar} />
                                                    <AvatarFallback>{otherUser.name?.[0] || otherUser.email?.[0]}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 overflow-hidden">
                                                    <div className="flex justify-between items-baseline">
                                                        <span className="font-medium truncate">{otherUser.name || otherUser.email}</span>
                                                        {lastMessage && (
                                                            <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                                                                {new Date(lastMessage.createdAt).toLocaleDateString()}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-500 truncate">
                                                        {lastMessage ? lastMessage.content : "No messages yet"}
                                                    </p>
                                                </div>
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </ScrollArea>
                    ) : (
                        <>
                            <ScrollArea className="flex-1 p-4">
                                <div className="space-y-4">
                                    {isLoading ? (
                                        <div className="text-center text-sm text-gray-500">Loading history...</div>
                                    ) : (
                                        messages.map((msg) => {
                                            const isMe = msg.senderId === session?.user?.id;
                                            return (
                                                <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                                                    <div
                                                        className={`max-w-[70%] rounded-lg p-3 ${isMe
                                                            ? "bg-blue-500 text-white"
                                                            : "bg-gray-100 text-gray-900"
                                                            }`}
                                                    >
                                                        <p className="text-sm">{msg.content}</p>
                                                        <span className={`text-[10px] block mt-1 ${isMe ? "text-blue-100" : "text-gray-400"}`}>
                                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                    <div ref={scrollRef} />
                                </div>
                            </ScrollArea>
                            <div className="p-4 border-t bg-white">
                                <form onSubmit={handleSendMessage} className="flex gap-2">
                                    <Input
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type a message..."
                                        className="flex-1"
                                    />
                                    <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                                        <Send className="w-4 h-4" />
                                    </Button>
                                </form>
                            </div>
                        </>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
