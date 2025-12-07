import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, GraduationCap, Lock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { usersAPI } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

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

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    programme: user?.programme || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password fields if changing password
    if (formData.newPassword || formData.confirmPassword) {
      if (!formData.currentPassword) {
        toast({
          title: "Error",
          description: "Current password is required to set a new password",
          variant: "destructive",
        });
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        toast({
          title: "Error",
          description: "New passwords don't match",
          variant: "destructive",
        });
        return;
      }
      if (formData.newPassword.length < 6) {
        toast({
          title: "Error",
          description: "New password must be at least 6 characters",
          variant: "destructive",
        });
        return;
      }
    }

    // Validate phone
    if (formData.phone && !/^[0-9]{10}$/.test(formData.phone)) {
      toast({
        title: "Error",
        description: "Please enter a valid 10-digit phone number",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const updateData: Record<string, string> = {};
      
      if (formData.name && formData.name !== user?.name) {
        updateData.name = formData.name;
      }
      if (formData.phone && formData.phone !== user?.phone) {
        updateData.phone = formData.phone;
      }
      if (formData.programme && formData.programme !== user?.programme) {
        updateData.programme = formData.programme;
      }
      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      if (Object.keys(updateData).length === 0) {
        toast({
          title: "No changes",
          description: "No changes to save.",
        });
        setLoading(false);
        return;
      }

      const response = await usersAPI.updateProfile(updateData);
      
      if (response.data.success) {
        await refreshUser();
        toast({
          title: "Profile Updated",
          description: "Your changes have been saved.",
        });
        // Clear password fields
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }));
      }
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8 max-w-lg">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Edit Profile</h1>
        </div>

        {/* Profile Avatar */}
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 rounded-full gradient-hero flex items-center justify-center shadow-lg">
            <span className="text-3xl font-bold text-primary-foreground">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="pl-10 h-12 rounded-xl"
                required
              />
            </div>
          </div>

          {/* Email (read-only) */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={user?.email}
                className="pl-10 h-12 rounded-xl bg-muted"
                disabled
              />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="pl-10 h-12 rounded-xl"
                required
              />
            </div>
          </div>

          {/* Programme */}
          <div className="space-y-2">
            <Label>Programme</Label>
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

          {/* Password Section */}
          <div className="pt-6 border-t border-border/50">
            <h3 className="text-lg font-semibold text-foreground mb-4">Change Password</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="currentPassword"
                    type="password"
                    value={formData.currentPassword}
                    onChange={(e) => handleChange('currentPassword', e.target.value)}
                    className="pl-10 h-12 rounded-xl"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => handleChange('newPassword', e.target.value)}
                    className="pl-10 h-12 rounded-xl"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    className="pl-10 h-12 rounded-xl"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </form>
      </main>
    </div>
  );
};

export default Profile;
