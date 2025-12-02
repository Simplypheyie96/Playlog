# Family Leaderboard - Production Ready! 🎮

Your family game tracking app is now connected to a real backend with cloud storage and simple password access!

## 🚀 Getting Started

### First Time Access

1. **Enter Password**
   - Open the app
   - Enter the family password: `family2024`
   - Click "Access Leaderboard"
   - The app will remember you on this device!

2. **Customize Your Players**
   - Go to the "Players" tab
   - Click on each player to edit their name, avatar emoji, and color
   - Update them to represent your family members:
     - Dad, Mom, Kids, etc.
   - Changes sync automatically to the cloud!

3. **Start Recording Games**
   - Click the purple "+" button (floating action button)
   - Select the game: Ludo, Snakes & Ladders, or Chess
   - Select who played
   - Arrange them in order of finish (1st, 2nd, 3rd...)
   - Add optional notes
   - Submit!

## 🔐 Password & Security

### Default Password
- **Password:** `family2024`
- All family members use the same password
- The password is stored in the app code

### Changing the Password
To change your family password, you'll need to update it in the code:
1. Open `/pages/PasswordAccess.tsx`
2. Find the line: `const FAMILY_PASSWORD = 'family2024';`
3. Change `'family2024'` to your desired password
4. Save and publish the app

### Lock the App
- Go to Settings → Data Management
- Click "Lock App"
- You'll need to enter the password again to access
- Great for when you hand your device to someone!

## 📱 Key Features

### Real-Time Cloud Sync
- All data is stored in the cloud
- Access from any device with the password
- Data syncs automatically across all family devices
- Everyone shares the same leaderboard!

### Track Multiple Games
- **Ludo** 🎲 - Classic board game
- **Snakes & Ladders** 🐍 - Climb to victory
- **Chess** ♟️ - Strategic battles

### Complete Activity History
- Home tab: See last 5 activities
- Activities tab: View all games with search and filters
- Edit or delete any game result
- Filter by game type
- Search by player or notes

### Smart Leaderboard
- Automatic ranking based on performance
- Points awarded based on finishing position
- Win rates and statistics for each player
- Current streaks visible

## 👥 Sharing with Family

**Simple Sharing:**
1. Share the app URL with family members
2. Tell them the password (default: `family2024`)
3. Everyone can access and add games!
4. All see the same data in real-time

**Multi-Device:**
- Access from phones, tablets, or computers
- Same password works everywhere
- Data stays in sync automatically

## 💾 Data Management

### Export Your Data
- Go to Settings → Data Management
- Click "Export Data (JSON)"
- Save your backup file locally
- Great for keeping records or switching devices

### Import Data
- Go to Settings → Data Management
- Choose "Import & Replace" (overwrites current data)
- Or "Import & Merge" (combines with current data)
- Select your JSON backup file

### Reset All Data
- Go to Settings → Data Management
- Click "Reset All Data"
- Confirm (⚠️ This cannot be undone!)
- Starts fresh with 5 default players

### Lock App
- Go to Settings → Data Management
- Click "Lock App"
- Removes access until password is entered again
- Data stays safe in the cloud

## 📊 Understanding Points

- Points are awarded based on finishing position
- 1st place gets the most points
- 2nd, 3rd, etc. get progressively fewer points
- Ties are handled fairly with average points
- Global leaderboard shows cumulative points

## 🎨 Customization

### Settings Available:
- **Theme**: Light, Dark, or System
- **Compact Mode**: Smaller spacing for more content
- **Reduced Motion**: Minimize animations
- **Notifications**: Toggle toast messages

## 🎯 Best Practices

1. **Record games immediately** - Don't forget who won!
2. **Add notes** - Remember epic moments ("Dad's comeback!")
3. **Check the leaderboard** - Keep the competition fun
4. **Customize player profiles** - Make it personal
5. **Export regularly** - Keep backups just in case
6. **Lock when not in use** - Protect your data

## 🆘 Troubleshooting

**Forgot the password?**
- Default is `family2024`
- If you changed it, you'll need to check the code or reset

**Data not syncing?**
- Check your internet connection
- Try refreshing the page
- Lock and unlock the app to force a sync

**Lost all your data?**
- Import your most recent export/backup
- Data is stored in the cloud, so it's safe even if you clear your browser

**Want to start over?**
- Use "Reset All Data" in Settings
- This gives you a fresh start with default players

## 🎉 Tips for Maximum Fun

- **Weekly tournaments** - Crown a weekly champion
- **Game-specific challenges** - Who's the Ludo master?
- **Track improvement** - Watch your skills grow over time
- **Family rivalries** - Keep the friendly competition alive
- **Notes section** - Record memorable moments and trash talk!

## 🔒 Privacy & Security

- **Password Protected** - Only people with the password can access
- **Cloud Storage** - Data safely stored in Supabase
- **No Personal Info Required** - No emails or sign-ups needed
- **Family Only** - Your data is private to those with the password

## 📱 Mobile Optimized

- **Mobile-first design** - Works perfectly on phones
- **Quick recording** - Add games in 2 taps
- **Responsive layout** - Adapts to any screen size
- **Touch-friendly** - Big buttons, easy navigation
- **Works offline** - Some features work without internet

---

**Ready to Play?** Enter your password and start tracking your family's gaming victories! 🏆

**Default Password:** `family2024`
