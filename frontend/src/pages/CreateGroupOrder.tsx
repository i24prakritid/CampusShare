import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Utensils, ShoppingCart, Pizza, Moon, Salad, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { groupOrdersAPI } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

const hotspots = [
  'Academic Block',
  'Learning Resource Centre (LRC/Library)',
  'New Academic Block',
  'Student Mess (Dining Hall)',
  'Sports Complex',
  'Gymnasium',
  'Swimming Pool',
  'Football Ground',
  'Cricket Ground',
  'Basketball Court',
  'Tennis Court',
  'Student Activity Centre (SAC)',
  'Open Air Theatre (OAT)',
  'Hostel A (Narmada Residence)',
  'Hostel B (Ganga Residence)',
  'Hostel C (Yamuna Residence)',
  'Hostel D (Godavari Residence)',
  'Hostel E (Kaveri Residence)',
  'Married Students Hostel (MSH)',
  'Faculty Residence',
  'Admin Block',
  'Main Gate',
  'Hilltop (View Point)',
  'Amul Parlour',
  'Night Canteen',
  'Coffee Shack',
  'Finance Lab',
  'Bloomberg Terminal Room',
];

const platformOptions = [
  { id: 'Zomato', name: 'Zomato', icon: Utensils, color: 'bg-red-500', needsRestaurant: true },
  { id: 'Swiggy', name: 'Swiggy', icon: Utensils, color: 'bg-orange-500', needsRestaurant: true },
  { id: 'Blinkit', name: 'Blinkit', icon: ShoppingCart, color: 'bg-yellow-500', needsRestaurant: false },
  { id: 'BigBasket', name: 'BigBasket', icon: ShoppingCart, color: 'bg-green-500', needsRestaurant: false },
  { id: 'Dominos', name: "Domino's", icon: Pizza, color: 'bg-blue-500', needsRestaurant: false },
  { id: 'NightMess', name: 'Night Mess', icon: Moon, color: 'bg-purple-500', needsRestaurant: false },
  { id: 'EatSure', name: 'EatSure', icon: Salad, color: 'bg-pink-500', needsRestaurant: false },
];

const timerOptions = [
  { value: '15', label: '15 minutes' },
  { value: '30', label: '30 minutes' },
  { value: '45', label: '45 minutes' },
  { value: '60', label: '60 minutes' },
];

const CreateGroupOrder = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<typeof platformOptions[0] | null>(null);
  const [formData, setFormData] = useState({
    restaurantName: '',
    balanceNeeded: '',
    hotspot: '',
    timer: '30',
  });

  const handlePlatformSelect = (platform: typeof platformOptions[0]) => {
    setSelectedPlatform(platform);
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPlatform) return;
    
    // Validation
    if (!formData.balanceNeeded || parseInt(formData.balanceNeeded) < 1) {
      toast({
        title: "Error",
        description: "Please enter a valid balance amount",
        variant: "destructive",
      });
      return;
    }

    if (!formData.hotspot) {
      toast({
        title: "Error",
        description: "Please select a delivery hotspot",
        variant: "destructive",
      });
      return;
    }

    if (selectedPlatform.needsRestaurant && !formData.restaurantName.trim()) {
      toast({
        title: "Error",
        description: "Please enter the restaurant name",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const response = await groupOrdersAPI.create({
        platform: selectedPlatform.id,
        restaurantName: selectedPlatform.needsRestaurant ? formData.restaurantName : undefined,
        balanceNeeded: parseInt(formData.balanceNeeded),
        hotspot: formData.hotspot,
        timer: parseInt(formData.timer),
      });

      if (response.data.success) {
        toast({
          title: "Order Posted!",
          description: "Your group order is now live.",
        });
        navigate('/group-orders');
      }
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to create order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link to="/group-orders">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Create Group Order</h1>
            <p className="text-muted-foreground">Step {step} of 2</p>
          </div>
        </div>

        {step === 1 && (
          <div className="animate-fade-in">
            <h2 className="text-lg font-semibold text-foreground mb-6">Select Platform</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {platformOptions.map((platform) => {
                const Icon = platform.icon;
                return (
                  <button
                    key={platform.id}
                    onClick={() => handlePlatformSelect(platform)}
                    className="p-6 rounded-2xl bg-card border border-border/50 shadow-card hover:shadow-card-hover hover:scale-[1.02] transition-all duration-300 flex flex-col items-center gap-3"
                  >
                    <div className={`w-14 h-14 rounded-xl ${platform.color} flex items-center justify-center`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <span className="font-semibold text-foreground">{platform.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 2 && selectedPlatform && (
          <form onSubmit={handleSubmit} className="animate-fade-in space-y-6">
            {/* Selected Platform */}
            <div className="flex items-center gap-3 p-4 bg-secondary rounded-xl">
              <div className={`w-10 h-10 rounded-lg ${selectedPlatform.color} flex items-center justify-center`}>
                <selectedPlatform.icon className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-foreground">{selectedPlatform.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setStep(1)}
                className="ml-auto"
              >
                Change
              </Button>
            </div>

            {/* Restaurant Name (conditional) */}
            {selectedPlatform.needsRestaurant && (
              <div className="space-y-2">
                <Label htmlFor="restaurantName">Restaurant Name</Label>
                <Input
                  id="restaurantName"
                  placeholder="e.g., Domino's Pizza"
                  value={formData.restaurantName}
                  onChange={(e) => setFormData(prev => ({ ...prev, restaurantName: e.target.value }))}
                  className="h-12 rounded-xl"
                  required
                />
              </div>
            )}

            {/* Balance Needed */}
            <div className="space-y-2">
              <Label htmlFor="balanceNeeded">Balance Needed (₹)</Label>
              <Input
                id="balanceNeeded"
                type="number"
                placeholder="89"
                value={formData.balanceNeeded}
                onChange={(e) => setFormData(prev => ({ ...prev, balanceNeeded: e.target.value }))}
                className="h-12 rounded-xl text-lg font-semibold"
                required
                min="1"
              />
            </div>

            {/* Hotspot */}
            <div className="space-y-2">
              <Label>Delivery Hotspot</Label>
              <Select
                value={formData.hotspot}
                onValueChange={(value) => setFormData(prev => ({ ...prev, hotspot: value }))}
              >
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue placeholder="Select hotspot" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {hotspots.map(h => (
                    <SelectItem key={h} value={h}>{h}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Timer */}
            <div className="space-y-2">
              <Label>Order Duration</Label>
              <Select
                value={formData.timer}
                onValueChange={(value) => setFormData(prev => ({ ...prev, timer: value }))}
              >
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {timerOptions.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Auto-filled Info */}
            <div className="p-4 bg-muted rounded-xl space-y-2">
              <p className="text-sm text-muted-foreground">Auto-filled from your profile:</p>
              <p className="font-medium text-foreground">{user?.name} • {user?.programme}</p>
              <p className="text-muted-foreground">{user?.phone}</p>
            </div>

            {/* Submit */}
            <Button type="submit" variant="hero" size="xl" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Posting...
                </>
              ) : (
                'Post Order'
              )}
            </Button>
          </form>
        )}
      </main>
    </div>
  );
};

export default CreateGroupOrder;
