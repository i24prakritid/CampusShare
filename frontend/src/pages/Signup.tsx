import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Mail, Lock, User, Phone, GraduationCap, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/ThemeToggle';

declare global {
  interface Window {
    grecaptcha?: any;
  }
}

const programmes = [
  'Five Year Integrated Programme in Management (IPM)',
  'Post Graduate Programme in Management (PGP)',
  'Post Graduate Programme in Human Resource Management (PGP-HRM)',
  'Executive Post Graduate Programme in Management (EPGP)',
  'Post Graduate Programme in Management for Working Executives in Mumbai (PGPMX)',
  'Doctoral Programme in Management (DPM)',
  'Executive Doctoral Programme in Management (EDPM)',
  'Executive Doctoral Programme in Management and Governance (EDPMG)',
];

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    programme: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getRecaptchaToken = async () => {
    const siteKey = import.meta.env. VITE_RECAPTCHA_SITE_KEY;

    if (!window.grecaptcha) {
      console.warn('reCAPTCHA script not loaded.');
      return null;
    }

    try {
      const token = await window.grecaptcha. execute(siteKey, { action: 'signup' });
      return token as string;
    } catch (err) {
      console.error('Error generating reCAPTCHA token:', err);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e. preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords don't match",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    if (!/^[0-9]{10}$/.test(formData.phone)) {
      toast({
        title: "Error",
        description: "Please enter a valid 10-digit phone number",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Generate reCAPTCHA v3 token with action = 'signup'
      const recaptchaToken = await getRecaptchaToken();

      // Optionally, if you want to hard-fail if token missing in prod:
      // if (!recaptchaToken && import.meta.env.PROD) {
      //   toast({
      //     title: 'Security check failed',
      //     description: 'Unable to verify reCAPTCHA. Please refresh and try again.',
      //     variant: 'destructive',
      //   });
      //   setLoading(false);
      //   return;
      // }

      const success = await signup({
        name: formData.name,
        email: formData. email,
        phone: formData.phone,
        programme: formData.programme,
        password: formData.password,
        recaptchaToken: recaptchaToken || undefined,
      });
      if (success) {
        toast({
          title: "Welcome to CampusShare!",
          description: "Your account has been created.",
        });
        navigate('/dashboard');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong. Please try again.';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-warm flex items-center justify-center p-4 py-12 relative">
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
          <h1 className="text-2xl font-bold text-foreground text-center mb-2">Create Account</h1>
          <p className="text-muted-foreground text-center mb-8">Join your campus community</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Rahul Sharma"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="pl-10 h-12 rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@campus.edu"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="pl-10 h-12 rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="9876543210"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="pl-10 h-12 rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="programme">Programme</Label>
              <Select value={formData.programme} onValueChange={(value) => handleChange('programme', value)}>
                <SelectTrigger className="h-12 rounded-xl">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-muted-foreground" />
                    <SelectValue placeholder="Select your programme" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {programmes.map(prog => (
                    <SelectItem key={prog} value={prog}>{prog}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className="pl-10 h-12 rounded-xl"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  className="pl-10 h-12 rounded-xl"
                  required
                />
              </div>
            </div>

            <Button type="submit" variant="hero" size="lg" className="w-full mt-6" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          <p className="text-center text-muted-foreground mt-6">
            Already have an account? {' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Sign in
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

export default Signup;