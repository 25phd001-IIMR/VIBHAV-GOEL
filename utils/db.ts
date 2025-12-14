import { Ride, RentalItem, DeliveryTask, User, Chat, Message, Bill } from '../types';
import { SEED_USER, MOCK_RIDES, MOCK_ITEMS, MOCK_TASKS, MOCK_BILLS } from '../constants';
import { supabase, isSupabaseConfigured } from './supabaseClient';

// --- LocalStorage Helpers (Fallback) ---
const STORAGE_KEYS = {
  RIDES: 'campus_connect_rides',
  ITEMS: 'campus_connect_items',
  TASKS: 'campus_connect_tasks',
  USERS: 'campus_connect_users',
  CHATS: 'campus_connect_chats',
  MESSAGES: 'campus_connect_messages',
  BILLS: 'campus_connect_bills',
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const localDb = {
  getData: (key: string, defaultData: any[]) => {
    const stored = localStorage.getItem(key);
    if (!stored) {
      localStorage.setItem(key, JSON.stringify(defaultData));
      return defaultData;
    }
    return JSON.parse(stored);
  },
  saveData: (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  }
};

/**
 * Helper to ensure the Seed User exists
 */
const ensureSeedUser = async () => {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('users').upsert({
      id: SEED_USER.id,
      name: SEED_USER.name,
      avatar: SEED_USER.avatar,
      rating: SEED_USER.rating,
      verified: SEED_USER.verified,
      email: SEED_USER.email
    }, { onConflict: 'id' });
    if (error) console.error("Error syncing user:", error.message);
  } else {
    // Local: Ensure SEED_USER is in the list
    const users = localDb.getData(STORAGE_KEYS.USERS, [SEED_USER]);
    if (!users.find((u: User) => u.id === SEED_USER.id)) {
        localDb.saveData(STORAGE_KEYS.USERS, [...users, SEED_USER]);
    }
  }
};

// Initialize DB with seed data if needed
ensureSeedUser();

export const db = {
  auth: {
    signIn: async (email: string): Promise<User> => {
       await delay(800);
       const cleanEmail = email.trim().toLowerCase();
       
       if (!isSupabaseConfigured) {
         const users = localDb.getData(STORAGE_KEYS.USERS, [SEED_USER]);
         const user = users.find((u: User) => u.email.trim().toLowerCase() === cleanEmail);
         if (!user) throw new Error("User not found");
         return user;
       }
       // Supabase Auth Mock (assuming simple lookup for demo)
       const { data } = await supabase.from('users').select('*').eq('email', cleanEmail).single();
       if (!data) throw new Error("User not found");
       return data;
    },
    signUp: async (email: string, name: string): Promise<User> => {
       await delay(800);
       const cleanEmail = email.trim().toLowerCase();

       const newUser: User = {
         id: Math.random().toString(36).substr(2, 9),
         name: name.trim(),
         email: cleanEmail,
         avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.replace(/\s/g, '')}`, // Dynamic avatar
         rating: 5.0,
         verified: false,
         currentStreak: 0,
         activityLog: [],
         bio: ''
       };

       if (!isSupabaseConfigured) {
         const users = localDb.getData(STORAGE_KEYS.USERS, [SEED_USER]);
         // Check if user exists (case insensitive)
         if (users.find((u: User) => u.email.trim().toLowerCase() === cleanEmail)) {
            throw new Error("User already exists");
         }
         
         localDb.saveData(STORAGE_KEYS.USERS, [...users, newUser]);
         return newUser;
       }

       const { data, error } = await supabase.from('users').insert(newUser).select().single();
       if (error) throw error;
       return data;
    }
  },

  users: {
    get: async (id: string): Promise<User> => {
       if (!isSupabaseConfigured) {
          const users = localDb.getData(STORAGE_KEYS.USERS, [SEED_USER]);
          const user = users.find((u: User) => u.id === id);
          if (user) return user;
          
          // Fallback to searching in mocks if not in users table (for historical mock data)
          const allUsers = [
              ...MOCK_RIDES.map(r => r.driver),
              ...MOCK_ITEMS.map(i => i.owner),
              ...MOCK_TASKS.map(t => t.requester)
          ];
          const found = allUsers.find(u => u.id === id);
          return found || { ...SEED_USER, id, name: 'Unknown User' };
       }
       const { data } = await supabase.from('users').select('*').eq('id', id).single();
       return data || SEED_USER;
    },
    update: async (id: string, updates: Partial<User>): Promise<User> => {
      if (!isSupabaseConfigured) {
        await delay(500); 
        const users = localDb.getData(STORAGE_KEYS.USERS, [SEED_USER]);
        const index = users.findIndex((u: User) => u.id === id);
        
        if (index === -1) throw new Error("User to update not found");
        
        const updatedUser = { ...users[index], ...updates };
        users[index] = updatedUser;
        localDb.saveData(STORAGE_KEYS.USERS, users);
        return updatedUser;
      }

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
        
      if(error) throw error;
      return data;
    }
  },

  // --- BILLS SYSTEM ---
  bills: {
    getAll: async (userId: string): Promise<Bill[]> => {
      if (!isSupabaseConfigured) {
        await delay(400);
        // Initialize mock bills in storage if empty
        const storedBills = localStorage.getItem(STORAGE_KEYS.BILLS);
        if (!storedBills) {
           localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(MOCK_BILLS));
           return MOCK_BILLS;
        }
        return JSON.parse(storedBills);
      }
      return [];
    },
    pay: async (id: string): Promise<boolean> => {
      if (!isSupabaseConfigured) {
        await delay(600);
        const bills = localDb.getData(STORAGE_KEYS.BILLS, MOCK_BILLS);
        const updatedBills = bills.map((b: Bill) => 
          b.id === id ? { ...b, status: 'paid', paidAt: new Date().toISOString() } : b
        );
        localDb.saveData(STORAGE_KEYS.BILLS, updatedBills);
        return true;
      }
      return false;
    }
  },

  // --- CHAT SYSTEM ---
  chats: {
    list: async (currentUserId: string): Promise<Chat[]> => {
       if (!isSupabaseConfigured) {
         await delay(300);
         const chats = localDb.getData(STORAGE_KEYS.CHATS, []);
         const messages = localDb.getData(STORAGE_KEYS.MESSAGES, []);
         
         const userChats = chats.filter((c: any) => c.participants.includes(currentUserId));
         
         return Promise.all(userChats.map(async (c: any) => {
            const chatMsgs = messages.filter((m: any) => m.chatId === c.id);
            const lastMsg = chatMsgs.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
            const otherId = c.participants.find((p: string) => p !== currentUserId);
            const otherUser = await db.users.get(otherId);
            
            return { ...c, lastMessage: lastMsg, otherUser };
         }));
       }
       return [];
    },

    getOrCreate: async (currentUserId: string, otherUserId: string, contextType: string, contextTitle: string): Promise<string> => {
       const participants = [currentUserId, otherUserId].sort();
       
       if (!isSupabaseConfigured) {
          const chats = localDb.getData(STORAGE_KEYS.CHATS, []);
          const existing = chats.find((c: any) => 
            JSON.stringify(c.participants.sort()) === JSON.stringify(participants) &&
            c.contextType === contextType && 
            c.contextTitle === contextTitle
          );
          
          if (existing) return existing.id;

          const newChat = {
            id: Math.random().toString(36).substr(2, 9),
            participants,
            contextType,
            contextTitle,
            createdAt: new Date().toISOString()
          };
          localDb.saveData(STORAGE_KEYS.CHATS, [...chats, newChat]);
          return newChat.id;
       }
       return 'mock-id';
    },

    getMessages: async (chatId: string): Promise<Message[]> => {
      if (!isSupabaseConfigured) {
        const messages = localDb.getData(STORAGE_KEYS.MESSAGES, []);
        return messages
          .filter((m: any) => m.chatId === chatId)
          .sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      }
      return [];
    },

    sendMessage: async (chatId: string, senderId: string, content: string) => {
      const msg = {
        id: Math.random().toString(36).substr(2, 9),
        chatId,
        senderId,
        content,
        timestamp: new Date().toISOString()
      };

      if (!isSupabaseConfigured) {
        const messages = localDb.getData(STORAGE_KEYS.MESSAGES, []);
        localDb.saveData(STORAGE_KEYS.MESSAGES, [...messages, msg]);
        return msg;
      }
      return msg;
    }
  },

  // --- POOLING ---
  rides: {
    getAll: async (): Promise<Ride[]> => {
      if (!isSupabaseConfigured) {
        await delay(500);
        return localDb.getData(STORAGE_KEYS.RIDES, MOCK_RIDES);
      }
      return []; 
    },
    create: async (ride: Omit<Ride, 'id' | 'driver'>, creator: User): Promise<Ride> => {
      if (!isSupabaseConfigured) {
        await delay(500);
        const newRide: Ride = {
          ...ride,
          id: Math.random().toString(36).substr(2, 9),
          driver: creator,
        };
        const current = localDb.getData(STORAGE_KEYS.RIDES, MOCK_RIDES);
        localDb.saveData(STORAGE_KEYS.RIDES, [newRide, ...current]);
        return newRide;
      }
      throw new Error("Supabase not implemented for this step");
    },
    join: async (id: string): Promise<boolean> => {
      if (!isSupabaseConfigured) {
        await delay(500);
        const rides = localDb.getData(STORAGE_KEYS.RIDES, MOCK_RIDES);
        const updatedRides = rides.map((r: any) => {
            if (r.id === id && r.seatsAvailable > 0) {
                return { ...r, seatsAvailable: r.seatsAvailable - 1 };
            }
            return r;
        });
        localDb.saveData(STORAGE_KEYS.RIDES, updatedRides);
        return true;
      }
      return false;
    }
  },

  // --- RENTING ---
  items: {
    getAll: async (): Promise<RentalItem[]> => {
      if (!isSupabaseConfigured) {
        await delay(500);
        return localDb.getData(STORAGE_KEYS.ITEMS, MOCK_ITEMS);
      }
      return [];
    },
    create: async (item: Omit<RentalItem, 'id' | 'owner' | 'image' | 'status'>, creator: User): Promise<RentalItem> => {
      const imageSeed = item.title.replace(/\s+/g, '-').toLowerCase();
      const imageUrl = `https://picsum.photos/seed/${imageSeed}/200/200`;

      if (!isSupabaseConfigured) {
        await delay(500);
        const newItem: RentalItem = {
          ...item,
          id: Math.random().toString(36).substr(2, 9),
          owner: creator,
          status: 'available',
          image: imageUrl
        };
        const current = localDb.getData(STORAGE_KEYS.ITEMS, MOCK_ITEMS);
        localDb.saveData(STORAGE_KEYS.ITEMS, [newItem, ...current]);
        return newItem;
      }
       throw new Error("Supabase not implemented for this step");
    },
    book: async (id: string): Promise<boolean> => {
      if (!isSupabaseConfigured) {
         await delay(500);
         const items = localDb.getData(STORAGE_KEYS.ITEMS, MOCK_ITEMS);
         const updatedItems = items.map((i: any) => i.id === id ? { ...i, status: 'rented' } : i);
         localDb.saveData(STORAGE_KEYS.ITEMS, updatedItems);
         return true;
      }
      return false;
    }
  },

  // --- DELIVERY ---
  tasks: {
    getAll: async (): Promise<DeliveryTask[]> => {
      if (!isSupabaseConfigured) {
        await delay(500);
        return localDb.getData(STORAGE_KEYS.TASKS, MOCK_TASKS);
      }
      return [];
    },
    create: async (task: Omit<DeliveryTask, 'id' | 'requester' | 'status'>, creator: User): Promise<DeliveryTask> => {
      if (!isSupabaseConfigured) {
        await delay(500);
        const newTask: DeliveryTask = {
          ...task,
          id: Math.random().toString(36).substr(2, 9),
          requester: creator,
          status: 'open',
        };
        const current = localDb.getData(STORAGE_KEYS.TASKS, MOCK_TASKS);
        localDb.saveData(STORAGE_KEYS.TASKS, [newTask, ...current]);
        return newTask;
      }
      throw new Error("Supabase not implemented for this step");
    },
    accept: async (id: string): Promise<boolean> => {
       if (!isSupabaseConfigured) {
          await delay(500);
          const tasks = localDb.getData(STORAGE_KEYS.TASKS, MOCK_TASKS);
          const updatedTasks = tasks.map((t: any) => t.id === id ? { ...t, status: 'assigned' } : t);
          localDb.saveData(STORAGE_KEYS.TASKS, updatedTasks);
          return true;
       }
       return false;
    }
  }
};