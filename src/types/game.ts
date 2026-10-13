/**
 * UPSA Life - Game Types & Interfaces
 */

export type Gender = 'male' | 'female';

export interface AvatarConfig {
  skinTone: string;
  hairStyle: string;
  hairColor: string;
  shirtColor: string;
  pantsColor: string;
  shoesColor: string;
  accessory?: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  gender: Gender;
  programme: string;
  faculty: string;
  level: number; // 100, 200, 300, 400
  indexNumber: string;
  hostelName: string;
  roomType: 'single' | 'double' | 'triple' | 'quad';
  roomNumber: string;
  avatarConfig: AvatarConfig;
  gpa: number;
  academicCredits: number;
  semester: number;
  academicYear: string;
  createdAt: number;
}

export interface StudentNeeds {
  energy: number; // 0-100
  hunger: number; // 0-100
  happiness: number; // 0-100
  cleanliness: number; // 0-100
}

export interface RoomCustomization {
  wallColor: string;
  bedSpreadColor: string;
  rugColor: string;
  poster: 'upsa-crest' | 'black-stars' | 'motivational' | 'music' | 'none';
  deskPlant: boolean;
  fairyLights: boolean;
  studyLamp: boolean;
}

export interface FriendshipEntry {
  score: number; // 0 to 100
  status: 'Acquaintance' | 'Coursemate' | 'Friend' | 'Close Friend' | 'Best Friend';
  unlockedHangouts: string[];
}

export type FriendshipMap = Record<string, FriendshipEntry>;

export interface ChatMessage {
  id: string;
  senderId: string; // 'player' or NPC id
  text: string;
  timestamp: string;
  isRead?: boolean;
}

export interface ChatThread {
  npcId: string;
  messages: ChatMessage[];
  unreadCount: number;
}

export interface Mission {
  id: string;
  title: string;
  category: 'Academics' | 'Social' | 'Campus' | 'Survival';
  description: string;
  locationHint: string;
  targetNpcOrPlace: string;
  rewardMoney: number; // in GH₵
  rewardGpa: number;
  rewardFriendship?: { npcId: string; amount: number };
  completed: boolean;
  claimed: boolean;
}

export type MissionProgressMap = Record<
  string,
  { completed: boolean; step: number; claimed: boolean }
>;

export interface WalletTransaction {
  id: string;
  title: string;
  amount: number;
  type: 'credit' | 'debit';
  date: string;
  category: 'food' | 'academics' | 'stipend' | 'shopping' | 'accommodation' | 'work';
}

export interface Course {
  code: string;
  name: string;
  creditHours: number;
  lecturer: string;
  day: string;
  time: string;
  venue: string;
  attendance: number; // 0 - 100%
  gradeScore: number; // 0 - 100
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'food' | 'stationery' | 'clothing' | 'gadget' | 'decor';
  description: string;
  quantity: number;
  price: number;
  icon: string;
  effect?: {
    energy?: number;
    hunger?: number;
    happiness?: number;
    cleanliness?: number;
  };
}

export interface GameTime {
  dayName: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  weekNumber: number;
  hour: number; // 0-23
  minute: number; // 0-59
  timeSpeed: number; // multiplier
}

export type GameView =
  | 'creation'
  | 'dashboard'
  | 'campus'
  | 'room'
  | 'accommodation'
  | 'academics'
  | 'settings'
  | 'library'
  | 'lbc'
  | 'food_court'
  | 'banking'
  | 'astroturf';

export interface WorkShiftState {
  jobId: string;
  title: string;
  totalSeconds: number;
  remainingSeconds: number;
  pay: number;
  isCompleted: boolean;
}

export interface TransportOption {
  id: 'walk' | 'trotro' | 'bolt' | 'scooter';
  name: string;
  cost: number;
  timeMinutes: number;
  energyChange: number;
  happinessChange: number;
  description: string;
  icon: string;
}
