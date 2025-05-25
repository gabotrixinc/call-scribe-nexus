
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, Bell, User, Settings, Search } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { useAuth } from "@/hooks/auth";

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header = ({ toggleSidebar }: HeaderProps) => {
  const { user, logout } = useAuth();

  const handleSignOut = async () => {
    if (logout) {
      await logout();
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-20 bg-gradient-to-r from-slate-900/80 via-purple-900/80 to-slate-900/80 backdrop-blur-2xl border-b border-purple-500/20">
      {/* Animated background mesh */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
      
      <div className="relative h-full flex items-center justify-between px-6">
        {/* Left section */}
        <div className="flex items-center space-x-6">
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 hover:border-purple-400/50 transition-all duration-300 hover:scale-110" 
            onClick={toggleSidebar}
          >
            <Menu className="h-5 w-5 text-white" />
          </Button>
          
          {/* Logo/Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-xl shadow-purple-500/25">
              <div className="w-6 h-6 rounded-lg bg-white/20 backdrop-blur-xl"></div>
            </div>
            <span className="text-xl font-bold text-white hidden md:block">Gabotrix CX</span>
          </div>
        </div>

        {/* Center search */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar..." 
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400/50 transition-all duration-300"
            />
          </div>
        </div>
        
        {/* Right section */}
        <div className="flex items-center space-x-3">
          <ModeToggle />
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 hover:border-purple-400/50 transition-all duration-300 hover:scale-110 group"
          >
            <Bell className="h-5 w-5 text-white group-hover:text-purple-300 transition-colors" />
            <span className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-red-500/25">3</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 hover:border-purple-400/50 transition-all duration-300 hover:scale-110 group"
          >
            <Settings className="h-5 w-5 text-white group-hover:text-purple-300 transition-colors group-hover:rotate-90 duration-300" />
          </Button>
          
          {/* User Profile */}
          <div className="flex items-center space-x-3 pl-3 pr-4 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 hover:border-purple-400/50 transition-all duration-300 cursor-pointer">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
              <User className="h-4 w-4 text-white" />
            </div>
            <span className="text-white text-sm font-medium hidden lg:block">Usuario</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
