import { Link } from 'react-router-dom';
import { Users, ShoppingBag, ArrowRight } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-10 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-muted-foreground text-lg">
            What would you like to do today?
          </p>
        </div>

        {/* Main Action Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
          {/* Group Orders Card */}
          <Link to="/group-orders" className="group">
            <div className="relative overflow-hidden rounded-3xl bg-card border border-border/50 shadow-card hover:shadow-card-hover transition-all duration-300 hover:scale-[1.01] p-8 h-full">
              <div className="absolute top-0 right-0 w-40 h-40 bg-teal/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-teal flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Users className="w-8 h-8 text-teal-foreground" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">Group Orders</h2>
                <p className="text-muted-foreground mb-6 text-lg">
                  Browse active delivery orders or create one to split costs with others on campus.
                </p>
                <div className="flex items-center gap-2 text-teal font-semibold">
                  <span>Explore orders</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Link>

          {/* Marketplace Card */}
          <Link to="/marketplace" className="group">
            <div className="relative overflow-hidden rounded-3xl bg-card border border-border/50 shadow-card hover:shadow-card-hover transition-all duration-300 hover:scale-[1.01] p-8 h-full">
              <div className="absolute top-0 right-0 w-40 h-40 bg-coral/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-coral flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <ShoppingBag className="w-8 h-8 text-coral-foreground" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">Marketplace</h2>
                <p className="text-muted-foreground mb-6 text-lg">
                  Buy and sell items within campus. Books, electronics, furniture & more.
                </p>
                <div className="flex items-center gap-2 text-coral font-semibold">
                  <span>Browse items</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Link>
        </div>

      </main>
    </div>
  );
};

export default Dashboard;
