import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner@2.0.3';
import { Trophy, Loader2, Lock } from 'lucide-react';

interface PasswordAccessProps {
  onAccessGranted: () => void;
}

export function PasswordAccess({ onAccessGranted }: PasswordAccessProps) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simple password check - you can change this to your family password
      // For production, you might want to store this in environment variables
      const FAMILY_PASSWORD = 'family'; // Change this to your desired password
      
      if (password === FAMILY_PASSWORD) {
        // Don't save to localStorage - require password every time
        toast.success('Welcome to PlayLog! 🎮');
        onAccessGranted();
      } else {
        toast.error('Incorrect password. Try again.');
      }
    } catch (error) {
      console.error('Access error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-[#172033] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.6 }}
            className="inline-block mb-4"
          >
            <div className="w-20 h-20 bg-[#0ea5e9] rounded-3xl flex items-center justify-center">
              <Trophy className="w-10 h-10 text-white" />
            </div>
          </motion.div>
          
          <h1 className="text-2xl text-[#f1f5f9] mb-2">
            PlayLog
          </h1>
          <p className="text-[#94a3b8]">
            Enter your family password to continue
          </p>
        </div>

        {/* Password Form */}
        <div className="bg-[#192234] rounded-2xl p-6 border border-[#2A3344]">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <Label htmlFor="password" className="text-[#e2e8f0] mb-2 block flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Family Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoFocus
                className="bg-[#192234] border-[#2A3344] text-[#f1f5f9] placeholder:text-[#94a3b8]"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0ea5e9] hover:bg-[#0ea5e9]/90 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Access Leaderboard
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Info */}
        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-[#e2e8f0]">
            🔒 Password protected family data
          </p>
          <p className="text-xs text-[#94a3b8]">
            Default password: <code className="bg-[#192234] px-2 py-1 rounded text-[#e2e8f0] border border-[#2A3344]">family</code>
          </p>
        </div>
      </motion.div>
    </div>
  );
}