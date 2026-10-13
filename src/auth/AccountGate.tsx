import React, { useEffect, useRef, useState } from 'react';
import { GameProvider, useGame } from '../context/GameStateContext';
import { AuthenticatedGame } from '../components/GameScreen';
import { PublicHome } from '../components/PublicHome';

interface Account {
  id: string;
  email: string;
}

const SAVE_KEYS = [
  'upsaLifeStudent', 'upsaLifeFriendships', 'upsaLifeMissionProgress', 'upsaLifeNeeds',
  'upsaLifeWallet', 'upsaLifeRoom', 'upsaLifeChats', 'upsaLifeTime',
  'upsaLifeCourses', 'upsaLifeInventory',
];

function localSave(): Record<string, string> {
  return Object.fromEntries(SAVE_KEYS.flatMap((key) => {
    const value = localStorage.getItem(key);
    return value === null ? [] : [[key, value]];
  }));
}

async function restoreRemoteSave() {
  const response = await fetch('/api/save', { credentials: 'same-origin' });
  if (!response.ok) return;
  const { save } = await response.json();
  if (save && typeof save === 'object' && !Array.isArray(save)) {
    for (const [key, value] of Object.entries(save)) {
      if (SAVE_KEYS.includes(key) && typeof value === 'string') localStorage.setItem(key, value);
    }
  }
}

function CloudSaveSync() {
  const { student, needs, walletBalance, transactions, roomCustomization, friendships, chats, missions, courses, inventory, gameTime } = useGame();
  const lastSent = useRef('');
  const busy = useRef(false);

  useEffect(() => {
    let active = true;
    const sync = async () => {
      if (!active || busy.current) return;
      const snapshot = localSave();
      const serialized = JSON.stringify(snapshot);
      if (serialized === lastSent.current) return;
      busy.current = true;
      try {
        const response = await fetch('/api/save', {
          method: 'PUT',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ save: snapshot }),
        });
        if (response.ok) lastSent.current = serialized;
        else if (response.status === 401) window.location.reload();
      } catch {
        // Local storage remains available during brief network interruptions.
      } finally {
        busy.current = false;
      }
    };
    void sync();
    const timer = window.setInterval(() => void sync(), 2500);
    return () => { active = false; window.clearInterval(timer); };
  }, [student, needs, walletBalance, transactions, roomCustomization, friendships, chats, missions, courses, inventory, gameTime]);

  return null;
}

function AccountToolbar({ account, onLogout }: { account: Account; onLogout: () => void }) {
  const [busy, setBusy] = useState(false);
  const logout = async () => {
    setBusy(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
    } finally {
      onLogout();
    }
  };
  return (
    <div className="fixed right-4 top-4 z-[60] flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/85 p-1.5 pl-3 shadow-xl backdrop-blur">
      <span className="max-w-[38vw] truncate text-[11px] font-semibold text-slate-300 sm:max-w-none">{account.email}</span>
      <button disabled={busy} onClick={logout} className="rounded-full bg-white/10 px-3 py-2 text-[11px] font-bold text-white hover:bg-white/20 disabled:opacity-60">Sign out</button>
    </div>
  );
}

export function AccountGate() {
  const [account, setAccount] = useState<Account | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;
    fetch('/api/auth/me', { credentials: 'same-origin' })
      .then(async (response) => {
        if (!response.ok) return null;
        const result = await response.json();
        await restoreRemoteSave();
        return result.user as Account;
      })
      .then((user) => { if (active) setAccount(user); })
      .catch(() => { if (active) setAccount(null); })
      .finally(() => { if (active) setChecking(false); });
    return () => { active = false; };
  }, []);

  const logout = () => {
    setAccount(null);
  };

  if (checking) {
    return <div className="grid min-h-screen place-items-center bg-[#07111d] text-emerald-200"><div className="animate-pulse text-sm font-bold tracking-wide">Opening UPSA Life…</div></div>;
  }
  if (!account) return <PublicHome onAuthenticated={async (user) => { await restoreRemoteSave(); setAccount(user); }} />;

  return (
    <GameProvider>
      <CloudSaveSync />
      <AccountToolbar account={account} onLogout={logout} />
      <AuthenticatedGame />
    </GameProvider>
  );
}

