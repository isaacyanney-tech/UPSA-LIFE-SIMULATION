import React, { Component, ErrorInfo, ReactNode } from 'react';
import { clearSavedGameData, useGame } from '../context/GameStateContext';
import { CharacterCreation } from './CharacterCreation';
import { Campus } from './Campus';
import { StudentRoom } from './StudentRoom';
import { BuildingInterior } from './BuildingInterior';
import { Dashboard } from './Dashboard';
import { AcademicsPortal } from './AcademicsPortal';
import { AccommodationPortal } from './AccommodationPortal';
import { SettingsPage } from './SettingsPage';
import { PhoneOverlay } from './PhoneOverlay';
import { HUD } from './HUD';
import { DialogueModal } from './DialogueModal';
import { ActivitiesModal } from './ActivitiesModal';
import { TransportModal } from './TransportModal';
import { WorkShiftOverlay } from './WorkShiftOverlay';

interface ErrorBoundaryProps { children: ReactNode }
interface ErrorBoundaryState { hasError: boolean }

class GameErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError(): ErrorBoundaryState { return { hasError: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('UPSA Life runtime error:', error, info); }
  handleReset = () => { clearSavedGameData(); window.location.reload(); };
  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 p-4 text-white">
        <div className="w-full max-w-md space-y-4 rounded-3xl border border-slate-800 bg-slate-900 p-6 text-center shadow-2xl">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-rose-500/20 text-2xl text-rose-400">🎓</div>
          <h2 className="text-xl font-bold">We hit a loading problem</h2>
          <p className="text-xs text-slate-300">Reload to try again. Your latest cloud save remains on your account.</p>
          <div className="flex gap-2">
            <button onClick={() => window.location.reload()} className="flex-1 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white">Reload</button>
            <button onClick={this.handleReset} className="rounded-xl bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-300">Reset local game</button>
          </div>
        </div>
      </div>
    );
  }
}

export const AuthenticatedGame: React.FC = () => {
  const { student, currentView } = useGame();
  if (!student || currentView === 'creation') return <CharacterCreation />;

  let viewport: React.ReactNode;
  switch (currentView) {
    case 'dashboard': viewport = <Dashboard />; break;
    case 'academics': viewport = <AcademicsPortal />; break;
    case 'accommodation': viewport = <AccommodationPortal />; break;
    case 'settings': viewport = <SettingsPage />; break;
    case 'room': viewport = <StudentRoom />; break;
    case 'library': viewport = <BuildingInterior type="library" />; break;
    case 'lbc': viewport = <BuildingInterior type="lbc" />; break;
    case 'food_court': viewport = <BuildingInterior type="food_court" />; break;
    case 'banking': viewport = <BuildingInterior type="banking" />; break;
    case 'astroturf': viewport = <BuildingInterior type="astroturf" />; break;
    case 'campus':
    default: viewport = <Campus />;
  }

  return (
    <GameErrorBoundary>
      <div className="relative h-screen w-screen select-none overflow-hidden bg-slate-950 font-sans text-slate-100">
        <HUD />
        <main className="h-full w-full">{viewport}</main>
        <PhoneOverlay />
        <DialogueModal />
        <ActivitiesModal />
        <TransportModal />
        <WorkShiftOverlay />
      </div>
    </GameErrorBoundary>
  );
};
