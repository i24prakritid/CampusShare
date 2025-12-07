export interface GroupOrder {
  id: string;
  platform: 'Zomato' | 'Swiggy' | 'Blinkit' | 'BigBasket' | 'Dominos' | 'Night Mess' | 'EatSure';
  restaurantName?: string;
  hotspot: string;
  balanceNeeded: number;
  postedBy: string;
  phone: string;
  programme: string;
  endTime: Date;
  userId: string;
}

export interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  postedBy: string;
  phone: string;
  endTime: Date;
  userId: string;
}

const hotspots = ['LHC', 'Rewa Hostel', 'Narmada Hostel', 'Ganga Hostel', 'Main Gate', 'Library', 'SAC', 'OAT'];
const categories = ['Electronics', 'Books', 'Furniture', 'Clothing', 'Cycles', 'Sports', 'Others'];

export const mockGroupOrders: GroupOrder[] = [
  {
    id: '1',
    platform: 'Zomato',
    restaurantName: 'Dominos Pizza',
    hotspot: 'LHC',
    balanceNeeded: 89,
    postedBy: 'Arjun Patel',
    phone: '9876543210',
    programme: 'B.Tech ECE',
    endTime: new Date(Date.now() + 15 * 60 * 1000),
    userId: '2',
  },
  {
    id: '2',
    platform: 'Swiggy',
    restaurantName: 'Burger King',
    hotspot: 'Rewa Hostel',
    balanceNeeded: 150,
    postedBy: 'Priya Singh',
    phone: '9123456780',
    programme: 'M.Tech AI',
    endTime: new Date(Date.now() + 25 * 60 * 1000),
    userId: '3',
  },
  {
    id: '3',
    platform: 'Blinkit',
    hotspot: 'Main Gate',
    balanceNeeded: 45,
    postedBy: 'Vikram Reddy',
    phone: '9988776655',
    programme: 'B.Tech CSE',
    endTime: new Date(Date.now() + 8 * 60 * 1000),
    userId: '4',
  },
  {
    id: '4',
    platform: 'BigBasket',
    hotspot: 'Narmada Hostel',
    balanceNeeded: 200,
    postedBy: 'Sneha Gupta',
    phone: '9876501234',
    programme: 'PhD Physics',
    endTime: new Date(Date.now() + 45 * 60 * 1000),
    userId: '5',
  },
  {
    id: '5',
    platform: 'Night Mess',
    hotspot: 'SAC',
    balanceNeeded: 30,
    postedBy: 'Aditya Kumar',
    phone: '9012345678',
    programme: 'B.Tech ME',
    endTime: new Date(Date.now() + 12 * 60 * 1000),
    userId: '6',
  },
  {
    id: '6',
    platform: 'EatSure',
    hotspot: 'Library',
    balanceNeeded: 120,
    postedBy: 'Kavya Sharma',
    phone: '9111222333',
    programme: 'M.Sc Chemistry',
    endTime: new Date(Date.now() + 35 * 60 * 1000),
    userId: '7',
  },
];

export const mockMarketplaceItems: MarketplaceItem[] = [
  {
    id: '1',
    title: 'Scientific Calculator - Casio FX-991EX',
    description: 'Barely used, excellent condition. Perfect for engineering students.',
    price: 800,
    category: 'Electronics',
    images: [],
    postedBy: 'Rahul Verma',
    phone: '9876543210',
    endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    userId: '8',
  },
  {
    id: '2',
    title: 'Introduction to Algorithms - CLRS',
    description: '3rd Edition, hardcover. Some highlights but otherwise good.',
    price: 450,
    category: 'Books',
    images: [],
    postedBy: 'Meera Joshi',
    phone: '9123456789',
    endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    userId: '9',
  },
  {
    id: '3',
    title: 'Study Table with Chair',
    description: 'Wooden study table, foldable. Great for hostel rooms.',
    price: 1500,
    category: 'Furniture',
    images: [],
    postedBy: 'Ankit Sharma',
    phone: '9988776655',
    endTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    userId: '10',
  },
  {
    id: '4',
    title: 'Firefox Bicycle - 21 Gear',
    description: 'Used for 6 months, well maintained. Includes lock.',
    price: 5500,
    category: 'Cycles',
    images: [],
    postedBy: 'Divya Nair',
    phone: '9012345678',
    endTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    userId: '11',
  },
  {
    id: '5',
    title: 'JBL Bluetooth Speaker',
    description: 'Portable, waterproof. Battery lasts 12+ hours.',
    price: 2200,
    category: 'Electronics',
    images: [],
    postedBy: 'Karan Malhotra',
    phone: '9876501234',
    endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    userId: '12',
  },
  {
    id: '6',
    title: 'Badminton Racket - Yonex',
    description: 'Professional grade, with cover. Strings recently changed.',
    price: 1800,
    category: 'Sports',
    images: [],
    postedBy: 'Shreya Patel',
    phone: '9111222333',
    endTime: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    userId: '13',
  },
];

export const platforms = ['Zomato', 'Swiggy', 'Blinkit', 'BigBasket', 'Dominos', 'Night Mess', 'EatSure'] as const;
export { hotspots, categories };
