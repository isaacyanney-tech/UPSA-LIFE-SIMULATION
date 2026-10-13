import React, { FormEvent, useState } from 'react';
import { ArrowRight, BookOpen, MapPin, ShieldCheck, Sparkles, Users } from 'lucide-react';

interface Account {
  id: string;
  email: string;
}
interface PublicHomeProps {
  onAuthenticated: (account: Account) => void;
}

export const PublicHome: React.FC<PublicHomeProps> = ({ onAuthenticated }) => {
  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Unable to continue. Try again.');
      const saveResponse = await fetch('/api/save', { credentials: 'same-origin' });
      if (!saveResponse.ok) throw new Error('Your account connected, but its save could not be loaded. Reload and sign in again before playing.');
      if (saveResponse.ok) {
        const { save } = await saveResponse.json();
        if (save) {
          for (const [key, value] of Object.entries(save)) {
            if (typeof value === 'string') localStorage.setItem(key, value);
          }
        } else {
          const localSave: Record<string, string> = {};
          for (const key of SAVE_KEYS) {
            const value = localStorage.getItem(key);
            if (value !== null) localSave[key] = value;
          }
          await fetch('/api/save', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ save: localSave }),
          });
        }
      }
      onAuthenticated(result.user);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to connect. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#07111d] text-white">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
        <a href="/" className="flex items-center gap-3" aria-label="UPSA Life home">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-400 text-xl font-black text-slate-950">U</span>
          <span className="text-lg font-black tracking-tight">UPSA <span className="text-emerald-300">LIFE</span></span>
        </a>
        <a href="#account" className="rounded-xl border border-white/15 px-4 py-2 text-sm font-bold hover:bg-white/10">Sign in</a>
      </header>

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 pb-16 pt-8 lg:grid-cols-[1.1fr_.9fr] lg:px-10 lg:pb-24 lg:pt-12">
        <div className="max-w-2xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-300/10 px-4 py-2 text-xs font-bold text-emerald-200">
            <Sparkles size={15} /> YOUR CAMPUS. YOUR STORY.
          </div>
          <h1 className="text-5xl font-black leading-[1.04] tracking-tight sm:text-6xl lg:text-7xl">
            Make campus life <span className="text-emerald-300">your adventure.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
            Explore a playful UPSA campus, meet student characters, take on missions, attend activities and build your own student story.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a href="#account" className="inline-flex items-center gap-2 rounded-xl bg-emerald-300 px-5 py-3 font-extrabold text-slate-950 shadow-lg shadow-emerald-950/40 transition hover:bg-emerald-200">
              Start your journey <ArrowRight size={17} />
            </a>
            <span className="inline-flex items-center rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-slate-300">Free to play · Works offline</span>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {[
              { icon: MapPin, title: 'Explore', copy: 'Visit campus spaces and your hostel.' },
              { icon: Users, title: 'Meet people', copy: 'Build friendships with campus characters.' },
              { icon: BookOpen, title: 'Take on goals', copy: 'Study, play and complete missions.' },
            ].map(({ icon: Icon, title, copy }) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <Icon className="mb-3 text-emerald-300" size={20} />
                <h2 className="font-bold">{title}</h2>
                <p className="mt-1 text-xs leading-5 text-slate-400">{copy}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 flex items-start gap-2 text-xs leading-5 text-slate-500">
            <ShieldCheck className="mt-0.5 shrink-0 text-emerald-400" size={15} />
            Game characters and campus notices are fictional and are not official UPSA services.
          </p>
        </div>

        <section id="account" className="mx-auto w-full max-w-md scroll-mt-6 rounded-[2rem] border border-white/10 bg-[#101d2a] p-6 shadow-2xl shadow-black/30 sm:p-8">
          <div className="mb-6">
            <div className="text-xs font-bold uppercase tracking-[.2em] text-emerald-300">Welcome to campus</div>
            <h2 className="mt-2 text-2xl font-black">{mode === 'register' ? 'Create your account' : 'Welcome back'}</h2>
            <p className="mt-2 text-sm text-slate-400">Your progress is saved to your account.</p>
          </div>
          <div className="mb-5 grid grid-cols-2 rounded-xl bg-slate-950 p-1">
            <button type="button" onClick={() => { setMode('register'); setError(''); }} className={`rounded-lg py-2.5 text-sm font-bold ${mode === 'register' ? 'bg-emerald-300 text-slate-950' : 'text-slate-400'}`}>Create account</button>
            <button type="button" onClick={() => { setMode('login'); setError(''); }} className={`rounded-lg py-2.5 text-sm font-bold ${mode === 'login' ? 'bg-emerald-300 text-slate-950' : 'text-slate-400'}`}>Sign in</button>
          </div>
          <form onSubmit={submit} className="space-y-4">
            <label className="block text-sm font-semibold text-slate-200">
              Email address
              <input required autoComplete="email" type="email" maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-emerald-300" placeholder="you@example.com" />
            </label>
            <label className="block text-sm font-semibold text-slate-200">
              Password
              <input required autoComplete={mode === 'register' ? 'new-password' : 'current-password'} type="password" minLength={mode === 'register' ? 10 : 1} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-emerald-300" placeholder={mode === 'register' ? 'At least 10 characters' : 'Your password'} />
            </label>
            {error && <p role="alert" className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</p>}
            <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-300 px-4 py-3.5 font-extrabold text-slate-950 transition hover:bg-emerald-200 disabled:cursor-wait disabled:opacity-60">
              {busy ? 'Connecting…' : mode === 'register' ? 'Create account and play' : 'Sign in and continue'}
              {!busy && <ArrowRight size={17} />}
            </button>
          </form>
          <p className="mt-5 text-center text-xs leading-5 text-slate-500">Use an email you can access. Never reuse a password from another account.</p>
        </section>
      </section>
      <footer className="border-t border-white/10 px-6 py-5 text-center text-xs text-slate-500">UPSA Life · A student life simulation · Not affiliated with official UPSA services</footer>
    </main>
  );
};

const SAVE_KEYS = [
  'upsaLifeStudent', 'upsaLifeFriendships', 'upsaLifeMissionProgress', 'upsaLifeNeeds',
  'upsaLifeWallet', 'upsaLifeRoom', 'upsaLifeChats', 'upsaLifeTime',
  'upsaLifeCourses', 'upsaLifeInventory',
];
