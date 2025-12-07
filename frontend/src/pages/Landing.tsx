import { Link } from 'react-router-dom';
import { ShoppingBag, Users, LogIn, Package, Sparkles, Shield, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const floatingVariants = {
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

const Landing = () => {
  return (
    <div className="min-h-screen gradient-warm overflow-hidden relative">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/3 rounded-full blur-3xl"
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      {/* Hero Section */}
      <motion.div
        className="container mx-auto px-4 py-12 md:py-20 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="text-center mb-16" variants={itemVariants}>
          <motion.div
            className="inline-flex items-center justify-center w-24 h-24 rounded-3xl gradient-hero shadow-glow mb-6"
            variants={floatingVariants}
            animate="animate"
          >
            <Package className="w-12 h-12 text-primary-foreground" />
          </motion.div>
          <motion.h1
            className="text-5xl md:text-7xl font-bold text-foreground mb-4"
            variants={itemVariants}
          >
            Campus<span className="text-primary">Share</span>
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8"
            variants={itemVariants}
          >
            Split delivery costs, buy & sell within campus. Your one-stop community marketplace.
          </motion.p>

          {/* Trust Badges */}
          <motion.div
            className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground"
            variants={itemVariants}
          >
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <span>Secure & Safe</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>Campus Verified</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span>Real-time Updates</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Main Action Cards */}
        <motion.div
          className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto"
          variants={containerVariants}
        >
          {/* Login/Signup Card */}
          <motion.div variants={itemVariants}>
            <Link to="/login" className="group block">
              <motion.div
                className="h-full p-8 rounded-3xl bg-card/80 backdrop-blur-lg border border-border/50 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col items-center text-center"
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="w-16 h-16 rounded-2xl gradient-hero flex items-center justify-center mb-6 shadow-lg"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <LogIn className="w-8 h-8 text-primary-foreground" />
                </motion.div>
                <h2 className="text-2xl font-bold text-foreground mb-3">Login / Sign Up</h2>
                <p className="text-muted-foreground mb-6 flex-grow">
                  Create an account to post orders, list items, and connect with your campus community.
                </p>
                <Button variant="hero" size="lg" className="w-full group-hover:shadow-glow transition-shadow">
                  Get Started
                </Button>
              </motion.div>
            </Link>
          </motion.div>

          {/* Browse Group Orders Card */}
          <motion.div variants={itemVariants}>
            <Link to="/group-orders" className="group block">
              <motion.div
                className="h-full p-8 rounded-3xl bg-card/80 backdrop-blur-lg border border-border/50 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col items-center text-center"
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="w-16 h-16 rounded-2xl bg-teal flex items-center justify-center mb-6 shadow-lg"
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  <Users className="w-8 h-8 text-teal-foreground" />
                </motion.div>
                <h2 className="text-2xl font-bold text-foreground mb-3">Group Orders</h2>
                <p className="text-muted-foreground mb-6 flex-grow">
                  Join active delivery orders near you. Split costs on Zomato, Swiggy, Blinkit & more.
                </p>
                <Button variant="teal" size="lg" className="w-full">
                  Browse Orders
                </Button>
              </motion.div>
            </Link>
          </motion.div>

          {/* Browse Marketplace Card */}
          <motion.div variants={itemVariants}>
            <Link to="/marketplace" className="group block">
              <motion.div
                className="h-full p-8 rounded-3xl bg-card/80 backdrop-blur-lg border border-border/50 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col items-center text-center"
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="w-16 h-16 rounded-2xl bg-coral flex items-center justify-center mb-6 shadow-lg"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <ShoppingBag className="w-8 h-8 text-coral-foreground" />
                </motion.div>
                <h2 className="text-2xl font-bold text-foreground mb-3">Marketplace</h2>
                <p className="text-muted-foreground mb-6 flex-grow">
                  Buy and sell books, electronics, furniture & more from fellow students.
                </p>
                <Button variant="coral" size="lg" className="w-full">
                  Browse Items
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="text-center mt-16 text-muted-foreground text-sm"
          variants={itemVariants}
        >
          <p>Made with ❤️ for campus communities</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Landing;
