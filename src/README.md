# Family Leaderboard

A polished, gamified leaderboard web app for tracking game wins across your family. Mobile-first, accessible, and production-ready.

## Features

### Core Features
- **5 Fixed Players**: Track wins for You, Sister A, Sister B, Mum, and Dad
- **Multiple Games**: Ludo, Snakes & Ladders, and optional Chess
- **Quick Record Flow**: Log a win within 2 taps from home screen
- **Leaderboards**: Global and per-game rankings with live updates
- **Player Stats**: Detailed statistics, streaks, and win percentages
- **Data Persistence**: LocalStorage with import/export (JSON & CSV)
- **Responsive Design**: Optimized for 320px to 1440px+ screens

### UI/UX
- **Gamified Design**: Rank badges, streak indicators, animated transitions
- **Accessible**: Keyboard navigation, ARIA labels, screen reader friendly
- **Theme Support**: Light, dark, and system themes
- **Reduced Motion**: Respects user preference for reduced motion
- **Mobile-First**: Bottom nav on mobile, sidebar on desktop

### Advanced Features
- **Edit Profiles**: Inline editing of names, avatars, and colors
- **Activity Feed**: Recent games with delete/undo functionality
- **Statistics**: Win rates, streaks, and performance breakdown
- **Import/Export**: Backup and restore your data
- **Settings**: Customizable experience with theme and game toggles

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will open at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

## Usage

### Quick Add (2-Tap Flow)
1. Tap the floating "+" button
2. Select game → Select winner(s) → Done!

### Viewing Stats
- **Home**: Global leaderboard and recent activity
- **Games**: Per-game leaderboards and stats
- **Players**: Individual player profiles and match history
- **Settings**: Customize theme, export data, manage games

### Keyboard Navigation
- `Tab` / `Shift+Tab`: Navigate between elements
- `Enter` / `Space`: Activate buttons and select items
- All dialogs and forms are fully keyboard accessible

## Data Model

### Player
```typescript
interface Player {
  id: string;
  name: string;
  avatar?: string; // emoji or image URL
  color?: string;
  createdAt: string;
}
```

### Result
```typescript
interface Result {
  id: string;
  gameId: 'ludo' | 'snakes' | 'chess';
  winners: string[]; // player ids
  score?: Record<string, number>;
  timestamp: string; // ISO
  notes?: string;
}
```

### App State
```typescript
interface AppState {
  players: Player[];
  results: Result[];
  settings: {
    theme: 'light' | 'dark' | 'system';
    compactMode: boolean;
    reducedMotion: boolean;
    enabledGames: GameId[];
    notifications: boolean;
  };
  version: number;
}
```

## Import/Export

### Export Data
1. Go to Settings
2. Click "Export JSON" for full backup
3. Click "Export CSV" for results only

### Import Data
1. Go to Settings
2. Click "Import JSON"
3. Select your backup file
4. Data will be validated and imported

### Migration
The app automatically migrates data between versions. Current version: **v1**

## Data Storage

- **Primary**: localStorage (key: `family-leaderboard-v1`)
- **Backup**: Export JSON regularly to prevent data loss
- **Size Limit**: Browser localStorage typically allows 5-10MB
- **Error Handling**: Clear error messages if storage quota exceeded

## Tech Stack

- **React** with TypeScript
- **Tailwind CSS** for styling
- **Zustand** for state management
- **Motion** (Framer Motion) for animations
- **dayjs** for date handling
- **react-hook-form** for forms
- **shadcn/ui** component library
- **canvas-confetti** for celebrations
- **sonner** for toast notifications

## Design Tokens

### Colors
- Primary (Ludo): `#6C5CE7`
- Success (Snakes): `#00BFA6`
- Accent (Chess): `#4D96FF`
- Gold: `#FFD166`
- Danger: `#FF6B6B`

### Spacing
- Mobile-first with compact spacing
- Responsive breakpoints: `md` (768px), `lg` (1024px)

### Typography
- System font stack for performance
- Clear hierarchy with default sizes
- Custom sizes only when needed

## Accessibility

- ✅ Keyboard navigation
- ✅ ARIA labels and roles
- ✅ Focus indicators
- ✅ Screen reader support
- ✅ High contrast support
- ✅ Reduced motion support
- ✅ Semantic HTML

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Testing

### Manual Acceptance Tests

1. **Quick Add Flow**
   - Open at 320px width
   - Click floating "+" button
   - Select game, select winner
   - Confirm leaderboard updates

2. **Import/Export**
   - Export JSON
   - Clear localStorage (dev tools)
   - Import JSON
   - Verify exact state restoration

3. **Responsive Design**
   - Test at 320px, 768px, 1440px
   - Verify navigation switches (bottom → sidebar)
   - Check readability and usability

4. **Accessibility**
   - Navigate entire app with keyboard only
   - Use screen reader to verify labels
   - Check focus indicators

5. **Reduced Motion**
   - Enable OS reduced motion preference
   - Verify animations are minimal
   - Check functionality remains intact

## Future Enhancements

- [ ] Achievement badges for milestones
- [ ] Weekly challenge mode
- [ ] Weighted scoring system
- [ ] Backend sync with authentication
- [ ] Shareable leaderboard snapshots
- [ ] Push notifications
- [ ] Progressive Web App (PWA)

## License

MIT

## Contributing

This is a family project, but feel free to fork and adapt for your own use!
