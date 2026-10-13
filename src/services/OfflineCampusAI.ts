import { GameTime, GameView } from '../types/game';

export interface CampusEvent {
  id: string;
  title: string;
  description: string;
  time: string;
  destinationView: GameView;
  destinationName: string;
  npcId?: string;
}

const EVENTS: CampusEvent[] = [
  { id: 'library-study', title: 'Open Study Circle', description: 'Bring a course question and revise with other students.', time: '14:00', destinationView: 'library', destinationName: 'Central Library', npcId: 'ama' },
  { id: 'campus-tech', title: 'Campus Tech Hangout', description: 'Swap ideas about useful student technology and small projects.', time: '15:00', destinationView: 'food_court', destinationName: 'Students Centre', npcId: 'kwame' },
  { id: 'food-break', title: 'Food Court Meetup', description: 'Take a break, catch up, and explore the in-game food stalls.', time: '12:30', destinationView: 'food_court', destinationName: 'Students Centre', npcId: 'esi' },
  { id: 'football-practice', title: 'Friendly Football Practice', description: 'Join a casual kickabout and meet students from other programmes.', time: '16:30', destinationView: 'astroturf', destinationName: 'AstroTurf', npcId: 'kojo' },
  { id: 'career-chat', title: 'Career Questions Meetup', description: 'Discuss study habits and career planning with a lecturer character.', time: '11:00', destinationView: 'lbc', destinationName: 'Lecture Block Complex', npcId: 'prof_boateng' },
  { id: 'weekend-wellbeing', title: 'Hostel Courtyard Social', description: 'Relax, check in with friends, and plan the week ahead.', time: '17:00', destinationView: 'room', destinationName: 'Hostel Room', npcId: 'auntie_mansah' },
];

const DAY_ORDER: GameTime['dayName'][] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function getCampusEvent(time: GameTime): CampusEvent {
  const dayIndex = Math.max(0, DAY_ORDER.indexOf(time.dayName));
  const event = EVENTS[(dayIndex + Math.max(0, time.weekNumber - 1)) % EVENTS.length];
  return { ...event, id: `${event.id}-w${time.weekNumber}-${time.dayName.toLowerCase()}` };
}

const pick = (items: string[], seed: number) => items[Math.abs(seed) % items.length];

export function getNpcReply(npcId: string, message: string, hour: number, friendshipScore: number): string {
  const lower = message.toLowerCase();
  const warm = friendshipScore >= 60 ? 'Chale, good to hear from you!' : 'Hey, nice hearing from you!';
  const afterHours = hour < 7 || hour >= 22;
  const scheduleNote = afterHours ? ' I’m winding down for the night, so let’s catch up properly tomorrow.' : '';

  const replies: Record<string, { study: string[]; social: string[]; default: string[] }> = {
    ama: {
      study: ['I’m revising my notes too. Want to compare one topic at the library?', 'Let’s pick one course question and work through it together.'],
      social: ['A library study circle sounds good. I can bring my notes.', 'Sure, let’s meet after our classes and plan a revision session.'],
      default: ['How are your courses going? I’ve been trying to keep up with my notes.', 'I found a useful way to organize lecture notes by topic this week.'],
    },
    kwame: {
      study: ['Let’s debug the idea together. What part is giving you trouble?', 'I can share a simple way to break a coding problem into smaller steps.'],
      social: ['I’m up for a campus hangout. Let’s meet at the Students Centre.', 'That sounds solid. We can talk tech and take a break after class.'],
      default: ['I’ve been sketching ideas for useful student tools. What would you build?', 'A small prototype is a good way to test an idea before adding more features.'],
    },
    esi: {
      study: ['I plan my study blocks around the busy hours at the stall. It helps me stay on track.', 'Let’s compare our weekly plans over a snack sometime.'],
      social: ['A short food court break sounds lovely. Let’s meet when you’re free.', 'I’ll be around the Students Centre later. Come say hi.'],
      default: ['Classes and the small business keep me busy, but a good plan makes both manageable.', 'How is your week going? Remember to take a proper break too.'],
    },
    kojo: {
      study: ['Rest and practice both matter. Don’t skip revision when training gets busy.', 'Let’s set a short study target before we head to the pitch.'],
      social: ['There’s room for one more at practice. Meet me at the AstroTurf.', 'A kickabout sounds good. Bring water and take it easy.'],
      default: ['Training is going well. I’m trying to balance practice with coursework.', 'What are you focusing on this week: class, fitness, or both?'],
    },
    prof_boateng: {
      study: ['Break the topic into definitions, examples, and one practice question. That is a sound revision method.', 'Start early, test your understanding, and ask for clarification when a concept is unclear.'],
      social: ['A focused study session is a good use of time. Choose a topic before you begin.', 'You are welcome to bring a course question to the next in-game consultation.'],
      default: ['Consistency and academic integrity matter more than last-minute cramming.', 'Set a clear study goal for today and review what you learned afterwards.'],
    },
    auntie_mansah: {
      study: ['Ei, remember to take a break and eat well while you study, my child.', 'A good meal and a bit of rest can help you reset before your next class.'],
      social: ['Akwaaba! Come through the Students Centre when you need a friendly break.', 'You are always welcome to stop by and say hello.'],
      default: ['Akwaaba, my child! How are your classes and campus days treating you?', 'Take your time, eat well, and make room for a little joy in the week.'],
    },
  };

  const npcReplies = replies[npcId] || {
    study: ['Let’s make a plan and tackle one topic at a time.'],
    social: ['That sounds good. Let’s meet on campus.'],
    default: ['How is your campus day going?'],
  };
  const intent = /study|exam|lecture|course|class|revision|account|grade|assignment|quiz/.test(lower)
    ? 'study'
    : /meet|hang|food|eat|football|game|walk|event|see you/.test(lower)
      ? 'social'
      : 'default';
  const seed = [...lower].reduce((total, char) => total + char.charCodeAt(0), friendshipScore + hour);
  return `${warm} ${pick(npcReplies[intent], seed)}${scheduleNote}`;
}

export function getOfflineTutorReply(question: string, programme = 'your programme'): string {
  const lower = question.toLowerCase();
  if (/account|balance|debit|credit|trial balance/.test(lower)) {
    return 'For a basic accounting check, remember the accounting equation: Assets = Liabilities + Equity. List each account, identify whether it increases or decreases, then check that total debits equal total credits. This guide is for practice; follow your course materials for assessed work.';
  }
  if (/fifo|lifo|queue|stack|algorithm|code|python|program/.test(lower)) {
    return 'A queue follows first-in, first-out (FIFO), while a stack follows last-in, first-out (LIFO). Try tracing a short sequence by hand, then write down what is added and removed at each step.';
  }
  if (/gpa|grade|exam|study|revision|course/.test(lower)) {
    return `For ${programme}, try a short study cycle: choose one learning outcome, recall it without notes, check your answer against course materials, then practise a related question. This guide does not calculate official grades or GPA.`;
  }
  if (/food|eat|waakye|jollof|hostel|room|campus|where/.test(lower)) {
    return 'I can help with the in-game campus locations: use the map to find the library, Students Centre, LBC, hostel, and AstroTurf. Campus details and notices here are fictional game content, not official university information.';
  }
  return `I’m the offline campus guide, so I can help with study tips, basic course concepts, and in-game locations. Try asking about FIFO vs LIFO, a study plan, or where to go in the game. Your programme is ${programme}.`;
}
