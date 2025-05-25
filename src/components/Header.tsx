import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, Bell, User, Settings } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { useAuth } from "@/hooks/auth";

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header = ({ toggleSidebar }: HeaderProps) => {
  const { user, logout } = useAuth();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const handleSignOut = async () => {
    if (logout) {
      await logout();
    }
  };

  return (
    <header className="border-b dark:border-gray-800 bg-background sticky top-0 z-30 flex h-16 items-center px-4 md:px-6 backdrop-blur-sm">
      <Button variant="ghost" size="icon" className="md:hidden mr-2" onClick={toggleSidebar}>
        <Menu className="h-5 w-5" />
      </Button>
      
      <div className="ml-auto flex items-center gap-2">
        <ModeToggle />
        
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-600"></span>
        </Button>
        
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
        
        <Button variant="ghost" size="icon" onClick={handleSignOut}>
          <User className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};

export default Header;
