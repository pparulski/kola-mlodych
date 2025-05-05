
import React from 'react';
import { Mail, ExternalLink } from 'lucide-react';

// Email obfuscation component to protect from spam crawlers
function ObfuscatedEmail() {
  // Split the email into parts
  const emailParts = {
    username: 'mlodzi.ip',
    domain: 'ozzip.pl'
  };
  
  return (
    <span>
      {emailParts.username}
      <span className="hidden">no-spam</span>
      [at]
      <span className="hidden">no-spam</span>
      {emailParts.domain}
    </span>
  );
}

export function SidebarFooterContent() {
  return (
    <div className="px-4 py-3 text-xs text-muted-foreground">
      <div className="flex flex-col space-y-2">
        <p>© {new Date().getFullYear()} Koła Młodych OZZ IP</p>
        
        <div className="flex items-center space-x-1.5">
          <Mail className="h-3.5 w-3.5" />
          <span>Kontakt: <ObfuscatedEmail /></span>
        </div>
        
        <div className="flex items-center space-x-1.5">
          <ExternalLink className="h-3.5 w-3.5" />
          <a 
            href="https://ozzip.pl" 
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            ozzip.pl
          </a>
        </div>
      </div>
    </div>
  );
}
