
import { Book } from 'lucide-react';

const Footer = () => {
  return (
    <footer id="contact" className="bg-memoir-darkGray py-12 text-white">
      <div className="container mx-auto px-6">
        {/* Quick Links */}
        <div className="flex flex-wrap justify-center mb-8">
          <a href="#" className="mx-4 mb-4 hover:text-memoir-yellow transition-colors">Privacy Policy</a>
          <a href="#" className="mx-4 mb-4 hover:text-memoir-yellow transition-colors">Terms</a>
          <a href="#" className="mx-4 mb-4 hover:text-memoir-yellow transition-colors">Blog</a>
          <a href="#" className="mx-4 mb-4 hover:text-memoir-yellow transition-colors">Contact</a>
        </div>
        
        {/* Logo and Copyright */}
        <div className="flex flex-col items-center">
          <div className="flex items-center mb-4">
            <div className="h-10 w-10 bg-memoir-yellow rounded-full mr-3 flex items-center justify-center">
              <Book className="text-memoir-darkGray" size={20} />
            </div>
            <h2 className="text-xl font-bold">LifeMemoir</h2>
          </div>
          
          {/* Social Media Icons */}
          <div className="flex space-x-4 mb-6">
            <a href="#" className="hover:text-memoir-yellow transition-colors" aria-label="Facebook">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
            </a>
            <a href="#" className="hover:text-memoir-yellow transition-colors" aria-label="LinkedIn">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                <rect x="2" y="9" width="4" height="12"></rect>
                <circle cx="4" cy="4" r="2"></circle>
              </svg>
            </a>
            <a href="#" className="hover:text-memoir-yellow transition-colors" aria-label="YouTube">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
              </svg>
            </a>
          </div>
          
          <p className="text-sm opacity-70">© 2025 LifeMemoir – All rights reserved</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
