import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Navbar } from '@/components/Navbar';
import { CountdownTimer } from '@/components/CountdownTimer';
import { groupOrdersAPI, marketplaceAPI } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

// Interfaces
interface GroupOrder {
  id: string;
  platform: string;
  restaurantName?: string;
  hotspot: string;
  balanceNeeded: number;
  expiresAt: string;
  isActive: boolean;
}

interface MarketplaceItem {
  id: string;
  title: string;
  price: number;
  category: string;
  expiresAt: string;
  isActive: boolean;
}

const platformColors: Record<string, string> = {
  Zomato: 'bg-red-500',
  Swiggy: 'bg-orange-500',
  Blinkit: 'bg-yellow-500',
  BigBasket: 'bg-green-500',
  Dominos: 'bg-blue-500',
  NightMess: 'bg-purple-500',
  EatSure: 'bg-pink-500',
};

const categoryColors: Record<string, string> = {
  Electronics: 'bg-blue-500',
  Books: 'bg-emerald-500',
  Furniture: 'bg-amber-500',
  Clothing: 'bg-pink-500',
  Cycles: 'bg-purple-500',
  Sports: 'bg-red-500',
  Others: 'bg-gray-500',
};

const MyPosts = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<GroupOrder[]>([]);
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch user's posts
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const [ordersRes, itemsRes] = await Promise.all([
          groupOrdersAPI.getMine(),
          marketplaceAPI.getMine(),
        ]);

        if (ordersRes.data.success) {
          setOrders(ordersRes.data.data);
        }
        if (itemsRes.data.success) {
          setItems(itemsRes.data.data);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
        toast({
          title: "Error",
          description: "Failed to load your posts. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const unlistOrder = async (id: string) => {
    setDeletingId(id);
    try {
      const response = await groupOrdersAPI.delete(id);
      if (response.data.success) {
        setOrders(prev => prev.filter(o => o.id !== id));
        toast({ title: "Order unlisted", description: "Your order has been removed." });
      }
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to unlist order.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const unlistItem = async (id: string) => {
    setDeletingId(id);
    try {
      const response = await marketplaceAPI.delete(id);
      if (response.data.success) {
        setItems(prev => prev.filter(i => i.id !== id));
        toast({ title: "Item unlisted", description: "Your item has been removed." });
      }
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to unlist item.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  // Check if order is expired
  const isExpired = (expiresAt: string) => new Date(expiresAt) < new Date();

  const activeOrders = orders.filter(o => o.isActive && !isExpired(o.expiresAt));
  const pastOrders = orders.filter(o => !o.isActive || isExpired(o.expiresAt));
  const activeItems = items.filter(i => i.isActive && !isExpired(i.expiresAt));
  const pastItems = items.filter(i => !i.isActive || isExpired(i.expiresAt));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">My Posts</h1>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="active" className="animate-fade-in">
            <TabsList className="grid w-full grid-cols-2 mb-6 rounded-xl bg-secondary p-1 h-12">
              <TabsTrigger value="active" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
                Active
              </TabsTrigger>
              <TabsTrigger value="past" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
                Past
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-8">
              {/* Active Group Orders */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Group Orders</h3>
                {activeOrders.length === 0 ? (
                  <p className="text-muted-foreground">No active orders</p>
                ) : (
                  <div className="space-y-3">
                    {activeOrders.map(order => (
                      <div key={order.id} className="bg-card rounded-2xl border border-border/50 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold text-white ${platformColors[order.platform] || 'bg-gray-500'}`}>
                            {order.platform}
                          </span>
                          <div>
                            <p className="font-medium text-foreground">
                              {order.restaurantName || order.platform}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {order.hotspot}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-semibold text-destructive">₹{order.balanceNeeded}</p>
                            <CountdownTimer endTime={new Date(order.expiresAt)} className="text-xs" />
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => unlistOrder(order.id)}
                            disabled={deletingId === order.id}
                          >
                            {deletingId === order.id ? (
                              <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                              <Trash2 className="h-5 w-5" />
                            )}
                          </Button>
                        </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Active Marketplace Items */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Marketplace Items</h3>
              {activeItems.length === 0 ? (
                <p className="text-muted-foreground">No active listings</p>
              ) : (
                <div className="space-y-3">
                  {activeItems.map(item => (
                    <div key={item.id} className="bg-card rounded-2xl border border-border/50 p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold text-white ${categoryColors[item.category] || 'bg-gray-500'}`}>
                          {item.category}
                        </span>
                        <p className="font-medium text-foreground">{item.title}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-semibold text-primary">₹{item.price}</p>
                          <CountdownTimer endTime={new Date(item.expiresAt)} className="text-xs" />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => unlistItem(item.id)}
                          disabled={deletingId === item.id}
                        >
                          {deletingId === item.id ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <Trash2 className="h-5 w-5" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="past" className="space-y-8">
            {/* Past Group Orders */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Group Orders</h3>
              {pastOrders.length === 0 ? (
                <p className="text-muted-foreground">No past orders</p>
              ) : (
                <div className="space-y-3">
                  {pastOrders.map(order => (
                    <div key={order.id} className="bg-muted rounded-2xl p-4 flex items-center justify-between opacity-60">
                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold text-white ${platformColors[order.platform] || 'bg-gray-500'}`}>
                          {order.platform}
                        </span>
                        <div>
                          <p className="font-medium text-foreground">
                            {order.restaurantName || order.platform}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {order.hotspot}
                          </div>
                        </div>
                      </div>
                      <p className="font-semibold text-muted-foreground">₹{order.balanceNeeded}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Past Marketplace Items */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Marketplace Items</h3>
              {pastItems.length === 0 ? (
                <p className="text-muted-foreground">No past listings</p>
              ) : (
                <div className="space-y-3">
                  {pastItems.map(item => (
                    <div key={item.id} className="bg-muted rounded-2xl p-4 flex items-center justify-between opacity-60">
                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold text-white ${categoryColors[item.category] || 'bg-gray-500'}`}>
                          {item.category}
                        </span>
                        <p className="font-medium text-foreground">{item.title}</p>
                      </div>
                      <p className="font-semibold text-muted-foreground">₹{item.price}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        )}
      </main>
    </div>
  );
};

export default MyPosts;
