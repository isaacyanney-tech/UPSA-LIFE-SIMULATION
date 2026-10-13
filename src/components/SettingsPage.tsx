/**
 * UPSA Life - Settings & Game Configuration Page
 * Adjust audio, graphics, lighting, and manage game save data.
 */

import React, { useState } from 'react';
import { useGame } from '../context/GameStateContext';
import {
  Settings,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Sparkles,
  RotateCcw,
  User,
  Shield,
  Smartphone,
  CheckCircle2,
} from 'lucide-react';
import { audioService } from '../services/AudioService';

export const SettingsPage: React.FC = () => {
  const {
    student,
    gameTime,
    resetAllGameData,
    setCurrentView,
    showToast,
  } = useGame();

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  if (!student) return null;

  return (
    <div className="w-full h-full min-h-screen bg-slate-950 text-slate-100 overflow-y-auto pb-24 pt-20 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Simulation Settings</h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Customize audio, performance, and manage your student profile data.
            </p>
          </div>
        </div>

        {/* Audio & Sound */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Audio & Sound Effects
          </h2>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center gap-3">
              {soundEnabled ? (
                <Volume2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <VolumeX className="w-5 h-5 text-slate-500" />
              )}
              <div>
                <div className="font-semibold text-sm text-white">Web Audio Synthesizer</div>
                <div className="text-xs text-slate-400">
                  Plays footsteps, phone chimes, lecture bells, and transaction sounds.
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                const next = !soundEnabled;
                setSoundEnabled(next);
                if (next) audioService.playClick();
                showToast(next ? '🔊 Sound effects enabled' : '🔇 Sound effects muted');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                soundEnabled
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-slate-700 text-slate-300'
              }`}
            >
              {soundEnabled ? 'Enabled' : 'Muted'}
            </button>
          </div>
        </div>

        {/* Student Profile Summary */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Registered Student Record
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1">
              <span className="text-slate-400">Full Name</span>
              <div className="font-bold text-sm text-white">{student.name}</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1">
              <span className="text-slate-400">Student Index Number</span>
              <div className="font-bold text-sm text-white font-mono">{student.indexNumber}</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1">
              <span className="text-slate-400">Degree Programme</span>
              <div className="font-bold text-sm text-white">{student.programme}</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1">
              <span className="text-slate-400">Allocated Hostel</span>
              <div className="font-bold text-sm text-white">{student.hostelName} ({student.roomNumber})</div>
            </div>
          </div>
        </div>

        {/* Reset Save Data */}
        <div className="bg-slate-900/90 border border-rose-900/30 rounded-3xl p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-rose-400">
            Danger Zone
          </h2>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-rose-950/20 border border-rose-800/40">
            <div>
              <div className="font-bold text-sm text-white">Reset Simulation & Start Over</div>
              <div className="text-xs text-slate-400">
                Clears all local storage, friendship scores, wallet balances, and returns to matriculation.
              </div>
            </div>

            {showConfirmReset ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowConfirmReset(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => resetAllGameData()}
                  className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-lg"
                >
                  Confirm Reset
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirmReset(true)}
                className="px-4 py-2 bg-rose-950 hover:bg-rose-900 border border-rose-700 text-rose-200 text-xs font-semibold rounded-xl transition-colors"
              >
                Reset Data
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
