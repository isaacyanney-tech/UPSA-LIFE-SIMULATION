/**
 * UPSA Life - Accommodation & Hostel Portal
 * Features realistic UPSA student hostels (Access Hostel, Mandela Block, Yaa Asantewaa),
 * room selection (1 to 4 in a room), roommate compatibility, and rent checkout.
 */

import React, { useState } from 'react';
import { useGame } from '../context/GameStateContext';
import {
  Building,
  Home,
  Users,
  CheckCircle2,
  DollarSign,
  Shield,
  Wifi,
  Sparkles,
  ArrowRight,
  Coffee,
  Zap,
} from 'lucide-react';
import { audioService } from '../services/AudioService';

interface HostelOption {
  id: string;
  name: string;
  tagline: string;
  type: string;
  occupancyOptions: Array<{
    type: '1 in a room' | '2 in a room' | '3 in a room' | '4 in a room';
    pricePerSem: number;
    description: string;
  }>;
  amenities: string[];
  color: string;
  location: string;
}

export const AccommodationPortal: React.FC = () => {
  const {
    student,
    walletBalance,
    modifyMoney,
    setStudentProfile,
    setCurrentView,
    showToast,
  } = useGame();

  const HOSTELS: HostelOption[] = [
    {
      id: 'access',
      name: 'Access Hostel (Main Campus)',
      tagline: 'Modern self-contained apartments overlooking Central Library',
      type: 'Co-ed / Premium',
      occupancyOptions: [
        { type: '1 in a room', pricePerSem: 3200, description: 'Executive private suite with en-suite bath and study balcony' },
        { type: '2 in a room', pricePerSem: 1950, description: 'Spacious dual-bed room with shared desk and wardrobe' },
        { type: '3 in a room', pricePerSem: 1450, description: 'Triple setup with designated study zones and bookshelf' },
        { type: '4 in a room', pricePerSem: 1100, description: 'Quad roommate unit with high social morale and budget savings' },
      ],
      amenities: ['24/7 Campus Wi-Fi', 'En-suite Washrooms', 'Generator Power Backup', 'Study Common Rooms', 'Close to LBC'],
      color: '#3b82f6',
      location: 'East Wing Campus Quad',
    },
    {
      id: 'mandela',
      name: 'Nelson Mandela Hall',
      tagline: 'Vibrant student community living adjacent to the AstroTurf sports pitch',
      type: 'Co-ed / Traditional',
      occupancyOptions: [
        { type: '1 in a room', pricePerSem: 2800, description: 'Private single room with scenic pitch views' },
        { type: '2 in a room', pricePerSem: 1700, description: 'Twin beds with high-speed internet and security locker' },
        { type: '3 in a room', pricePerSem: 1300, description: 'Three student capacity with shared kitchenette' },
        { type: '4 in a room', pricePerSem: 950, description: 'Traditional 4-in-a-room student living at great rates' },
      ],
      amenities: ['Sports Pitch Access', 'Cafeteria Onsite', 'Laundry Pavilion', 'Night Study Hall'],
      color: '#10b981',
      location: 'South Campus Avenue',
    },
    {
      id: 'asantewaa',
      name: 'Yaa Asantewaa Block',
      tagline: 'Quiet, secure academic residential block with landscaped gardens',
      type: 'Residential Wing',
      occupancyOptions: [
        { type: '1 in a room', pricePerSem: 3000, description: 'Serene single room ideal for serious research' },
        { type: '2 in a room', pricePerSem: 1850, description: 'Standard double room with built-in closets' },
        { type: '4 in a room', pricePerSem: 1050, description: 'Cozy quad arrangement with study carrels' },
      ],
      amenities: ['CCTV Security', 'Solar Water Heating', 'Reading Garden', 'Pharmacy & Mini Mart'],
      color: '#8b5cf6',
      location: 'North Residential Enclave',
    },
  ];

  const [selectedHostelId, setSelectedHostelId] = useState<string>('access');
  const selectedHostel = HOSTELS.find((h) => h.id === selectedHostelId) || HOSTELS[0];
  const [selectedRoomType, setSelectedRoomType] = useState<'1 in a room' | '2 in a room' | '3 in a room' | '4 in a room'>(
    student?.roomType === 'single'
      ? '1 in a room'
      : student?.roomType === 'triple'
      ? '3 in a room'
      : student?.roomType === 'quad'
      ? '4 in a room'
      : '2 in a room'
  );

  if (!student) return null;

  const currentOption = selectedHostel.occupancyOptions.find((o) => o.type === selectedRoomType) || selectedHostel.occupancyOptions[0];

  const handleBookRoom = () => {
    const targetRoomType: 'single' | 'double' | 'triple' | 'quad' =
      selectedRoomType === '1 in a room'
        ? 'single'
        : selectedRoomType === '3 in a room'
        ? 'triple'
        : selectedRoomType === '4 in a room'
        ? 'quad'
        : 'double';

    if (student.hostelName === selectedHostel.name && student.roomType === targetRoomType) {
      showToast('ℹ️ You are already residing in this room configuration!');
      return;
    }

    const price = currentOption.pricePerSem;
    if (walletBalance < price) {
      showToast(`❌ Insufficient funds in CampusPay wallet! Need GH₵ ${price}`);
      return;
    }

    const paid = modifyMoney(-price, `Hostel Fee: ${selectedHostel.name} (${selectedRoomType})`, 'accommodation');
    if (paid) {
      const newRoomNum = `${selectedHostel.name.charAt(0)}-${Math.floor(101 + Math.random() * 250)}`;
      setStudentProfile({
        ...student,
        hostelName: selectedHostel.name,
        roomType: targetRoomType,
        roomNumber: newRoomNum,
      });
      audioService.playSuccess();
      showToast(`🎉 Accommodation Reserved! Moved into ${selectedHostel.name} Room ${newRoomNum}!`);
    }
  };

  return (
    <div className="w-full h-full min-h-screen bg-slate-950 text-slate-100 overflow-y-auto pb-24 pt-20 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="rounded-3xl bg-gradient-to-r from-amber-950 via-slate-900 to-indigo-950 border border-amber-500/30 p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold">
              <Building className="w-4 h-4 text-amber-400" />
              <span>UPSA Hostel Services & Housing Allocation</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white">
              Accommodation & Hostels Portal
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Current Residence: <span className="font-bold text-white">{student.hostelName}</span> · Room {student.roomNumber} ({student.roomType})
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                audioService.playClick();
                setCurrentView('room');
              }}
              className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Go to My 3D Room</span>
            </button>
          </div>
        </div>

        {/* HOSTEL CARDS (3 OPTIONS) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {HOSTELS.map((hostel) => {
            const isSelected = hostel.id === selectedHostelId;
            return (
              <div
                key={hostel.id}
                onClick={() => {
                  audioService.playClick();
                  setSelectedHostelId(hostel.id);
                }}
                className={`p-5 rounded-3xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-slate-900 border-amber-500 shadow-2xl ring-2 ring-amber-500/30'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-amber-400 font-mono">
                    {hostel.type}
                  </span>
                  {student.hostelName.includes(hostel.name.split(' ')[0]) && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                      Current Home
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-lg text-white">{hostel.name}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{hostel.tagline}</p>
                <div className="text-[11px] text-slate-500 mt-2">📍 {hostel.location}</div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">From</span>
                  <span className="font-bold text-amber-400 font-mono">
                    GH₵ {hostel.occupancyOptions[hostel.occupancyOptions.length - 1].pricePerSem} / sem
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* SELECTED HOSTEL CONFIGURATION & ROOM BOOKING */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">
                Select Room Occupancy for {selectedHostel.name}
              </span>
              <h2 className="text-xl font-bold text-white mt-1">
                Room Layout & Semester Rent
              </h2>
            </div>
            <div className="text-xs text-slate-400">
              Note: Sample prices shown for university simulation gameplay.
            </div>
          </div>

          {/* Occupancy Choices Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {selectedHostel.occupancyOptions.map((opt) => {
              const isPicked = opt.type === selectedRoomType;
              return (
                <div
                  key={opt.type}
                  onClick={() => {
                    audioService.playClick();
                    setSelectedRoomType(opt.type);
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                    isPicked
                      ? 'bg-amber-950/30 border-amber-500 shadow-xl ring-2 ring-amber-500/40'
                      : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-white capitalize">{opt.type}</span>
                      {isPicked && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                    </div>
                    <div className="text-xl font-black text-amber-400 font-mono mb-2">
                      GH₵ {opt.pricePerSem}
                      <span className="text-xs text-slate-400 font-normal"> / sem</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{opt.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Amenities & Booking Button */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pt-4 border-t border-slate-800">
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Included Hall Amenities
              </span>
              <div className="flex flex-wrap gap-2">
                {selectedHostel.amenities.map((am, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium"
                  >
                    ✓ {am}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <div className="text-right">
                <div className="text-xs text-slate-400">Total Semester Fee</div>
                <div className="text-2xl font-black text-amber-400 font-mono">
                  GH₵ {currentOption.pricePerSem}
                </div>
              </div>
              <button
                onClick={handleBookRoom}
                className="px-6 py-3.5 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl font-bold text-sm shadow-xl shadow-amber-600/30 active:scale-95 transition-all"
              >
                Pay & Allocate Room
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
