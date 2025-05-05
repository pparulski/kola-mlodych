
import React from 'react';

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
      <div className="flex flex-col space-y-1">
        <p>© {new Date().getFullYear()} Koła Młodych OZZ IP</p>
        <p>Kontakt: <ObfuscatedEmail /></p>
        <p className="text-xs">
          <a 
            href="https://ozzip.pl" 
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            ozzip.pl
          </a>
        </p>
      </div>
    </div>
  );
}
