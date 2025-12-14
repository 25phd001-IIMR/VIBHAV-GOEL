import { Ride, RentalItem, DeliveryTask, User, Activity, Bill } from './types';

// Helper to generate past dates for streak
const generateMockActivity = () => {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < 60; i++) {
    // Randomly decide if user was active
    if (Math.random() > 0.3) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }
  }
  return dates;
};

export const SEED_USER: User = {
  id: 'u1',
  name: 'Rahul Sharma',
  email: 'rahul.s@iimraipur.ac.in',
  avatar: 'https://picsum.photos/seed/rahul/100/100',
  rating: 4.8,
  verified: true,
  bio: 'MBA Candidate 2025. Love cycling and reading.',
  currentStreak: 12,
  activityLog: generateMockActivity(),
};

export const MOCK_RIDES: Ride[] = [
  {
    id: 'r1',
    driver: { ...SEED_USER, id: 'u2', name: 'Amit Verma', avatar: 'https://picsum.photos/seed/amit/100/100', rating: 4.5 },
    origin: 'IIM Raipur Campus',
    destination: 'City Center Mall',
    date: 'Today',
    time: '4:00 PM',
    seatsAvailable: 2,
    costPerPerson: 75,
    type: 'car',
    mode: 'offer'
  },
  {
    id: 'r2',
    driver: { ...SEED_USER, id: 'u3', name: 'Priya Singh', avatar: 'https://picsum.photos/seed/priya/100/100', rating: 4.9 },
    origin: 'Hostel Block A',
    destination: 'Railway Station',
    date: 'Tomorrow',
    time: '10:00 AM',
    seatsAvailable: 3,
    costPerPerson: 120,
    type: 'car',
    mode: 'offer'
  },
  {
    id: 'r3',
    driver: { ...SEED_USER, id: 'u4', name: 'Karan Gill', avatar: 'https://picsum.photos/seed/karan/100/100', rating: 4.2 },
    origin: 'Library',
    destination: 'Faculty Block',
    date: 'Today',
    time: '9:00 PM',
    seatsAvailable: 1,
    costPerPerson: 0,
    type: 'bike',
    mode: 'offer'
  },
  {
    id: 'r4',
    driver: { ...SEED_USER, id: 'u10', name: 'Neha Roy', avatar: 'https://picsum.photos/seed/neha/100/100', rating: 4.6 },
    origin: 'City Center Mall',
    destination: 'Hostel H4',
    date: 'Today',
    time: '8:30 PM',
    seatsAvailable: 1,
    costPerPerson: 50,
    type: 'car',
    mode: 'request'
  }
];

export const MOCK_ITEMS: RentalItem[] = [
  {
    id: 'i1',
    owner: { ...SEED_USER, id: 'u5', name: 'Sneha Gupta', avatar: 'https://picsum.photos/seed/sneha/100/100', rating: 4.7 },
    title: 'Financial Management Textbook',
    category: 'Academic',
    price: 50,
    rateUnit: 'day',
    image: 'https://picsum.photos/seed/book/200/200',
    status: 'available',
    mode: 'offer'
  },
  {
    id: 'i2',
    owner: { ...SEED_USER, id: 'u6', name: 'Rohan Das', avatar: 'https://picsum.photos/seed/rohan/100/100', rating: 4.6 },
    title: 'Philips Steam Iron',
    category: 'Appliances',
    price: 20,
    rateUnit: 'hour',
    image: 'https://picsum.photos/seed/iron/200/200',
    status: 'available',
    mode: 'offer'
  },
  {
    id: 'i3',
    owner: { ...SEED_USER, id: 'u7', name: 'Vikram Malhotra', avatar: 'https://picsum.photos/seed/vikram/100/100', rating: 4.8 },
    title: 'Badminton Racket Set',
    category: 'Sports',
    price: 0,
    rateUnit: 'day',
    image: 'https://picsum.photos/seed/badminton/200/200',
    status: 'available',
    mode: 'offer'
  },
  {
    id: 'i4',
    owner: { ...SEED_USER, id: 'u11', name: 'Arjun Reddy', avatar: 'https://picsum.photos/seed/arjun/100/100', rating: 4.3 },
    title: 'Scientific Calculator',
    category: 'Academic',
    price: 0,
    rateUnit: 'day',
    image: 'https://picsum.photos/seed/calculator/200/200',
    status: 'available',
    mode: 'request'
  }
];

export const MOCK_TASKS: DeliveryTask[] = [
  {
    id: 't1',
    requester: { ...SEED_USER, id: 'u8', name: 'Anjali P.', avatar: 'https://picsum.photos/seed/anjali/100/100', rating: 4.9 },
    title: 'Groceries from City Market',
    description: 'Need milk, bread, and eggs from the main market.',
    pickup: 'City Market',
    dropoff: 'Hostel H4, Room 202',
    offerAmount: 100,
    status: 'open',
    deadline: '7:00 PM Today',
    mode: 'request'
  },
  {
    id: 't2',
    requester: { ...SEED_USER, id: 'u9', name: 'David K.', avatar: 'https://picsum.photos/seed/david/100/100', rating: 4.4 },
    title: 'Print Documents',
    description: 'Print 50 pages from stationary shop near gate.',
    pickup: 'Campus Stationary',
    dropoff: 'Library Entrance',
    offerAmount: 40,
    status: 'open',
    deadline: '2:00 PM Today',
    mode: 'request'
  },
  {
    id: 't3',
    requester: { ...SEED_USER, id: 'u12', name: 'Sameer J.', avatar: 'https://picsum.photos/seed/sameer/100/100', rating: 4.7 },
    title: 'Going to Magneto Mall',
    description: 'Heading to mall for 2 hours. Can pick up food or small items.',
    pickup: 'Magneto Mall',
    dropoff: 'Hostel H2',
    offerAmount: 50,
    status: 'open',
    deadline: '5:30 PM Today',
    mode: 'offer'
  }
];

export const MOCK_BILLS: Bill[] = [
  {
    id: 'b1',
    userId: 'u1',
    title: 'Ride to Airport',
    description: 'Shared cab with Amit',
    amount: 250,
    dueDate: '2024-03-28',
    status: 'pending',
    type: 'ride',
    merchantName: 'Amit Verma'
  },
  {
    id: 'b2',
    userId: 'u1',
    title: 'Canteen Snacks',
    description: 'Evening snacks at H4 Canteen',
    amount: 45,
    dueDate: '2024-03-25',
    status: 'paid',
    type: 'other',
    merchantName: 'Campus Canteen',
    paidAt: '2024-03-25'
  },
  {
    id: 'b3',
    userId: 'u1',
    title: 'Textbook Rental',
    description: 'Financial Mgmt Book for 2 days',
    amount: 100,
    dueDate: '2024-03-20',
    status: 'paid',
    type: 'rent',
    merchantName: 'Sneha Gupta',
    paidAt: '2024-03-20'
  },
  {
    id: 'b4',
    userId: 'u1',
    title: 'Delivery Fee',
    description: 'Groceries from City Market',
    amount: 60,
    dueDate: '2024-03-29',
    status: 'pending',
    type: 'delivery',
    merchantName: 'David K.'
  }
];

export const RECENT_ACTIVITY: Activity[] = [
  { id: 'a1', type: 'pooling', title: 'Joined Ride', subtitle: 'Trip to City Mall confirmed', timestamp: '2h ago' },
  { id: 'a2', type: 'renting', title: 'Item Returned', subtitle: 'Scientific Calculator', timestamp: 'Yesterday' },
  { id: 'a3', type: 'delivery', title: 'Task Completed', subtitle: 'Food delivery from Canteen', timestamp: '2 days ago' },
];