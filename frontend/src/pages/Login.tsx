import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Package, Mail, Lock, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/ThemeToggle';

declare global {
  interface Window {
    grecaptcha?: any;
  }
}

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get redirect path from state, or default to dashboard
  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

const getRecaptchaToken = async () => {
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

  if (!window.grecaptcha) {
    console.warn('reCAPTCHA script not loaded.');
    return null;
  }

  try {
    const token = await window.grecaptcha.execute(siteKey, { action: 'login' });
    return token as string;
  } catch (err) {
    console.error('Error generating reCAPTCHA token:', err);
    return null;
  }
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Generate reCAPTCHA v3 token with action = 'login'
      const recaptchaToken = await getRecaptchaToken();

      // Optionally, if you want to hard-fail if token missing in prod:
      // if (!recaptchaToken && import.meta.env.PROD) {
      //   toast({
      //     title: 'Security check failed',
      //     description: 'Unable to verify reCAPTCHA. Please refresh and try again.',
      //     variant: 'destructive',
      //   });
      //   return;
      // }

      const success = await login(email, password, recaptchaToken || undefined);

      if (success) {
        toast({
          title: 'Welcome back!',
          description: "You've successfully logged in.",
        });
        navigate(from, { replace: true });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Invalid credentials. Please try again.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-warm flex items-center justify-center p-4 relative">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <motion.div
            className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-hero shadow-lg"
            whileHover={{ scale: 1.05 }}
          >
            <Package className="h-6 w-6 text-primary-foreground" />
          </motion.div>
          <span className="text-2xl font-bold text-foreground">CampusShare</span>
        </Link>

        {/* Form Card */}
        <motion.div
          className="bg-card/80 backdrop-blur-lg rounded-3xl shadow-card border border-border/50 p-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <h1 className="text-2xl font-bold text-foreground text-center mb-2">
            Welcome Back
          </h1>
          <p className="text-muted-foreground text-center mb-8">
            Sign in to your account
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@campus.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-12 rounded-xl"
                  required
                />
              </div>
            </div>

            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <p className="text-center text-muted-foreground mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary font-semibold hover:underline">
              Sign up
            </Link>
          </p>

          {/* reCAPTCHA Badge Placeholder */}
          <div className="mt-6 pt-6 border-t border-border/50">
            <p className="text-xs text-muted-foreground text-center">
              Protected by reCAPTCHA v3
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
