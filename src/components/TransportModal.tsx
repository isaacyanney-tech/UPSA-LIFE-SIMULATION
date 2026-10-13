/**
 * UPSA Life - Campus Transit Modal & Cutscene Animation
 * Gives players options to walk on foot, hire an e-scooter, board a campus shuttle trotro,
 * or take an AC Bolt/Uber ride, accompanied by an animated transit cutscene!
 */

import React, { useEffect, useState } from 'react';
import { useGame } from '../context/GameStateContext';
import { TRANSPORT_OPTIONS } from '../data/gameData';
import { TransportOption } from '../types/game';
import {
  X,
  Footprints,
  Compass,
  ArrowRight,
  Sparkles,
  Zap,
  CheckCircle2,
  Clock,
  Coins,
} from 'lucide-react';
import { audioService } from '../services/AudioService';

export const TransportModal: React.FC = () => {
  const {
    isTransportModalOpen,
    setIsTransportModalOpen,
    pendingTransportDestination,
    startCommute,
    activeTransport,
    dismissTransportCutscene,
    walletBalance,
  } = useGame();

  // Transit cutscene progress (0% to 100%)
  const [transitProgress, setTransitProgress] = useState(0);

  useEffect(() => {
    if (!activeTransport) {
      setTransitProgress(0);
      return;
    }

    const duration = 2800; // 2.8 seconds cinematic cutscene
    const interval = 40;
    const step = 100 / (duration / interval);

    const timer = setInterval(() => {
      setTransitProgress((prev) => {
        if (prev + step >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [activeTransport]);

  // 1. If actively commuting, show the animated cutscene!
  if (activeTransport) {
    const isComplete = transitProgress >= 100;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md animate-in fade-in duration-300">
        <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl text-center text-white overflow-hidden">
          {/* Animated Road Horizon Graphic */}
          <div className="relative h-44 w-full bg-gradient-to-b from-sky-900 via-indigo-950 to-slate-950 rounded-2xl overflow-hidden mb-6 flex flex-col justify-end p-4 border border-slate-800">
            {/* Distant skyline & sun */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-amber-400/80 blur-lg" />
            <div className="absolute top-8 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-amber-300 shadow-lg shadow-amber-400/50" />

            {/* Passing trees animation */}
            <div className="absolute inset-x-0 bottom-12 flex justify-around opacity-40">
              <span className="text-2xl animate-pulse">🌴</span>
              <span className="text-2xl animate-pulse delay-150">🌴</span>
              <span className="text-2xl animate-pulse delay-300">🌴</span>
              <span className="text-2xl animate-pulse delay-500">🌴</span>
            </div>

            {/* Asphalt Road with Moving Dashes */}
            <div className="h-12 w-full bg-slate-800 rounded-lg relative overflow-hidden flex items-center justify-center">
              <div
                className="absolute inset-0 flex items-center justify-around font-mono text-amber-400 text-lg tracking-widest"
                style={{
                  transform: `translateX(-${(transitProgress * 4) % 40}px)`,
                }}
              >
                <span>- - - - - - - - - - - - - - - - - - - - - - - - - - -</span>
              </div>

              {/* Moving Vehicle Avatar */}
              <div
                className="absolute z-10 text-3xl sm:text-4xl transition-all duration-75"
                style={{
                  left: `${Math.min(85, 10 + transitProgress * 0.75)}%`,
                  transform: 'translateY(-2px)',
                }}
              >
                {activeTransport.option.icon}
              </div>
            </div>
          </div>

          {/* Destination Header */}
          <div className="space-y-1 mb-4">
            <div className="text-xs font-semibold text-emerald-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>In Transit · University Avenue</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Heading to {activeTransport.destinationName}
            </h3>
            <p className="text-xs text-slate-400">
              Via {activeTransport.option.name}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mb-6 border border-slate-700/80">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full transition-all duration-75"
              style={{ width: `${transitProgress}%` }}
            />
          </div>

          {/* Done Button */}
          {isComplete ? (
            <button
              onClick={dismissTransportCutscene}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-2xl shadow-xl shadow-emerald-600/30 transition-all transform scale-100 hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Arrived! Step into {activeTransport.destinationName}</span>
            </button>
          ) : (
            <div className="text-xs text-slate-400 font-medium animate-pulse">
              Cruising smoothly across campus...
            </div>
          )}
        </div>
      </div>
    );
  }

  // 2. Selection Modal
  if (!isTransportModalOpen || !pendingTransportDestination) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl text-white">
        {/* Close Button */}
        <button
          onClick={() => setIsTransportModalOpen(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Campus Commute & Transit</h3>
            <p className="text-xs text-slate-400">
              Select how you would like to travel to {pendingTransportDestination.name}
            </p>
          </div>
        </div>

        {/* Transport Options List */}
        <div className="space-y-2.5 mb-6">
          {TRANSPORT_OPTIONS.map((opt) => {
            const canAfford = walletBalance >= opt.cost;
            return (
              <div
                key={opt.id}
                onClick={() => {
                  if (!canAfford) return;
                  startCommute(
                    opt as TransportOption,
                    pendingTransportDestination.view,
                    pendingTransportDestination.name
                  );
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 group ${
                  canAfford
                    ? 'bg-slate-800/70 hover:bg-slate-800 border-slate-700 hover:border-emerald-500/60'
                    : 'bg-slate-800/30 border-slate-800 opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="text-2xl sm:text-3xl p-2 rounded-xl bg-slate-800 group-hover:scale-110 transition-transform">
                  {opt.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-white truncate group-hover:text-emerald-300">
                      {opt.name}
                    </h4>
                    <span className="font-mono text-xs font-bold text-amber-400">
                      {opt.cost === 0 ? 'FREE' : `GH₵ ${opt.cost}`}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5 truncate">
                    {opt.description}
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-blue-400" />
                      {opt.timeMinutes} mins
                    </span>
                    <span className={opt.energyChange < 0 ? 'text-rose-400' : 'text-emerald-400'}>
                      Energy: {opt.energyChange}%
                    </span>
                    <span className="text-emerald-400">
                      +{opt.happinessChange} Happiness
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => setIsTransportModalOpen(false)}
          className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
