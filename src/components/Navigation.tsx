"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import {
  Home,
  FolderOpen,
  CheckSquare,
  Users,
  Settings,
  Menu,
  X,
  User,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useChat } from "@/components/ChatProvider";

export default function Navigation() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { openChat } = useChat();

  // Don't show navigation on auth pages
  if (
    pathname.startsWith("/signin") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/verify-email") ||
    pathname.startsWith("/forgot-password")
  ) {
    return null;
  }

  // Don't show navigation if not authenticated (except loading state)
  if (status === "unauthenticated") {
    return null;
  }

  const navigationItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Projects", href: "/projects", icon: FolderOpen },
    { name: "Tasks", href: "/tasks", icon: CheckSquare },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="border-b bg-background sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side - Logo and Navigation */}
          <div className="flex">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Button
                variant="ghost"
                onClick={() => router.push("/dashboard")}
                className="text-2xl font-bold p-0 h-auto hover:bg-transparent"
              >
                Prone
              </Button>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:ml-8 md:flex md:space-x-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.name}
                    variant={isActive(item.href) ? "secondary" : "ghost"}
                    onClick={() => router.push(item.href)}
                    className="flex items-center gap-2"
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Right side - User menu */}
          <div className="flex items-center gap-2">
            {status === "loading" ? (
              <div className="animate-pulse">
                <div className="w-8 h-8 bg-muted rounded-full"></div>
              </div>
            ) : session ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openChat()}
                  className="text-gray-500 hover:text-gray-900"
                >
                  <MessageCircle className="w-5 h-5" />
                </Button>

                {/* Desktop User Menu */}
                <div className="hidden md:ml-2 md:flex md:items-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="flex items-center gap-2 p-2"
                      >
                        <Avatar className="w-8 h-8">
                          <AvatarImage
                            src={session.user.image || ""}
                            alt="Profile"
                          />
                          <AvatarFallback>
                            {(session.user.name || session.user.email || "U")
                              .charAt(0)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">
                          {session.user.name || session.user.email}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem
                        onClick={() => router.push("/dashboard/profile")}
                      >
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled>
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => signOut({ callbackUrl: "/signin" })}
                        className="text-destructive focus:text-destructive"
                      >
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Mobile menu button */}
                <div className="md:hidden">
                  <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Menu className="w-6 h-6" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-80">
                      <div className="flex flex-col space-y-4 mt-6">
                        <div className="flex items-center space-x-3 pb-4 border-b">
                          <Avatar className="w-10 h-10">
                            <AvatarImage
                              src={session.user.image || ""}
                              alt="Profile"
                            />
                            <AvatarFallback>
                              {(session.user.name || session.user.email || "U")
                                .charAt(0)
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-base font-medium">
                              {session.user.name || session.user.email}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {session.user.email}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1">
                          {navigationItems.map((item) => {
                            const Icon = item.icon;
                            return (
                              <Button
                                key={item.name}
                                variant={
                                  isActive(item.href) ? "secondary" : "ghost"
                                }
                                onClick={() => {
                                  router.push(item.href);
                                  setShowMobileMenu(false);
                                }}
                                className="w-full justify-start gap-3"
                              >
                                <Icon className="w-5 h-5" />
                                {item.name}
                              </Button>
                            );
                          })}
                        </div>

                        <div className="space-y-1 pt-4 border-t">
                          <Button
                            variant="ghost"
                            onClick={() => {
                              router.push("/dashboard/profile");
                              setShowMobileMenu(false);
                            }}
                            className="w-full justify-start gap-3"
                          >
                            <User className="w-5 h-5" />
                            Profile
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => signOut({ callbackUrl: "/signin" })}
                            className="w-full justify-start gap-3 text-destructive hover:text-destructive"
                          >
                            Sign Out
                          </Button>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </nav>
  );
}
