import { toast } from 'sonner@2.0.3';

const BACKUP_REMINDER_KEY = 'playlog-last-backup-reminder';
const BACKUP_INTERVAL_DAYS = 30; // Remind every 30 days

/**
 * Check if user should be reminded to backup their data
 */
export function checkBackupReminder(): void {
  try {
    const lastReminder = localStorage.getItem(BACKUP_REMINDER_KEY);
    const now = Date.now();
    
    if (!lastReminder) {
      // First time - set initial reminder for 7 days from now
      localStorage.setItem(BACKUP_REMINDER_KEY, String(now));
      return;
    }
    
    const lastReminderTime = parseInt(lastReminder, 10);
    const daysSinceLastReminder = (now - lastReminderTime) / (1000 * 60 * 60 * 24);
    
    if (daysSinceLastReminder >= BACKUP_INTERVAL_DAYS) {
      toast.info('Backup Reminder', {
        description: 'Consider exporting your data as a backup from Settings.',
        duration: 10000,
        action: {
          label: 'Dismiss',
          onClick: () => {
            localStorage.setItem(BACKUP_REMINDER_KEY, String(now));
          }
        }
      });
      
      // Update last reminder time
      localStorage.setItem(BACKUP_REMINDER_KEY, String(now));
    }
  } catch (error) {
    console.error('Failed to check backup reminder:', error);
  }
}

/**
 * Mark that user has performed a backup
 */
export function markBackupCompleted(): void {
  try {
    localStorage.setItem(BACKUP_REMINDER_KEY, String(Date.now()));
  } catch (error) {
    console.error('Failed to mark backup completed:', error);
  }
}

/**
 * Reset backup reminder (useful for testing)
 */
export function resetBackupReminder(): void {
  try {
    localStorage.removeItem(BACKUP_REMINDER_KEY);
  } catch (error) {
    console.error('Failed to reset backup reminder:', error);
  }
}
