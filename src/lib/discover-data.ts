export type ActivityType = {
  slug: string;
  name: string;
  emoji: string;
};

export type Category = {
  title: string;
  types: ActivityType[];
};

export const CATEGORIES: Category[] = [
  {
    title: "Daily Life",
    types: [
      { slug: "tea-coffee", name: "Tea & Coffee", emoji: "☕" },
      { slug: "food", name: "Food", emoji: "🍜" },
      { slug: "walks", name: "Walks", emoji: "🚶" },
      { slug: "toto-sharing", name: "Toto Sharing", emoji: "🛺" },
      { slug: "cab-partner", name: "Cab Partner", emoji: "🚕" },
    ],
  },
  {
    title: "Recreation",
    types: [
      { slug: "gaming", name: "Gaming", emoji: "🎮" },
      { slug: "movie-nights", name: "Movie Nights", emoji: "🎬" },
      { slug: "board-games", name: "Board Games", emoji: "🎲" },
      { slug: "parties", name: "Parties", emoji: "🎉" },
      { slug: "campus-hunt", name: "Campus Hunt", emoji: "🗺️" },
      { slug: "trips-outings", name: "Trips & Outings", emoji: "🧳" },
    ],
  },
  {
    title: "Creative",
    types: [
      { slug: "music", name: "Music", emoji: "🎧" },
      { slug: "dance", name: "Dance", emoji: "💃" },
      { slug: "photography", name: "Photography", emoji: "📸" },
      { slug: "art", name: "Art", emoji: "🎨" },
      { slug: "writing", name: "Writing", emoji: "✍️" },
      { slug: "content-creation", name: "Content Creation", emoji: "🎥" },
    ],
  },
  {
    title: "Sports",
    types: [
      { slug: "football", name: "Football", emoji: "⚽" },
      { slug: "cricket", name: "Cricket", emoji: "🏏" },
      { slug: "badminton", name: "Badminton", emoji: "🏸" },
      { slug: "basketball", name: "Basketball", emoji: "🏀" },
      { slug: "volleyball", name: "Volleyball", emoji: "🏐" },
      { slug: "hockey", name: "Hockey", emoji: "🏑" },
      { slug: "tennis", name: "Tennis", emoji: "🎾" },
      { slug: "table-tennis", name: "Table Tennis", emoji: "🏓" },
      { slug: "swimming", name: "Swimming", emoji: "🏊" },
      { slug: "running", name: "Running & Athletics", emoji: "🏃" },
      { slug: "cycling", name: "Cycling", emoji: "🚴" },
      { slug: "gym-fitness", name: "Gym & Fitness", emoji: "🏋️" },
      { slug: "indoor-sports", name: "Indoor Sports", emoji: "🎱" },
    ],
  },
  {
    title: "Learning & Networking",
    types: [
      { slug: "study-groups", name: "Study Groups", emoji: "📚" },
      { slug: "club-workshops", name: "Club Workshops", emoji: "🛠️" },
      { slug: "discussions", name: "Discussions & Mentorship", emoji: "💬" },
      { slug: "career", name: "Career", emoji: "💼" },
    ],
  },
];

export const ALL_TYPES: ActivityType[] = CATEGORIES.flatMap((c) => c.types);

export function getActivityType(slug: string): ActivityType | undefined {
  return ALL_TYPES.find((t) => t.slug === slug);
}

export type Activity = {
  id: string;
  emoji: string;
  title: string;
  time: string;
  host: string;
  joined: number;
  capacity: number;
  eligibility?: string[];
  meetupPoint: string;
  cost?: string;
  cta: string;
  deadline?: string;
  status?: string;
};

export const TEA_ACTIVITIES: Activity[] = [
  {
    id: "2",
    emoji: "🍵",
    title: "Evening Chai at Chedi's",
    time: "Today • 6:00 PM",
    host: "Rhea",
    joined: 3,
    capacity: 6,
    eligibility: ["Freshers", "Everyone"],
    meetupPoint: "Chedi's Tea Stall",
    cost: "₹15/person",
    cta: "Join before 5:45 PM",
    deadline: "5:45 PM",
  },
  {
    id: "1",
    emoji: "☕",
    title: "Chai at Nescafé",
    time: "Today • 7:30 PM",
    host: "Aaditya",
    joined: 2,
    capacity: 5,
    eligibility: ["Everyone"],
    meetupPoint: "RP Hall Gate",
    cost: "₹20/person",
    cta: "Join before 7:15 PM",
    deadline: "7:15 PM",
  },
  {
    id: "3",
    emoji: "☕",
    title: "Coffee & Catch-up at CCD",
    time: "Tomorrow • 5:00 PM",
    host: "Kabir",
    joined: 1,
    capacity: 4,
    meetupPoint: "CCD, Tech Market",
    cost: "₹120/person",
    cta: "Join before 4:30 PM",
    deadline: "4:30 PM",
  },
  {
    id: "4",
    emoji: "🍰",
    title: "Late-night Chai & Maggie",
    time: "Tonight • 11:30 PM",
    host: "Ishaan",
    joined: 4,
    capacity: 6,
    eligibility: ["Everyone"],
    meetupPoint: "LBS Hall Dhaba",
    cost: "₹40/person",
    cta: "Join before 11:15 PM",
    deadline: "11:15 PM",
  },
];