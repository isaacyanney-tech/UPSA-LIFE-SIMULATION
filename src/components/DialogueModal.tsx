/**
 * UPSA Life - NPC Dialogue & Conversation System
 * Branching conversation choices that boost friendship scores,
 * unlock campus activities, and trigger missions.
 */

import React, { useState } from 'react';
import { useGame } from '../context/GameStateContext';
import { NPCS } from '../data/gameData';
import { MessageSquare, Heart, CheckCircle, Sparkles, X } from 'lucide-react';
import { audioService } from '../services/AudioService';

export const DialogueModal: React.FC = () => {
  const {
    activeDialogNpc,
    setActiveDialogNpc,
    friendships,
    adjustFriendship,
    completeMissionStep,
    missionProgress,
    showToast,
    setIsPhoneOpen,
    setPhoneActiveApp,
  } = useGame();

  const [currentStep, setCurrentStep] = useState(0);

  if (!activeDialogNpc) return null;

  const npc = NPCS[activeDialogNpc];
  if (!npc) return null;

  const friendship = friendships[activeDialogNpc] || { score: 10, status: 'Acquaintance' };

  // NPC dialogue scripts & branching responses
  const getDialogue = () => {
    switch (activeDialogNpc) {
      case 'ama':
        return {
          greeting: `Hey! Good to see you on campus! Are you preparing for Dr. Boateng’s mid-sem exams? The balance sheets can be tricky if you don't master double-entry bookkeeping!`,
          options: [
            {
              text: `Can we form a group study session at the Central Library?`,
              reply: `I would love that! Let's grab a table on the 2nd floor after 2 PM. I'll bring my past questions!`,
              friendshipDelta: 15,
              triggerMission: 'm2_meet_ama',
            },
            {
              text: `How do you always stay so organized with coursework?`,
              reply: `Haha, I review my lecture notes every evening for 30 minutes! Consistency is everything at UPSA.`,
              friendshipDelta: 10,
            },
            {
              text: `I'll text you later on the campus app!`,
              reply: `Sounds good! My notifications are always on for study groups. See you soon!`,
              friendshipDelta: 5,
            },
          ],
        };

      case 'kwame':
        return {
          greeting: `Yo, what's good! I'm currently prototyping a campus shuttle tracking app for UPSA students. What do you think of modern tech on campus?`,
          options: [
            {
              text: `That's brilliant Kwame! It will save everyone standing under the sun.`,
              reply: `Exactly my vision, bro! I'm adding MoMo ticketing directly inside it. Let's hang out later!`,
              friendshipDelta: 15,
            },
            {
              text: `Teach me some coding or web design tips sometime?`,
              reply: `Say less! Bring your laptop to the Students Centre whenever I am coding here.`,
              friendshipDelta: 12,
            },
            {
              text: `Are you coming to the gaming tournament this weekend?`,
              reply: `You already know! FIFA tournament at the common room!`,
              friendshipDelta: 10,
            },
          ],
        };

      case 'esi':
        return {
          greeting: `Hello dear! Welcome to Banking Square! I just made fresh meat pies and meat pastries for students today. How are your classes going?`,
          options: [
            {
              text: `Your pastries are famous all over the hostels, Esi!`,
              reply: `Aww, thank you so much! That warms my heart. You get a special friend discount next order!`,
              friendshipDelta: 15,
            },
            {
              text: `How do you balance running a business with Business Admin studies?`,
              reply: `It's all about time management! I apply the marketing principles from class directly to my thrift & bakery hustle.`,
              friendshipDelta: 10,
            },
            {
              text: `Let's take an evening stroll around University Avenue later.`,
              reply: `I'd love that! Sunset over the campus is so peaceful.`,
              friendshipDelta: 12,
            },
          ],
        };

      case 'kojo':
        return {
          greeting: `Chairman! How body? We have an intense football session on the AstroTurf today. You look like you have some serious football skill!`,
          options: [
            {
              text: `Let's test it out! Challenge me to a penalty shootout!`,
              reply: `Now you're talking! Head to the AstroTurf pitch and let's see what you've got!`,
              friendshipDelta: 15,
              triggerMission: 'm5_astroturf_match',
            },
            {
              text: `How is the Marketing department team preparing for the cup?`,
              reply: `We've been drilling tactical runs every Tuesday. We're lifting the trophy this year for sure!`,
              friendshipDelta: 10,
            },
            {
              text: `Just stopping by to say hi, catch you later bro!`,
              reply: `Always a pleasure! Stay energized out there!`,
              friendshipDelta: 5,
            },
          ],
        };

      case 'prof_boateng':
        return {
          greeting: `Good day, student! Diligence and critical thinking are the pillars of excellence at UPSA. Are you applying yourself diligently to your studies?`,
          options: [
            {
              text: `Yes Dr. Boateng, I am dedicated to maintaining a high GPA.`,
              reply: `Commendable attitude. Remember that academic integrity and thorough preparation guarantee professional triumph.`,
              friendshipDelta: 10,
            },
            {
              text: `May I ask for advice on mastering continuous assessments?`,
              reply: `Always participate actively in lectures and complete assignments well ahead of the deadline. Excellence is a habit.`,
              friendshipDelta: 12,
            },
          ],
        };

      case 'auntie_mansah':
        return {
          greeting: `Akwaaba, my child! Come and eat good food. Hot Waakye with shito, boiled eggs, wele, and plantain is ready!`,
          options: [
            {
              text: `Auntie Mansah, your Waakye is the best in all of Accra!`,
              reply: `Ei, bless you my child! May your exams be blessed and your grades be high!`,
              friendshipDelta: 15,
              triggerMission: 'm4_waakye_run',
            },
            {
              text: `Can I also order food through the campus smartphone app?`,
              reply: `Yes oo! Just open your phone and select Food Mart, and it comes straight to your room!`,
              friendshipDelta: 10,
            },
          ],
        };

      default:
        return {
          greeting: `Hello! Hope you are having a wonderful day on campus!`,
          options: [
            {
              text: `Great seeing you!`,
              reply: `Same here! See you around!`,
              friendshipDelta: 5,
            },
          ],
        };
    }
  };

  const dialogue = getDialogue();

  const handleSelectOption = (opt: {
    text: string;
    reply: string;
    friendshipDelta: number;
    triggerMission?: string;
  }) => {
    audioService.playClick();
    adjustFriendship(activeDialogNpc, opt.friendshipDelta);

    if (opt.triggerMission && !missionProgress[opt.triggerMission]?.completed) {
      completeMissionStep(opt.triggerMission);
    }

    showToast(`💬 ${npc.name}: "${opt.reply}"`);
    setActiveDialogNpc(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative text-white">
        {/* Close Button */}
        <button
          onClick={() => {
            audioService.playClick();
            setActiveDialogNpc(null);
          }}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* NPC Profile Banner */}
        <div className="flex items-center gap-3.5 mb-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg"
            style={{ backgroundColor: npc.shirtColor }}
          >
            {npc.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white">{npc.name}</h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400 font-mono">
                {friendship.status} ({friendship.score}%)
              </span>
            </div>
            <div className="text-xs text-slate-300">
              {npc.programme} {npc.level ? `· Level ${npc.level}` : ''}
            </div>
          </div>
        </div>

        {/* Speech Balloon */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 mb-5 text-sm leading-relaxed text-slate-100 shadow-inner">
          "{dialogue.greeting}"
        </div>

        {/* Player Response Choices */}
        <div className="space-y-2 mb-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            Choose your response:
          </div>
          {dialogue.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleSelectOption(opt)}
              className="w-full text-left p-3.5 rounded-xl bg-slate-800/70 hover:bg-slate-700/90 border border-slate-700 hover:border-emerald-500/60 transition-all flex items-center justify-between group"
            >
              <span className="text-sm text-slate-200 group-hover:text-emerald-300 font-medium">
                "{opt.text}"
              </span>
              <span className="text-xs font-mono text-emerald-400 shrink-0 ml-2">
                +{opt.friendshipDelta} Relationship
              </span>
            </button>
          ))}
        </div>

        {/* Fast Action to text on phone */}
        <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
          <button
            onClick={() => {
              setActiveDialogNpc(null);
              setIsPhoneOpen(true);
              setPhoneActiveApp('social');
            }}
            className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Open in Social Phone App</span>
          </button>
          <span className="text-slate-400">Press ESC or click close</span>
        </div>
      </div>
    </div>
  );
};
