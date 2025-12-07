import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Phone, Copy, Check, ArrowLeft, Filter, Tag, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CountdownTimer } from '@/components/CountdownTimer';
import { marketplaceAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

// Define MarketplaceItem interface
interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  images: Array<{ url: string; publicId: string }>;
  postedBy: string;
  phone: string;
  expiresAt: string;
}

const categories = ['Electronics', 'Books', 'Furniture', 'Clothing', 'Cycles', 'Sports', 'Others'];

const categoryColors: Record<string, string> = {
  Electronics: 'bg-blue-500',
  Books: 'bg-emerald-500',
  Furniture: 'bg-amber-500',
  Clothing: 'bg-pink-500',
  Cycles: 'bg-purple-500',
  Sports: 'bg-red-500',
  Others: 'bg-gray-500',
};

const priceRanges = [
  { value: 'all', label: 'All Prices' },
  { value: '0-500', label: 'Under ₹500' },
  { value: '500-1000', label: '₹500 - ₹1000' },
  { value: '1000-2000', label: '₹1000 - ₹2000' },
  { value: '2000+', label: 'Above ₹2000' },
];

const Marketplace = () => {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priceFilter, setPriceFilter] = useState<string>('all');
  const [revealedPhones, setRevealedPhones] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expiredIds, setExpiredIds] = useState<Set<string>>(new Set());

  // Fetch items from API
  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const params: Record<string, string | number> = {};
        if (categoryFilter !== 'all') params.category = categoryFilter;
        if (priceFilter !== 'all') {
          const [min, max] = priceFilter.split('-').map(v => v.replace('+', ''));
          if (min) params.minPrice = parseInt(min);
          if (max && !priceFilter.includes('+')) params.maxPrice = parseInt(max);
        }
        if (searchQuery.trim()) params.search = searchQuery.trim();
        
        const response = await marketplaceAPI.getAll(params);
        if (response.data.success) {
          setItems(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching items:', error);
        toast({
          title: "Error",
          description: "Failed to load marketplace items. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    // Debounce search query
    const timeoutId = setTimeout(fetchItems, searchQuery ? 300 : 0);
    return () => clearTimeout(timeoutId);
  }, [categoryFilter, priceFilter, searchQuery]);

  // Filter out expired items from display
  const visibleItems = items.filter(item => !expiredIds.has(item.id));

  const handleExpire = (itemId: string) => {
    setExpiredIds(prev => new Set(prev).add(itemId));
  };

  const revealPhone = (itemId: string) => {
    setRevealedPhones(prev => new Set(prev).add(itemId));
  };

  const copyPhone = async (itemId: string, phone: string) => {
    await navigator.clipboard.writeText(phone);
    setCopiedId(itemId);
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
              <h1 className="text-2xl font-bold text-foreground">Marketplace</h1>
            </div>
            {isAuthenticated && (
              <Link to="/marketplace/create">
                <Button variant="hero" size="default">
                  <Plus className="h-5 w-5" />
                  <span className="hidden sm:inline">List Item</span>
                </Button>
              </Link>
            )}
          </div>

          {/* Filters */}
          <div className="flex gap-3 flex-wrap">
            {/* Search Bar */}
            <div className="relative flex-grow max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 rounded-xl bg-secondary"
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40 h-10 rounded-xl bg-secondary">
                <Tag className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={priceFilter} onValueChange={setPriceFilter}>
              <SelectTrigger className="w-40 h-10 rounded-xl bg-secondary">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Price" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {priceRanges.map(p => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Items Grid */}
      <main className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : visibleItems.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">No items found</p>
            {isAuthenticated && (
              <Link to="/marketplace/create" className="mt-4 inline-block">
                <Button variant="hero">List the first item!</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {visibleItems.map((item, index) => (
              <div
                key={item.id}
                className="bg-card rounded-2xl border border-border/50 shadow-card overflow-hidden hover:shadow-card-hover transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Image */}
                <div className="aspect-[4/3] bg-muted flex items-center justify-center overflow-hidden">
                  {item.images && item.images.length > 0 ? (
                    <img 
                      src={item.images[0].url} 
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl">📦</span>
                  )}
                </div>

                <div className="p-5">
                  {/* Category Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold text-white ${categoryColors[item.category] || 'bg-gray-500'}`}>
                      {item.category}
                    </span>
                    <CountdownTimer 
                      endTime={new Date(item.expiresAt)} 
                      onExpire={() => handleExpire(item.id)}
                      className="text-xs" 
                    />
                  </div>

                  {/* Title & Price */}
                  <h3 className="font-semibold text-foreground text-lg mb-1 line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-2xl font-bold text-primary mb-3">₹{item.price}</p>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {item.description}
                  </p>

                  {/* Posted By */}
                  <p className="text-sm text-muted-foreground mb-4">
                    By <span className="font-medium text-foreground">{item.postedBy}</span>
                  </p>

                  {/* Phone */}
                  <div className="flex items-center gap-2">
                    {revealedPhones.has(item.id) ? (
                      <>
                        <span className="font-mono text-foreground">{item.phone}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => copyPhone(item.id, item.phone)}
                        >
                          {copiedId === item.id ? (
                            <Check className="h-4 w-4 text-success" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="coral"
                        size="sm"
                        className="rounded-lg w-full"
                        onClick={() => revealPhone(item.id)}
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Call Seller
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

export default Marketplace;
