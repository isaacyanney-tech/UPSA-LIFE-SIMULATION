/**
 * UPSA Life - Master 3D University Life Simulation
 * Inspired by Lagos Life, set at the University of Professional Studies, Accra (UPSA).
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { clearSavedGameData, GameProvider, useGame } from './context/GameStateContext';
import { CharacterCreation } from './components/CharacterCreation';
import { Campus } from './components/Campus';
import { StudentRoom } from './components/StudentRoom';
import { BuildingInterior } from './components/BuildingInterior';
import { Dashboard } from './components/Dashboard';
import { AcademicsPortal } from './components/AcademicsPortal';
import { AccommodationPortal } from './components/AccommodationPortal';
import { SettingsPage } from './components/SettingsPage';
import { PhoneOverlay } from './components/PhoneOverlay';
import { HUD } from './components/HUD';
import { DialogueModal } from './components/DialogueModal';
import { ActivitiesModal } from './components/ActivitiesModal';
import { TransportModal } from './components/TransportModal';
import { WorkShiftOverlay } from './components/WorkShiftOverlay';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class GameErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('UPSA Life runtime error captured by boundary:', error, errorInfo);
  }

  handleReset = () => {
    clearSavedGameData();
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950 text-white">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center text-2xl">
              🎓
            </div>
            <h2 className="text-xl font-bold">UPSA Life Simulation Resumed</h2>
            <p className="text-xs text-slate-300">
              The simulation caught an unexpected visual glitch. Click below to continue your campus journey smoothly.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-bold text-white transition-colors"
              >
                Reload Simulation
              </button>
              <button
                onClick={this.handleReset}
                className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-semibold text-slate-300 transition-colors"
              >
                Reset Saved Data
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const GameMain: React.FC = () => {
  const { student, currentView } = useGame();

  if (!student || currentView === 'creation') {
    return <CharacterCreation />;
  }

  // Render Current App View / 3D World Viewport
  const renderViewport = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'academics':
        return <AcademicsPortal />;
      case 'accommodation':
        return <AccommodationPortal />;
      case 'settings':
        return <SettingsPage />;
      case 'room':
        return <StudentRoom />;
      case 'library':
        return <BuildingInterior type="library" />;
      case 'lbc':
        return <BuildingInterior type="lbc" />;
      case 'food_court':
        return <BuildingInterior type="food_court" />;
      case 'banking':
        return <BuildingInterior type="banking" />;
      case 'astroturf':
        return <BuildingInterior type="astroturf" />;
      case 'campus':
      default:
        return <Campus />;
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans text-slate-100 select-none">
      {/* Persistent HUD / Top Navigation */}
      <HUD />

      {/* Main Viewport Container */}
      <main className="w-full h-full">
        {renderViewport()}
      </main>

      {/* Floating Smartphone Device Overlay */}
      <PhoneOverlay />

      {/* Interactive NPC Dialogue Modal */}
      <DialogueModal />

      {/* Campus Activities, Lecture Quizzes & Sports Minigames */}
      <ActivitiesModal />

      {/* Campus Transit & Commute Cutscene */}
      <TransportModal />

      {/* 1-Minute Work Shift Countdown Overlay */}
      <WorkShiftOverlay />
    </div>
  );
};

export default function App() {
  return (
    <GameErrorBoundary>
      <GameProvider>
        <GameMain />
      </GameProvider>
    </GameErrorBoundary>
  );
}
