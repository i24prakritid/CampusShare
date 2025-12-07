import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Phone, Copy, Check, ArrowLeft, Filter, MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CountdownTimer } from '@/components/CountdownTimer';
import { groupOrdersAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

// Define GroupOrder interface
interface GroupOrder {
  id: string;
  platform: string;
  restaurantName?: string;
  hotspot: string;
  balanceNeeded: number;
  postedBy: string;
  phone: string;
  programme: string;
  expiresAt: string;
}

const platforms = ['Zomato', 'Swiggy', 'Blinkit', 'BigBasket', 'Dominos', 'NightMess', 'EatSure'];
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

const platformColors: Record<string, string> = {
  Zomato: 'bg-red-500',
  Swiggy: 'bg-orange-500',
  Blinkit: 'bg-yellow-500',
  BigBasket: 'bg-green-500',
  Dominos: 'bg-blue-500',
  NightMess: 'bg-purple-500',
  EatSure: 'bg-pink-500',
};

const GroupOrders = () => {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<GroupOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [hotspotFilter, setHotspotFilter] = useState<string>('all');
  const [revealedPhones, setRevealedPhones] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expiredIds, setExpiredIds] = useState<Set<string>>(new Set());

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const params: Record<string, string> = {};
        if (platformFilter !== 'all') params.platform = platformFilter;
        if (hotspotFilter !== 'all') params.hotspot = hotspotFilter;
        
        const response = await groupOrdersAPI.getAll(params);
        if (response.data.success) {
          setOrders(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast({
          title: "Error",
          description: "Failed to load group orders. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [platformFilter, hotspotFilter]);

  // Filter out expired orders from display
  const visibleOrders = orders.filter(order => !expiredIds.has(order.id));

  const handleExpire = (orderId: string) => {
    setExpiredIds(prev => new Set(prev).add(orderId));
  };

  const revealPhone = (orderId: string) => {
    setRevealedPhones(prev => new Set(prev).add(orderId));
  };

  const copyPhone = async (orderId: string, phone: string) => {
    await navigator.clipboard.writeText(phone);
    setCopiedId(orderId);
    toast({ title: "Copied!", description: "Phone number copied to clipboard" });
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Link to={isAuthenticated ? "/dashboard" : "/"}>
                <Button variant="ghost" size="icon" className="rounded-xl">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-foreground">Group Orders</h1>
            </div>
            {isAuthenticated && (
              <Link to="/group-orders/create">
                <Button variant="hero" size="default">
                  <Plus className="h-5 w-5" />
                  <span className="hidden sm:inline">Create Order</span>
                </Button>
              </Link>
            )}
          </div>

          {/* Filters */}
          <div className="flex gap-3 flex-wrap">
            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger className="w-40 h-10 rounded-xl bg-secondary">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="all">All Platforms</SelectItem>
                {platforms.map(p => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={hotspotFilter} onValueChange={setHotspotFilter}>
              <SelectTrigger className="w-40 h-10 rounded-xl bg-secondary">
                <MapPin className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Hotspot" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="all">All Hotspots</SelectItem>
                {hotspots.map(h => (
                  <SelectItem key={h} value={h}>{h}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      <main className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : visibleOrders.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">No active orders found</p>
            {isAuthenticated && (
              <Link to="/group-orders/create" className="mt-4 inline-block">
                <Button variant="hero">Create the first one!</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {visibleOrders.map((order, index) => (
              <div
                key={order.id}
                className="bg-card rounded-2xl border border-border/50 shadow-card overflow-hidden hover:shadow-card-hover transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="p-5">
                  {/* Platform Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold text-white ${platformColors[order.platform] || 'bg-gray-500'}`}>
                        {order.platform}
                      </span>
                      {order.restaurantName && (
                        <span className="text-sm text-muted-foreground truncate max-w-[120px]">
                          {order.restaurantName}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Hotspot */}
                  <div className="flex items-center gap-2 text-muted-foreground mb-4">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm font-medium">{order.hotspot}</span>
                  </div>

                  {/* Balance Needed */}
                  <div className="mb-4">
                    <p className="text-3xl font-bold text-destructive">
                      ₹{order.balanceNeeded}
                      <span className="text-base font-normal text-muted-foreground ml-2">still needed</span>
                    </p>
                  </div>

                  {/* Timer */}
                  <div className="mb-4">
                    <CountdownTimer 
                      endTime={new Date(order.expiresAt)} 
                      onExpire={() => handleExpire(order.id)}
                    />
                  </div>

                  {/* Posted By */}
                  <div className="text-sm text-muted-foreground mb-4">
                    <p className="font-medium text-foreground">{order.postedBy}</p>
                    <p>{order.programme}</p>
                  </div>

                  {/* Phone */}
                  <div className="flex items-center gap-2">
                    {revealedPhones.has(order.id) ? (
                      <>
                        <span className="font-mono text-foreground">{order.phone}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => copyPhone(order.id, order.phone)}
                        >
                          {copiedId === order.id ? (
                            <Check className="h-4 w-4 text-success" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="rounded-lg"
                        onClick={() => revealPhone(order.id)}
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Show Number
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default GroupOrders;
