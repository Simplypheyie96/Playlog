# Error Handling & Edge Cases - PlayLog

This document outlines all error handling and edge case management implemented in the PlayLog application.

## 1. React Error Boundary

**Location**: `/components/ErrorBoundary.tsx`

- Catches component crashes and displays a user-friendly error screen
- Provides a "Reload App" button to recover from errors
- Shows error details in development mode
- Preserves user data during crashes

## 2. LocalStorage Management

**Location**: `/lib/persistence.ts`

### Handled Cases:
- **localStorage unavailable**: Detects private browsing mode and uses default state
- **Corrupted data**: Backs up corrupted data and resets to default state
- **Quota exceeded**: Throws descriptive error message prompting user to export and clear data
- **JSON parse errors**: Catches syntax errors and provides fallback

### Functions:
```typescript
loadState()    // Handles all localStorage read errors
saveState()    // Handles quota exceeded errors
```

## 3. Import/Export Validation

**Location**: `/lib/persistence.ts`

### JSON Import Validation:
- File size limit (10MB)
- Valid JSON format
- Required fields validation for players (id, name, createdAt)
- Required fields validation for results (id, gameId, timestamp, positions)
- Player name validation (non-empty, max 50 characters)
- Positions array validation (non-empty, valid structure)

### CSV Export:
- Handles empty results gracefully
- Proper escaping of special characters (quotes, commas, newlines)
- Returns header-only CSV when no data exists

## 4. State Management Validation

**Location**: `/lib/store.ts`

### Player Validation:
- Name is required and non-empty
- Name max length: 50 characters
- Name is trimmed before saving

### Result Validation:
- Game ID is required
- At least one player in positions array
- Valid player IDs (must exist in players list)
- Prevents duplicate submissions with isSubmitting flag

## 5. Network Error Handling

**Location**: `/lib/api.ts`

### Handled Cases:
- Network connectivity issues
- HTTP error responses (with status codes)
- Timeout errors
- JSON parsing errors in responses

### Error Messages:
- Clear, descriptive error messages for users
- Detailed logging for debugging
- Network-specific error detection

## 6. UI Error Handling

### Settings Page (`/components/pages/SettingsPage.tsx`):
- Export failures show error toasts
- Import validation with file size limits
- No results to export warning
- Confirmation dialogs for destructive actions

### Record Result Dialog (`/components/RecordResultDialog.tsx`):
- Validation at each step
- Prevents empty submissions
- Double-submission prevention
- Invalid configuration detection
- Fallback player names

## 7. Statistics & Calculations

**Location**: `/lib/ranking.ts`

### Edge Cases Handled:
- Division by zero in win percentage (returns 0 when gamesPlayed = 0)
- Empty results arrays
- Missing player data
- No games played scenarios

## 8. Empty States

Throughout the application:
- Empty leaderboards display appropriate messages
- No games recorded shows guidance
- Missing player data handled gracefully

## 9. Toast Notifications

All user-facing operations include:
- Success confirmations
- Error messages with actionable guidance
- Undo functionality for critical actions
- Duration-appropriate display times

## 10. Type Safety

- TypeScript strict mode
- Comprehensive type definitions
- Runtime validation for external data
- Null/undefined checks throughout

## Testing Recommendations

To ensure production readiness, test:
1. Import invalid JSON files
2. Import files larger than 10MB
3. Fill localStorage to quota
4. Use in private browsing mode
5. Disconnect network during sync
6. Submit empty forms
7. Very long player names (>50 chars)
8. Rapid double-clicking submit buttons
9. Delete players with existing results
10. Export when no data exists
