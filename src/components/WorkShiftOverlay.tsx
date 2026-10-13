/**
 * UPSA Life - Work Shift Real-Time Countdown Overlay
 * Locks the player during their 60-second work shift with live countdown,
 * active duty log, and forfeiture warning if they abandon their shift early.
 */

import React, { useState } from 'react';
import { useGame } from '../context/GameStateContext';
import { Briefcase, AlertTriangle, CheckCircle2, Clock, Coins, Sparkles } from 'lucide-react';
import { audioService } from '../services/AudioService';

export const WorkShiftOverlay: React.FC = () => {
  const { activeShift, cancelWorkShift } = useGame();
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);

  if (!activeShift) return null;

  const progressPercent = Math.min(
    100,
    ((activeShift.totalSeconds - activeShift.remainingSeconds) / activeShift.totalSeconds) * 100
  );

  const duties = [
    'Cataloging reference manuals and university records...',
    'Assisting coursemates and faculty with campus inquiries...',
    'Verifying student identification credentials and documentation...',
    'Performing inventory audits and organizing student workspaces...',
    'Wrapping up final administrative shift checklists...',
  ];

  const dutyIndex = Math.min(
    duties.length - 1,
    Math.floor((progressPercent / 100) * duties.length)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-amber-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl text-white">
        {/* Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <Briefcase className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-amber-400 uppercase tracking-widest">
              Active Work Shift in Progress
            </div>
            <h3 className="text-lg font-bold text-white">{activeShift.title}</h3>
          </div>
        </div>

        {/* Live Timer Countdown */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-center mb-5">
          <div className="text-xs text-slate-400 font-medium mb-1">
            Time Remaining on Shift
          </div>
          <div className="text-4xl font-black font-mono text-amber-400 tracking-wider">
            00:{String(activeShift.remainingSeconds).padStart(2, '0')}
          </div>
          <div className="text-xs text-emerald-400 font-semibold mt-1">
            Target Wage: GH₵ {activeShift.pay.toFixed(2)}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2 mb-5">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Shift Completion</span>
            <span className="font-mono font-semibold">{progressPercent.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden border border-slate-700">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-1000"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Dynamic Duty Log */}
        <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/80 mb-6 text-xs text-slate-300 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="italic">{duties[dutyIndex]}</span>
        </div>

        {/* Action: Abandon shift confirmation */}
        {!showConfirmCancel ? (
          <button
            onClick={() => setShowConfirmCancel(true)}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-rose-950/60 border border-slate-700 hover:border-rose-500/60 text-slate-400 hover:text-rose-300 text-xs font-semibold transition-colors"
          >
            Leave Shift Early
          </button>
        ) : (
          <div className="p-3.5 bg-rose-950/50 border border-rose-500/50 rounded-2xl space-y-2.5 animate-in fade-in duration-150">
            <div className="flex items-start gap-2 text-xs text-rose-200">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>
                Warning: If you leave before your 1-minute shift completes, you will{' '}
                <strong>NOT be paid</strong> your GH₵ {activeShift.pay} wage!
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  cancelWorkShift();
                  setShowConfirmCancel(false);
                }}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition-colors"
              >
                Forfeit & Leave
              </button>
              <button
                onClick={() => setShowConfirmCancel(false)}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition-colors"
              >
                Continue Working
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
