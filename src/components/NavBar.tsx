import { useState, useEffect } from 'react';
import { Menu, X, LogIn, LogOut } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const NavBar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      // Removed setIsScrolled since we're not using isScrolled anymore
      // This keeps the scroll listener for future use if needed
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSignOut = async () => {
    await signOut();
    setIsMobileMenuOpen(false);
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.email) return 'U';
    return user.email.charAt(0).toUpperCase();
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 px-6 md:px-12 h-[72px] transition-all duration-300 bg-white shadow-sm`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between h-full">
        {/* Logo and Website Name */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <div className="h-10 w-10 mr-3 flex items-center justify-center">
              <img src="/lovable-uploads/06435c8d-3aa2-4f47-b98f-e959cedabf1f.png" alt="LifeMemoir Logo" className="w-10 h-10" />
            </div>
            <h1 className="text-xl font-bold text-memoir-darkGray">LifeMemoir</h1>
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          {user ? (
            <>
              <div className="space-x-6">
                <Link to="/dashboard" className="text-memoir-darkGray hover:text-memoir-blueGray transition-colors">Dashboard</Link>
              </div>
              <div className="flex items-center space-x-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10 bg-[#5B9AA0] text-white">
                        <AvatarFallback>{getUserInitials()}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuLabel className="text-sm font-normal opacity-70">{user.email}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard">Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-red-500 focus:text-red-500 cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          ) : (
            <>
              <div className="space-x-6">
                <a href="#hero" className="text-memoir-darkGray hover:text-memoir-blueGray transition-colors">Home</a>
                <a href="#how-it-works" className="text-memoir-darkGray hover:text-memoir-blueGray transition-colors">How It Works</a>
                <a href="#portfolio" className="text-memoir-darkGray hover:text-memoir-blueGray transition-colors">Portfolio</a>
                <a href="#testimonials" className="text-memoir-darkGray hover:text-memoir-blueGray transition-colors">Testimonials</a>
                <a href="#faq" className="text-memoir-darkGray hover:text-memoir-blueGray transition-colors">FAQ</a>
                <a href="#contact" className="text-memoir-darkGray hover:text-memoir-blueGray transition-colors">Contact</a>
              </div>
              
              <div className="flex items-center space-x-3">
                <Link to="/auth">
                  <Button variant="outline" className="secondary-button">
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button className="primary-button">
                    Register
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
        
        {/* Mobile Menu Button */}
        <button onClick={toggleMobileMenu} className="md:hidden text-memoir-darkGray">
          {isMobileMenuOpen ? (
            <X size={24} />
          ) : (
            <Menu size={24} />
          )}
        </button>
      </div>
      
      {/* Mobile Menu */}
      <div className={`md:hidden fixed top-[72px] right-0 bottom-0 w-64 bg-white shadow-lg transform transition-transform ease-in-out duration-300 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col p-6">
          {user ? (
            <>
              <div className="border-b pb-4 mb-4">
                <div className="flex items-center space-x-3 mb-3">
                  <Avatar className="h-10 w-10 bg-[#5B9AA0] text-white">
                    <AvatarFallback>{getUserInitials()}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-semibold text-memoir-darkGray">Account</span>
                    <span className="text-xs text-gray-500">{user.email}</span>
                  </div>
                </div>
              </div>
              
              <Link to="/dashboard" className="py-2 text-memoir-darkGray hover:text-memoir-blueGray transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                Dashboard
              </Link>
              
              <div className="mt-auto pt-4 border-t">
                <Button variant="outline" className="w-full justify-start text-red-500" onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </Button>
              </div>
            </>
          ) : (
            <>
              <a href="#hero" className="py-2 text-memoir-darkGray hover:text-memoir-blueGray transition-colors">Home</a>
              <a href="#how-it-works" className="py-2 text-memoir-darkGray hover:text-memoir-blueGray transition-colors">How It Works</a>
              <a href="#portfolio" className="py-2 text-memoir-darkGray hover:text-memoir-blueGray transition-colors">Portfolio</a>
              <a href="#testimonials" className="py-2 text-memoir-darkGray hover:text-memoir-blueGray transition-colors">Testimonials</a>
              <a href="#faq" className="py-2 text-memoir-darkGray hover:text-memoir-blueGray transition-colors">FAQ</a>
              <a href="#contact" className="py-2 text-memoir-darkGray hover:text-memoir-blueGray transition-colors">Contact</a>
              
              <div className="mt-6 space-y-3">
                <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full secondary-button">
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </Button>
                </Link>
                <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full primary-button">
                    Register
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
