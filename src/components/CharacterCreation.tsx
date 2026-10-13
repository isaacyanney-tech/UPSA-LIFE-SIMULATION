/**
 * UPSA Life - Student Character Creation & Matriculation
 * Customization of Student Identity, Faculty Programme, Hostel Accommodation & 3D Avatar.
 */

import React, { useState } from 'react';
import { useGame } from '../context/GameStateContext';
import { StudentProfile, Gender, AvatarConfig } from '../types/game';
import { HOSTEL_OPTIONS } from '../data/gameData';
import {
  GraduationCap,
  User,
  Home,
  Palette,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { audioService } from '../services/AudioService';

export const CharacterCreation: React.FC = () => {
  const { setStudentProfile, showToast } = useGame();

  // Form states
  const [name, setName] = useState('Kofi Boateng');
  const [gender, setGender] = useState<Gender>('male');
  const [programme, setProgramme] = useState('BSc Accounting');
  const [faculty, setFaculty] = useState('Faculty of Accounting and Finance');
  const [level, setLevel] = useState(100);
  const [selectedHostel, setSelectedHostel] = useState(HOSTEL_OPTIONS[0].name);
  const [roomType, setRoomType] = useState<'single' | 'double' | 'triple' | 'quad'>('double');

  // Avatar customization
  const [skinTone, setSkinTone] = useState('#78350f');
  const [shirtColor, setShirtColor] = useState('#1d4ed8');
  const [pantsColor, setPantsColor] = useState('#1e293b');
  const [shoesColor, setShoesColor] = useState('#0f172a');

  const programmes = [
    {
      name: 'BSc Accounting',
      faculty: 'Faculty of Accounting and Finance',
      desc: 'Financial reporting, auditing, management accounting & taxation.',
    },
    {
      name: 'BSc Information Technology',
      faculty: 'Faculty of IT and Communication Studies',
      desc: 'Full-stack software engineering, network systems & cloud architectures.',
    },
    {
      name: 'BSc Business Administration',
      faculty: 'Faculty of Management Studies',
      desc: 'Strategic leadership, enterprise growth & supply chain management.',
    },
    {
      name: 'BSc Marketing',
      faculty: 'Faculty of Management Studies',
      desc: 'Brand positioning, digital consumer insights & marketing campaigns.',
    },
    {
      name: 'Bachelor of Laws (LLB)',
      faculty: 'Faculty of Law',
      desc: 'Constitutional law, commercial jurisprudence & legal research.',
    },
    {
      name: 'BSc Banking and Finance',
      faculty: 'Faculty of Accounting and Finance',
      desc: 'Investment banking, capital markets, risk appraisal & fintech.',
    },
  ];

  const skinTones = [
    { label: 'Deep Rich', color: '#451a03' },
    { label: 'Warm Cocoa', color: '#78350f' },
    { label: 'Caramel Bronze', color: '#9a3412' },
    { label: 'Golden Tan', color: '#b45309' },
    { label: 'Honey Almond', color: '#d97706' },
  ];

  const shirtColors = [
    { label: 'UPSA Royal Blue', color: '#1d4ed8' },
    { label: 'Forest Green', color: '#15803d' },
    { label: 'Burgundy Crimson', color: '#991b1b' },
    { label: 'Warm Mustard', color: '#ca8a04' },
    { label: 'Oxford Charcoal', color: '#334155' },
    { label: 'Crisp White', color: '#f8fafc' },
  ];

  const pantsColors = [
    { label: 'Dark Navy', color: '#1e293b' },
    { label: 'Khaki Tan', color: '#78716c' },
    { label: 'Jet Black', color: '#09090b' },
    { label: 'Indigo Denim', color: '#1e3a8a' },
  ];

  const currentHostelObj =
    HOSTEL_OPTIONS.find((h) => h.name === selectedHostel) || HOSTEL_OPTIONS[0];

  const getPriceForRoom = () => {
    switch (roomType) {
      case 'single':
        return currentHostelObj.singlePrice;
      case 'double':
        return currentHostelObj.doublePrice;
      case 'triple':
        return currentHostelObj.triplePrice;
      case 'quad':
        return currentHostelObj.quadPrice;
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('⚠️ Please enter your student name');
      return;
    }

    const newIndexNumber = String(10290000 + Math.floor(Math.random() * 9999));
    const randomRoomNum = `${selectedHostel.charAt(0)}-${Math.floor(101 + Math.random() * 250)}`;

    const newProfile: StudentProfile = {
      id: `std-${Date.now()}`,
      name: name.trim(),
      gender,
      programme,
      faculty,
      level,
      indexNumber: newIndexNumber,
      hostelName: selectedHostel,
      roomType,
      roomNumber: randomRoomNum,
      avatarConfig: {
        skinTone,
        hairStyle: 'neat-cut',
        hairColor: '#09090b',
        shirtColor,
        pantsColor,
        shoesColor,
      },
      gpa: 3.75, // Starting semester baseline
      academicCredits: 15,
      semester: 1,
      academicYear: '2025/2026',
      createdAt: Date.now(),
    };

    audioService.playSuccess();
    setStudentProfile(newProfile);
    showToast(`🎓 Matriculation Complete! Welcome to UPSA, ${name}!`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6">
      {/* Container Card */}
      <div className="w-full max-w-4xl bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 backdrop-blur-xl">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-600/40 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <GraduationCap className="w-4 h-4 text-blue-400" />
            <span>University of Professional Studies, Accra</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            UPSA LIFE — STUDENT REGISTRATION
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto mt-2">
            Create your student identity, choose your academic programme, book your hostel room, and
            customize your 3D avatar to begin your university journey.
          </p>
        </div>

        <form onSubmit={handleCreate} className="space-y-8">
          {/* Section 1: Personal & Degree Identity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-blue-400 flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>1. Personal & Academic Details</span>
              </h2>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Full Student Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Kofi Boateng"
                  required
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as Gender)}
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Level / Year</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(Number(e.target.value))}
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value={100}>Level 100 (Freshman)</option>
                    <option value={200}>Level 200 (Sophomore)</option>
                    <option value={300}>Level 300 (Junior)</option>
                    <option value={400}>Level 400 (Final Year)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Degree Programme
                </label>
                <select
                  value={programme}
                  onChange={(e) => {
                    setProgramme(e.target.value);
                    const sel = programmes.find((p) => p.name === e.target.value);
                    if (sel) setFaculty(sel.faculty);
                  }}
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  {programmes.map((p) => (
                    <option key={p.name} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  {programmes.find((p) => p.name === programme)?.desc}
                </p>
              </div>
            </div>

            {/* Section 2: Hostel Accommodation Selection */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <Home className="w-4 h-4" />
                <span>2. Hostel Accommodation</span>
              </h2>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Select Hostel
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {HOSTEL_OPTIONS.map((hostel) => (
                    <button
                      type="button"
                      key={hostel.id}
                      onClick={() => setSelectedHostel(hostel.name)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        selectedHostel === hostel.name
                          ? 'bg-emerald-950/50 border-emerald-500 text-white'
                          : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="font-bold text-xs truncate">{hostel.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{hostel.tagline}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Room Occupancy Type
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'single', label: '1-in-Room' },
                    { id: 'double', label: '2-in-Room' },
                    { id: 'triple', label: '3-in-Room' },
                    { id: 'quad', label: '4-in-Room' },
                  ].map((r) => (
                    <button
                      type="button"
                      key={r.id}
                      onClick={() => setRoomType(r.id as any)}
                      className={`py-2 px-1 rounded-xl border text-xs font-semibold transition-all ${
                        roomType === r.id
                          ? 'bg-blue-600 border-blue-400 text-white shadow-md'
                          : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pricing & Disclaimer Box */}
              <div className="p-3 bg-slate-800/70 border border-slate-700 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">Semester Rate (Example):</span>
                  <span className="font-mono font-bold text-emerald-400">
                    GH₵ {getPriceForRoom().toLocaleString()} / sem
                  </span>
                </div>
                <div className="flex items-start gap-1.5 text-[10px] text-slate-400 leading-tight">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    Note: Representative example price for student simulation. Actual verified UPSA
                    rates vary per academic year.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Avatar Appearance Customization */}
          <div className="p-5 bg-slate-800/50 border border-slate-800 rounded-2xl space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2">
              <Palette className="w-4 h-4" />
              <span>3. Avatar Style & Visuals</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Skin Tone */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">
                  Skin Tone
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {skinTones.map((st) => (
                    <button
                      type="button"
                      key={st.color}
                      onClick={() => setSkinTone(st.color)}
                      className={`w-8 h-8 rounded-full border-2 transition-transform ${
                        skinTone === st.color
                          ? 'scale-110 border-white ring-2 ring-purple-500'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: st.color }}
                      title={st.label}
                    />
                  ))}
                </div>
              </div>

              {/* Shirt Color */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">
                  Outfit Top
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {shirtColors.map((sc) => (
                    <button
                      type="button"
                      key={sc.color}
                      onClick={() => setShirtColor(sc.color)}
                      className={`w-8 h-8 rounded-xl border-2 transition-transform ${
                        shirtColor === sc.color
                          ? 'scale-110 border-white ring-2 ring-purple-500'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: sc.color }}
                      title={sc.label}
                    />
                  ))}
                </div>
              </div>

              {/* Pants Color */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">
                  Outfit Bottom
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {pantsColors.map((pc) => (
                    <button
                      type="button"
                      key={pc.color}
                      onClick={() => setPantsColor(pc.color)}
                      className={`w-8 h-8 rounded-xl border-2 transition-transform ${
                        pantsColor === pc.color
                          ? 'scale-110 border-white ring-2 ring-purple-500'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: pc.color }}
                      title={pc.label}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-black text-base rounded-2xl shadow-xl shadow-blue-600/25 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99]"
          >
            <Sparkles className="w-5 h-5 text-amber-300" />
            <span>Matriculate & Enter UPSA Campus</span>
          </button>
        </form>
      </div>
    </div>
  );
};
