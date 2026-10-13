/**
 * UPSA Life - OSIS Academic Portal
 * Comprehensive academic management system for course registration,
 * timetables, attendance tracking, lecture study sessions, and GPA audit.
 */

import React, { useState } from 'react';
import { useGame } from '../context/GameStateContext';
import {
  GraduationCap,
  BookOpen,
  Calendar,
  Clock,
  Award,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Brain,
  RotateCcw,
} from 'lucide-react';
import { audioService } from '../services/AudioService';

export const AcademicsPortal: React.FC = () => {
  const {
    student,
    courses,
    attendClassOrStudy,
    setCurrentView,
    showToast,
    setPhoneActiveApp,
    setIsPhoneOpen,
  } = useGame();

  const [selectedCourseCode, setSelectedCourseCode] = useState<string>(courses?.[0]?.code || 'ACC 101');

  if (!student) return null;

  const safeGpa = typeof student.gpa === 'number' ? student.gpa : 3.75;
  const currentCourse = courses?.find((c) => c.code === selectedCourseCode) || courses?.[0];

  return (
    <div className="w-full h-full min-h-screen bg-slate-950 text-slate-100 overflow-y-auto pb-24 pt-20 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-blue-950 via-slate-900 to-cyan-950 border border-blue-500/30 p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-semibold">
              <GraduationCap className="w-4 h-4 text-blue-400" />
              <span>OSIS Student Information System · Semester 1</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white">
              Academic Course Portal & Timetable
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              {student.name} · {student.programme} · Index No: {student.indexNumber}
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 sm:p-5 flex items-center gap-5 shadow-xl shrink-0">
            <div>
              <div className="text-xs text-slate-400 font-semibold">Cumulative GPA</div>
              <div className="text-3xl font-black text-emerald-400 font-mono">
                {safeGpa.toFixed(2)}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Scale: 4.00</div>
            </div>
            <div className="h-10 w-px bg-slate-800" />
            <div>
              <div className="text-xs text-slate-400 font-semibold">Classification</div>
              <div className="text-sm font-bold text-white">First Class Honours</div>
              <div className="text-[11px] text-emerald-400 mt-0.5">Good Standing 🎓</div>
            </div>
          </div>
        </div>

        {/* 2-COLUMN LAYOUT: Course Table & Course Detail Study Station */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Courses List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-400">
                Registered Semester Courses ({courses?.length || 0})
              </h2>
              <span className="text-xs text-slate-400">Total Credits: 15</span>
            </div>

            <div className="space-y-3">
              {courses?.map((course) => {
                const isSelected = course.code === selectedCourseCode;
                return (
                  <div
                    key={course.code}
                    onClick={() => {
                      audioService.playClick();
                      setSelectedCourseCode(course.code);
                    }}
                    className={`p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-blue-950/40 border-blue-500 shadow-xl'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-sm text-blue-400">
                            {course.code}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                            {course.creditHours} Credits
                          </span>
                        </div>
                        <h3 className="font-bold text-base text-white mt-1">{course.name}</h3>
                        <div className="text-xs text-slate-400 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                          <span>Lecturer: {course.lecturer}</span>
                          <span>Venue: {course.venue}</span>
                          <span>
                            {course.day} · {course.time}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 sm:text-right shrink-0">
                        <div>
                          <div className="text-xs text-slate-400">Attendance</div>
                          <div className="text-sm font-bold font-mono text-emerald-400">
                            {course.attendance}%
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-400">Exam Grade</div>
                          <div className="text-sm font-bold font-mono text-blue-400">
                            {course.gradeScore}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Selected Course Study Hub & Actions */}
          <div className="space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-400">
              Study & Revision Hub
            </h2>

            {currentCourse ? (
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="font-mono text-xs text-blue-400 font-bold">
                      {currentCourse.code}
                    </span>
                    <h3 className="font-bold text-base text-white">{currentCourse.name}</h3>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Venue:</span>
                    <span className="font-semibold text-white">{currentCourse.venue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Lecturer:</span>
                    <span className="font-semibold text-white">{currentCourse.lecturer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Schedule:</span>
                    <span className="font-semibold text-white">
                      {currentCourse.day} {currentCourse.time}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => {
                      attendClassOrStudy(currentCourse.code, true);
                    }}
                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-colors"
                  >
                    <Brain className="w-4 h-4" />
                    <span>Intensive Library Study Session (+Score)</span>
                  </button>

                  <button
                    onClick={() => {
                      audioService.playClick();
                      setCurrentView('library');
                    }}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <span>Go to Central Library (3D)</span>
                  </button>

                  <button
                    onClick={() => {
                      audioService.playPhoneChime();
                      setPhoneActiveApp('ai_tutor');
                      setIsPhoneOpen(true);
                    }}
                    className="w-full py-2.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/40 text-purple-200 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <span>Ask Genius AI for Revision Notes</span>
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
