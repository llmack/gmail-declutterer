import React from "react";
import { useAuth } from "@/hooks/useGoogleAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "wouter";

interface HeaderProps {
  showProfile?: boolean;
}

const Header: React.FC<HeaderProps> = ({ showProfile = false }) => {
  const { userInfo, logout } = useAuth();

  return (
    <header className="bg-surface shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* App Logo */}
          <Link href="/">
            <div className="w-10 h-10 flex items-center justify-center cursor-pointer overflow-hidden rounded-md">
              <img
                src="/attached_assets/gmail%20declutterer.jpg"
                alt="Gmail Declutter Logo"
                className="w-full h-full object-cover"
              />
            </div>
          </Link>
          <Link href="/">
            <h1 className="font-sans text-xl font-medium text-text-primary cursor-pointer">
              Gmail Declutter
            </h1>
          </Link>
        </div>

        {/* User profile - shown only when authenticated and showProfile is true */}
        {showProfile && userInfo.isAuthenticated && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-text-secondary hidden md:inline">
              {userInfo.email}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 rounded-full"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary text-white">
                      {userInfo.name
                        ? userInfo.name.substring(0, 2).toUpperCase()
                        : userInfo.email.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="flex items-center justify-start p-2">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {userInfo.name || "User"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {userInfo.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => logout()}
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
