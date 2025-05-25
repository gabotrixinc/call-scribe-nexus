
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
    <header className="glass-panel sticky top-0 z-30 flex h-16 items-center px-4 md:px-6 backdrop-blur-xl border-b border-white/10 relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-green-500/5 animate-gradient-shift"></div>
      
      <Button 
        variant="ghost" 
        size="icon" 
        className="md:hidden mr-2 relative z-10 hover:bg-white/10 transition-all duration-300 hover:scale-110 modern-button" 
        onClick={toggleSidebar}
      >
        <Menu className="h-5 w-5" />
      </Button>
      
      <div className="ml-auto flex items-center gap-2 relative z-10">
        <ModeToggle />
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative hover:bg-white/10 transition-all duration-300 hover:scale-110 group"
        >
          <Bell className="h-5 w-5 group-hover:animate-pulse" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 animate-pulse neon-glow"></span>
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="hover:bg-white/10 transition-all duration-300 hover:scale-110 group"
        >
          <Settings className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleSignOut}
          className="hover:bg-white/10 transition-all duration-300 hover:scale-110 group"
        >
          <User className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
        </Button>
      </div>
    </header>
  );
};

export default Header;
