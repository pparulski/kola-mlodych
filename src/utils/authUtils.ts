
import { supabase } from "@/integrations/supabase/client";

// Type definitions for rate limiting
export interface RateLimitStatus {
  blocked: boolean;
  reason?: string;
  duration?: string;
  attemptsLeft: number;
}

/**
 * Checks if login attempts from an IP address have exceeded rate limits
 * @param ip - The IP address to check
 * @returns Rate limit status information
 */
export const checkLoginAttempts = async (ip: string): Promise<RateLimitStatus> => {
  // Check attempts in the last 10 minutes
  const { data: recentAttempts, error: recentError } = await supabase
    .rpc('get_recent_login_attempts', { 
      ip_addr: ip,
      minutes_ago: 10
    });
  
  if (recentError) {
    console.error('Error checking recent login attempts:', recentError);
    return { blocked: false, attemptsLeft: 3 };
  }
  
  // If 3 or more attempts in the last 10 minutes, block for 10 minutes
  if (recentAttempts && typeof recentAttempts === 'number' && recentAttempts >= 3) {
    return { 
      blocked: true, 
      reason: "10 minutes", 
      duration: "10 minut",
      attemptsLeft: 0 
    };
  }
  
  // Check attempts in the last 24 hours
  const { data: dayAttempts, error: dayError } = await supabase
    .rpc('get_daily_login_attempts', { 
      ip_addr: ip,
      hours_ago: 24
    });
  
  if (dayError) {
    console.error('Error checking 24h login attempts:', dayError);
    return { blocked: false, attemptsLeft: 3 };
  }
  
  // If 10 or more attempts in the last 24 hours, block for 24 hours
  if (dayAttempts && typeof dayAttempts === 'number' && dayAttempts >= 10) {
    return { 
      blocked: true, 
      reason: "24 hours", 
      duration: "24 godzin",
      attemptsLeft: 0 
    };
  }
  
  // Not blocked, return attempts left
  const attemptsLeft = recentAttempts && typeof recentAttempts === 'number' ? 3 - recentAttempts : 3;
  
  return { 
    blocked: false, 
    attemptsLeft: attemptsLeft 
  };
};

/**
 * Records a login attempt in the database
 * @param ip - The IP address making the attempt
 * @param success - Whether the login was successful
 */
export const recordLoginAttempt = async (ip: string, success: boolean): Promise<void> => {
  const { error } = await supabase
    .rpc('record_login_attempt', { 
      ip_addr: ip,
      was_successful: success
    });
  
  if (error) {
    console.error('Error recording login attempt:', error);
  }
};
