export type ViewState = 'dashboard' | 'pooling' | 'renting' | 'delivery' | 'profile' | 'messages' | 'bills';

export interface User {
  id: string;
  name: string;
  email: string; // Added for Auth
  avatar: string;
  bio?: string; // Added for Profile
  rating: number;
  verified: boolean;
  currentStreak: number; // Added for Gamification
  activityLog: string[]; // ISO Date strings of activity
}

export interface Ride {
  id: string;
  driver: User; // Acts as 'creator' (Driver for offers, Requester for requests)
  origin: string;
  destination: string;
  date: string;
  time: string;
  seatsAvailable: number; // Seats offered or Seats needed
  costPerPerson: number;
  type: 'car' | 'bike';
  mode: 'offer' | 'request'; // Distinguish between supply and demand
}

export interface RentalItem {
  id: string;
  owner: User; // Acts as creator (Owner for offers, Requester for requests)
  title: string;
  category: 'Academic' | 'Electronics' | 'Appliances' | 'Sports' | 'Misc';
  price: number; // 0 implies Free/Share
  rateUnit: 'hour' | 'day' | 'week';
  image: string;
  status: 'available' | 'rented';
  mode: 'offer' | 'request';
}

export interface DeliveryTask {
  id: string;
  requester: User; // Acts as creator (Requester for requests, Runner for offers)
  title: string;
  description: string;
  pickup: string;
  dropoff: string;
  offerAmount: number;
  status: 'open' | 'assigned' | 'completed';
  deadline: string; // Deadline for requests, Departure time for offers
  mode: 'request' | 'offer';
}

export interface Bill {
  id: string;
  userId: string;
  title: string;
  description?: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending';
  type: 'ride' | 'rent' | 'delivery' | 'other';
  merchantName: string; // Name of the person/service owed
  paidAt?: string;
}

export interface Activity {
  id: string;
  type: 'pooling' | 'renting' | 'delivery';
  title: string;
  subtitle: string;
  timestamp: string;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
}

export interface Chat {
  id: string;
  participants: string[]; // [User1ID, User2ID]
  otherUser?: User; // Hydrated for UI convenience
  lastMessage?: Message;
  contextType: 'pooling' | 'renting' | 'delivery';
  contextTitle: string;
}