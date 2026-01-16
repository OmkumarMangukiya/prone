"use client";

import { SessionProvider } from "next-auth/react";
import { SocketProvider } from "@/components/SocketProvider";
import { ChatProvider } from "@/components/ChatProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SocketProvider>
        <ChatProvider>{children}</ChatProvider>
      </SocketProvider>
    </SessionProvider>
  );
}
