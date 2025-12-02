import { useEffect, useState } from 'react';
import { toast } from 'sonner@2.0.3';

/**
 * Hook to detect online/offline status
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
      toast.success('Back online', {
        description: 'Connection restored',
        duration: 3000,
      });
    }

    function handleOffline() {
      setIsOnline(false);
      toast.warning('You are offline', {
        description: 'Some features may be limited',
        duration: 5000,
      });
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

/**
 * Check if browser is in private/incognito mode
 */
export async function isPrivateMode(): Promise<boolean> {
  try {
    // Test localStorage availability
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return false;
  } catch (e) {
    return true;
  }
}

/**
 * Get storage usage information
 */
export async function getStorageInfo(): Promise<{
  used: number;
  total: number;
  percentUsed: number;
}> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    try {
      const estimate = await navigator.storage.estimate();
      const used = estimate.usage || 0;
      const total = estimate.quota || 0;
      const percentUsed = total > 0 ? (used / total) * 100 : 0;
      
      return { used, total, percentUsed };
    } catch (error) {
      console.error('Failed to estimate storage:', error);
    }
  }
  
  // Fallback for browsers that don't support storage API
  return { used: 0, total: 0, percentUsed: 0 };
}

/**
 * Format bytes to human readable format
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}