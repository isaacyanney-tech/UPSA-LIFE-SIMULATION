/**
 * UPSA Life - Campus Interactive Activities & Mini-Games
 * Includes LBC Lectures with Pop Quizzes, AstroTurf Penalty Shootout,
 * Central Library Research, Food Court Dining, and Banking Square Campus Jobs.
 */

import React, { useState } from 'react';
import { useGame } from '../context/GameStateContext';
import { FOOD_MENU, CAMPUS_LOCATIONS, LIBRARY_CHALLENGE_QUESTIONS } from '../data/gameData';
import {
  GraduationCap,
  BookOpen,
  Utensils,
  Activity,
  CreditCard,
  Building,
  CheckCircle2,
  XCircle,
  Trophy,
  Sparkles,
  X,
  Target,
} from 'lucide-react';
import { audioService } from '../services/AudioService';

export const ActivitiesModal: React.FC = () => {
  const {
    activeActivity,
    setActiveActivity,
    student,
    courses,
    attendClassOrStudy,
    buyFoodItem,
    modifyMoney,
    updateNeeds,
    needs,
    passTime,
    completeMissionStep,
    missionProgress,
    showToast,
    startWorkShift,
    completeLibraryChallenge,
  } = useGame();

  // Quiz State for LBC Lecture
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // Library Research Challenge State
  const [libraryQuestionIndex, setLibraryQuestionIndex] = useState(0);
  const [libraryScore, setLibraryScore] = useState(0);
  const [isLibraryChallengeFinished, setIsLibraryChallengeFinished] = useState(false);

  // AstroTurf Penalty Shootout State
  const [penaltyScore, setPenaltyScore] = useState(0);
  const [penaltyAttempts, setPenaltyAttempts] = useState(0);
  const [lastShotResult, setLastShotResult] = useState<'goal' | 'saved' | null>(null);

  if (!activeActivity) return null;

  const closeActivity = () => {
    audioService.playClick();
    setActiveActivity(null);
    setSelectedQuizAnswer(null);
    setIsAnswerSubmitted(false);
    setPenaltyAttempts(0);
    setPenaltyScore(0);
    setLastShotResult(null);
    setLibraryQuestionIndex(0);
    setLibraryScore(0);
    setIsLibraryChallengeFinished(false);
  };

  // Sample Quiz Question for Lecture Block Complex
  const quizQuestions = [
    {
      question: 'In double-entry bookkeeping, which fundamental accounting equation must always balance?',
      options: [
        'Assets = Liabilities + Owner\'s Equity',
        'Net Profit = Revenue - Expenses / 2',
        'Assets = Capital - Gross Margin',
        'Liabilities = Cash + Inventory',
      ],
      correctIndex: 0,
      courseCode: 'ACC 101',
    },
    {
      question: 'Which of the following represents the primary goal of Marketing Management?',
      options: [
        'Maximizing factory output regardless of demand',
        'Creating, communicating, and delivering superior customer value',
        'Eliminating customer feedback surveys',
        'Minimizing advertising expenditure to zero',
      ],
      correctIndex: 1,
      courseCode: 'MKT 103',
    },
    {
      question: 'In software development, what data structure operates on a First-In, First-Out (FIFO) basis?',
      options: ['Stack', 'Queue', 'Binary Search Tree', 'Hash Map'],
      correctIndex: 1,
      courseCode: 'ITEC 105',
    },
  ];

  const currentQuiz = quizQuestions[0];

  const handleShootPenalty = (corner: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center') => {
    audioService.playClick();
    const keeperDive = ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center'][
      Math.floor(Math.random() * 5)
    ];

    const isGoal = corner !== keeperDive;
    const nextAttempts = penaltyAttempts + 1;
    const nextScore = isGoal ? penaltyScore + 1 : penaltyScore;

    setPenaltyAttempts(nextAttempts);
    setPenaltyScore(nextScore);
    setLastShotResult(isGoal ? 'goal' : 'saved');

    if (isGoal) {
      audioService.playSuccess();
    }

    if (nextAttempts >= 3) {
      // Completed mini-game
      passTime(45);
      updateNeeds({
        energy: Math.max(10, needs.energy - 15),
        happiness: Math.min(100, needs.happiness + 25),
      });

      if (nextScore >= 2 && !missionProgress['m5_astroturf_match']?.completed) {
        completeMissionStep('m5_astroturf_match');
      }

      showToast(`⚽ Penalty Shootout Finished! You scored ${nextScore}/3 goals!`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-xl w-full shadow-2xl relative text-white max-h-[90vh] overflow-y-auto">
        {/* Close Modal Button */}
        <button
          onClick={closeActivity}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 1. LECTURE & POP QUIZ (LBC) */}
        {activeActivity === 'lbc_lecture' && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Lecture Block Complex (LBC 3)</h3>
                <p className="text-xs text-slate-400">
                  Attend class lecture and answer the lecturer’s pop quiz
                </p>
              </div>
            </div>

            <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 mb-5">
              <div className="flex items-center justify-between text-xs text-blue-400 font-mono mb-2">
                <span>COURSE: {currentQuiz.courseCode}</span>
                <span>LECTURER: Dr. Boateng</span>
              </div>
              <div className="text-sm font-semibold text-slate-100 mb-4">
                "{currentQuiz.question}"
              </div>

              <div className="space-y-2">
                {currentQuiz.options.map((opt, i) => {
                  const isSelected = selectedQuizAnswer === i;
                  let btnStyle = 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200';
                  if (isAnswerSubmitted) {
                    if (i === currentQuiz.correctIndex) {
                      btnStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-200';
                    } else if (isSelected) {
                      btnStyle = 'bg-rose-950/60 border-rose-500 text-rose-200';
                    }
                  } else if (isSelected) {
                    btnStyle = 'bg-blue-900/60 border-blue-500 text-white';
                  }

                  return (
                    <button
                      key={i}
                      disabled={isAnswerSubmitted}
                      onClick={() => setSelectedQuizAnswer(i)}
                      className={`w-full text-left p-3 rounded-xl border text-xs font-medium transition-all ${btnStyle}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            {!isAnswerSubmitted ? (
              <button
                disabled={selectedQuizAnswer === null}
                onClick={() => {
                  if (selectedQuizAnswer === null) return;
                  setIsAnswerSubmitted(true);
                  const isRight = selectedQuizAnswer === currentQuiz.correctIndex;
                  if (isRight) {
                    audioService.playSuccess();
                    attendClassOrStudy(currentQuiz.courseCode);
                    modifyMoney(60, 'Academic Quiz Excellence Bonus', 'stipend');
                  } else {
                    attendClassOrStudy(currentQuiz.courseCode);
                  }
                }}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-colors shadow-lg shadow-blue-500/25"
              >
                Submit Answer & Complete Lecture
              </button>
            ) : (
              <div className="space-y-3">
                <div
                  className={`p-3 rounded-xl text-center font-bold text-sm ${
                    selectedQuizAnswer === currentQuiz.correctIndex
                      ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-500/40'
                      : 'text-amber-400 bg-amber-950/40 border border-amber-500/40'
                  }`}
                >
                  {selectedQuizAnswer === currentQuiz.correctIndex
                    ? '🎉 Correct! Excellent academic grasp. Lecture attendance & score boosted!'
                    : 'Good attempt! You still earned lecture attendance points. Keep revising!'}
                </div>
                <button
                  onClick={closeActivity}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-sm transition-colors"
                >
                  Return to Campus
                </button>
              </div>
            )}
          </div>
        )}

        {/* 2. CENTRAL LIBRARY STUDY SESSION & ACADEMIC CHALLENGE */}
        {activeActivity === 'library_study' && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">UPSA Central Library Research Complex</h3>
                <p className="text-xs text-slate-400">Engage in academic mini-games to boost your cumulative GPA</p>
              </div>
            </div>

            {/* Mode selection or active challenge */}
            <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 mb-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Academic Trivia & Research Quiz
                </span>
                <span className="text-xs font-mono text-slate-300">
                  Question {libraryQuestionIndex + 1} of 5
                </span>
              </div>

              {!isLibraryChallengeFinished ? (
                <div>
                  <div className="text-xs text-blue-400 font-mono mb-1">
                    SUBJECT: {LIBRARY_CHALLENGE_QUESTIONS[libraryQuestionIndex].subject}
                  </div>
                  <div className="text-sm font-semibold text-white mb-3 leading-relaxed">
                    "{LIBRARY_CHALLENGE_QUESTIONS[libraryQuestionIndex].question}"
                  </div>

                  <div className="space-y-2">
                    {LIBRARY_CHALLENGE_QUESTIONS[libraryQuestionIndex].options.map((opt, optIdx) => (
                      <button
                        key={optIdx}
                        onClick={() => {
                          audioService.playClick();
                          const isCorrect = optIdx === LIBRARY_CHALLENGE_QUESTIONS[libraryQuestionIndex].correctIndex;
                          const nextScore = isCorrect ? libraryScore + 1 : libraryScore;
                          setLibraryScore(nextScore);

                          if (libraryQuestionIndex + 1 < LIBRARY_CHALLENGE_QUESTIONS.length) {
                            setLibraryQuestionIndex(libraryQuestionIndex + 1);
                          } else {
                            setIsLibraryChallengeFinished(true);
                            completeLibraryChallenge(nextScore, LIBRARY_CHALLENGE_QUESTIONS.length);
                          }
                        }}
                        className="w-full text-left p-3 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-emerald-500/70 text-xs font-medium text-slate-200 transition-colors"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 space-y-2">
                  <Trophy className="w-12 h-12 text-amber-400 mx-auto" />
                  <h4 className="text-lg font-bold text-white">Challenge Completed!</h4>
                  <p className="text-xs text-slate-300">
                    You scored <strong className="text-emerald-400 font-mono text-sm">{libraryScore} / 5</strong>! Your continuous assessment knowledge and cumulative GPA have received an official boost!
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2 mb-4">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Or Focus Directly on Specific Coursework:
              </div>
              {courses.map((c) => (
                <button
                  key={c.code}
                  onClick={() => {
                    attendClassOrStudy(c.code, true);
                    closeActivity();
                  }}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/70 hover:border-emerald-500/60 flex items-center justify-between text-xs transition-colors"
                >
                  <div>
                    <div className="font-semibold text-white">{c.code} — {c.name}</div>
                    <div className="text-[10px] text-slate-400">Score: {c.gradeScore}%</div>
                  </div>
                  <span className="text-emerald-400 font-semibold text-[11px]">Revise Notes ➔</span>
                </button>
              ))}
            </div>

            <button
              onClick={closeActivity}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl text-xs transition-colors"
            >
              Leave Library
            </button>
          </div>
        )}

        {/* 3. ASTROTURF PENALTY SHOOTOUT */}
        {activeActivity === 'astroturf_shootout' && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">UPSA AstroTurf Penalty Challenge</h3>
                <p className="text-xs text-slate-400">
                  Pick your corner and score against the varsity goalkeeper! (3 attempts)
                </p>
              </div>
            </div>

            {/* Scoreboard */}
            <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 mb-5 flex items-center justify-around text-center">
              <div>
                <div className="text-xs text-slate-400">Goals Scored</div>
                <div className="text-2xl font-black text-emerald-400 font-mono">
                  {penaltyScore}
                </div>
              </div>
              <div className="h-8 w-px bg-slate-700" />
              <div>
                <div className="text-xs text-slate-400">Attempts Taken</div>
                <div className="text-2xl font-black text-white font-mono">
                  {penaltyAttempts} / 3
                </div>
              </div>
            </div>

            {/* Goal Post Interactive Target Area */}
            {penaltyAttempts < 3 ? (
              <div className="mb-5">
                <div className="text-xs font-semibold text-slate-300 mb-2 text-center">
                  Select your shooting angle:
                </div>
                <div className="grid grid-cols-2 gap-2.5 max-w-sm mx-auto">
                  <button
                    onClick={() => handleShootPenalty('top-left')}
                    className="p-4 rounded-xl bg-slate-800 hover:bg-emerald-600 text-white font-bold text-xs border border-slate-700 transition-colors shadow-md"
                  >
                    Top-Left Corner
                  </button>
                  <button
                    onClick={() => handleShootPenalty('top-right')}
                    className="p-4 rounded-xl bg-slate-800 hover:bg-emerald-600 text-white font-bold text-xs border border-slate-700 transition-colors shadow-md"
                  >
                    Top-Right Corner
                  </button>
                  <button
                    onClick={() => handleShootPenalty('bottom-left')}
                    className="p-4 rounded-xl bg-slate-800 hover:bg-emerald-600 text-white font-bold text-xs border border-slate-700 transition-colors shadow-md"
                  >
                    Bottom-Left Low
                  </button>
                  <button
                    onClick={() => handleShootPenalty('bottom-right')}
                    className="p-4 rounded-xl bg-slate-800 hover:bg-emerald-600 text-white font-bold text-xs border border-slate-700 transition-colors shadow-md"
                  >
                    Bottom-Right Low
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 mb-4 space-y-2">
                <Trophy className="w-12 h-12 text-amber-400 mx-auto" />
                <h4 className="text-lg font-bold text-white">Challenge Completed!</h4>
                <p className="text-xs text-slate-300">
                  {penaltyScore >= 2
                    ? '🔥 Sensational penalty taking! The team is impressed with your shooting!'
                    : 'Good workout on the turf! Practice makes perfect.'}
                </p>
              </div>
            )}

            <button
              onClick={closeActivity}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-sm transition-colors"
            >
              Leave Sports Complex
            </button>
          </div>
        )}

        {/* 4. FOOD COURT DINING */}
        {activeActivity === 'food_court' && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-600/20 text-orange-400 flex items-center justify-center">
                <Utensils className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Auntie Mansah’s Campus Food Spot</h3>
                <p className="text-xs text-slate-400">
                  Hot Waakye, Jollof, Kelewele, Gob3, and chilled hibiscus Sobolo
                </p>
              </div>
            </div>

            <div className="space-y-2.5 mb-5 max-h-72 overflow-y-auto pr-1">
              {FOOD_MENU.map((food) => (
                <div
                  key={food.id}
                  className="p-3 rounded-2xl bg-slate-800/70 border border-slate-700/70 flex items-center justify-between gap-3"
                >
                  <div className="text-3xl">{food.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-white">{food.name}</div>
                    <div className="text-xs text-slate-300">{food.description}</div>
                    <div className="text-[11px] text-emerald-400 font-mono mt-0.5">
                      +Hunger: {food.hungerRestored}% · +Happiness: {food.happinessRestored}%
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const success = buyFoodItem(food);
                      if (success) {
                        audioService.playCashSound();
                      }
                    }}
                    className="px-3.5 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition-colors whitespace-nowrap shadow-md"
                  >
                    GH₵ {food.price}
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={closeActivity}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-sm transition-colors"
            >
              Done Eating
            </button>
          </div>
        )}

        {/* 5. BANKING SQUARE PART-TIME WORK */}
        {activeActivity === 'banking_gig' && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-600/20 text-amber-400 flex items-center justify-center">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Banking Square & Campus Work Gigs</h3>
                <p className="text-xs text-slate-400">
                  Take up flexible student part-time work to earn Ghana Cedis (GH₵)
                </p>
              </div>
            </div>

            <div className="space-y-3 mb-5">
              {[
                {
                  title: 'Student Library Assistant',
                  pay: 85,
                  timeSpent: 90,
                  energyCost: 20,
                  desc: 'Shelving catalog books and guiding freshmen through digital databases.',
                },
                {
                  title: 'Campus Tour & Orientation Guide',
                  pay: 110,
                  timeSpent: 120,
                  energyCost: 30,
                  desc: 'Leading prospective students and alumni groups around UPSA landmarks.',
                },
                {
                  title: 'IT Lab Assistant & Printer Tech',
                  pay: 95,
                  timeSpent: 90,
                  energyCost: 25,
                  desc: 'Troubleshooting classroom projectors and student lab workstations.',
                },
              ].map((gig, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-between gap-3"
                >
                  <div className="flex-1">
                    <div className="font-bold text-sm text-white">{gig.title}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{gig.desc}</div>
                    <div className="text-[11px] text-amber-400 font-mono mt-1">
                      Pay: GH₵ {gig.pay} · Energy: -{gig.energyCost}%
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (needs.energy < gig.energyCost) {
                        showToast('😴 You are too tired! Take a nap in your room first.');
                        return;
                      }
                      startWorkShift({
                        id: `job-${idx}`,
                        title: gig.title,
                        pay: gig.pay,
                        durationSeconds: 60,
                      });
                      closeActivity();
                    }}
                    className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-colors whitespace-nowrap shadow-md"
                  >
                    Start 1-Min Shift (GH₵ {gig.pay})
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={closeActivity}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl text-xs transition-colors"
            >
              Back
            </button>
          </div>
        )}

        {/* 6. MAIN AUDITORIUM SYMPOSIUM */}
        {activeActivity === 'auditorium_event' && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                <Building className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">UPSA Main Auditorium</h3>
                <p className="text-xs text-slate-400">National Leadership & Entrepreneurship Forum</p>
              </div>
            </div>

            <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 mb-5 space-y-3 text-xs text-slate-300">
              <p>
                The monumental UPSA Main Auditorium is hosting a keynote conference on Ghanaian
                fintech innovation, accounting ethics, and corporate leadership.
              </p>
              <div className="p-3 bg-blue-950/40 border border-blue-500/40 rounded-xl text-blue-200">
                Attending this symposium expands your networking, boosts your academic morale (+20
                Happiness), and adds extra credits to your semester record.
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  passTime(90);
                  updateNeeds({
                    happiness: Math.min(100, needs.happiness + 25),
                    energy: Math.max(10, needs.energy - 15),
                  });
                  audioService.playSuccess();
                  showToast('🎓 Attended the UPSA Keynote Forum! Academic insights gained.');
                  closeActivity();
                }}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition-colors shadow-lg shadow-blue-500/25"
              >
                Attend 1.5h Keynote Forum
              </button>
              <button
                onClick={closeActivity}
                className="py-3 px-5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
