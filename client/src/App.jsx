import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as api from './services/api';

// Components
import Header from './components/Header';
import ActivityRings from './components/ActivityRings';
import HydrationCard from './components/HydrationCard';
import SupplementCard from './components/SupplementCard';
import StatsCard from './components/StatsCard';
import WorkoutPlanSection from './components/WorkoutPlanSection';
import BottomNav from './components/BottomNav';
import WorkoutSection from './components/WorkoutSection';
import ProgressView from './components/ProgressView';
import { Toaster, toast } from 'react-hot-toast';
import Login from './components/Login';
import ProfileView from './components/ProfileView';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [workoutsSubTab, setWorkoutsSubTab] = useState('plano'); // 'plano' | 'registro'
  const [workouts, setWorkouts] = useState([]);
  const [weeklyStats, setWeeklyStats] = useState([]);
  const [weightLogs, setWeightLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(api.isAuthenticated());

  // User Settings
  const weeklyGoal = 4;

  const loadData = async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const [workoutsData, statsData, weightData] = await Promise.all([
        api.getWorkouts(),
        api.getWeeklyStats(),
        api.getWeightLogs(null, null, 14)
      ]);
      setWorkouts(workoutsData);
      setWeeklyStats(statsData);
      setWeightLogs(weightData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error(`Erro ao carregar dados: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [refreshKey]);

  // --- Statistics Calculation ---
  const stats = useMemo(() => {
    if (!workouts.length) return { weeklyPct: 0, monthlyPct: 0, streak: 0, weeklyCount: 0, mostTrained: null, recommendation: null, weightTrend: null };

    const now = new Date();
    const today = api.formatDate(now);
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // 1. Weekly Progress
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const uniqueDaysWeek = new Set(workouts
      .filter(w => {
        const wDate = new Date(w.date + 'T00:00:00');
        return wDate >= startOfWeek;
      })
      .map(w => w.date)
    ).size;

    const weeklyProgressPct = Math.min((uniqueDaysWeek / weeklyGoal) * 100, 100);

    // 2. Monthly Progress
    const monthlyGoal = weeklyGoal * 4;
    const uniqueDaysMonth = new Set(workouts
      .filter(w => {
        const wDate = new Date(w.date + 'T00:00:00');
        return wDate.getMonth() === currentMonth && wDate.getFullYear() === currentYear;
      })
      .map(w => w.date)
    ).size;

    const monthlyProgressPct = Math.min((uniqueDaysMonth / monthlyGoal) * 100, 100);

    // 3. Streak
    let streak = 0;
    const sortedDates = [...new Set(workouts.map(w => w.date))].sort((a, b) => new Date(b) - new Date(a));

    if (sortedDates.length > 0) {
      let currentDate = new Date(sortedDates[0] + 'T00:00:00');
      const nowObj = new Date(today + 'T00:00:00');
      const diffHours = (nowObj - currentDate) / (1000 * 60 * 60);

      if (diffHours < 48) {
        streak = 1;
        let previousDate = new Date(currentDate);
        previousDate.setDate(previousDate.getDate() - 1);

        for (let i = 1; i < sortedDates.length; i++) {
          const dStr = sortedDates[i];
          const pStr = api.formatDate(previousDate);

          if (dStr === pStr) {
            streak++;
            previousDate.setDate(previousDate.getDate() - 1);
          } else if (dStr > pStr) {
            continue;
          } else {
            break;
          }
        }
      }
    }

    // 4. Most Trained (Month)
    const muscleMap = {};
    workouts.filter(w => {
      const wDate = new Date(w.date + 'T00:00:00');
      return wDate.getMonth() === currentMonth && wDate.getFullYear() === currentYear;
    }).forEach(w => {
      w.muscle_groups.split(',').forEach(g => {
        muscleMap[g] = (muscleMap[g] || 0) + 1;
      });
    });
    const mostTrained = Object.entries(muscleMap).sort((a, b) => b[1] - a[1])[0]?.[0];

    // 5. Neglected Muscle Groups
    const allMuscleGroups = ['peito', 'costas', 'pernas', 'ombros', 'biceps', 'triceps', 'abdomen', 'cardio', 'alongamento'];
    const muscleLastTrained = {};

    allMuscleGroups.forEach(g => muscleLastTrained[g] = new Date('2000-01-01'));

    workouts.forEach(w => {
      const wDate = new Date(w.date + 'T00:00:00');
      w.muscle_groups.split(',').forEach(g => {
        if (wDate > muscleLastTrained[g]) {
          muscleLastTrained[g] = wDate;
        }
      });
    });

    const neglected = Object.entries(muscleLastTrained)
      .map(([muscle, lastDate]) => ({
        muscle,
        days: Math.floor((new Date(today + 'T00:00:00') - lastDate) / (1000 * 60 * 60 * 24)),
        never: lastDate.getFullYear() === 2000
      }))
      .filter(m => m.days > 0)
      .sort((a, b) => b.days - a.days)[0];

    const recommendation = neglected ? {
      ...neglected,
      message: neglected.never ? `Você ainda não treinou ` : `Você não treina `,
      daysText: neglected.never ? `ainda` : `há ${neglected.days} ${neglected.days === 1 ? 'dia' : 'dias'}`,
      icon: {
        'peito': '💪', 'costas': '🔙', 'pernas': '🦵', 'ombros': '🙆',
        'biceps': '💪', 'triceps': '💪', 'abdomen': '🍫', 'cardio': '🏃',
        'alongamento': '🧘'
      }[neglected.muscle] || '💪'
    } : null;

    // 6. Weight Trend
    let weightTrend = null;
    if (weightLogs.length >= 2) {
      const sortedWeights = [...weightLogs].sort((a, b) => new Date(b.date) - new Date(a.date));
      const last7 = sortedWeights.slice(0, 7);
      const prev7 = sortedWeights.slice(7, 14);

      if (last7.length > 0 && prev7.length > 0) {
        const avg7 = last7.reduce((acc, curr) => acc + curr.weight, 0) / last7.length;
        const avgPrev = prev7.reduce((acc, curr) => acc + curr.weight, 0) / prev7.length;
        const diff = avg7 - avgPrev;

        weightTrend = {
          diff: Math.abs(diff).toFixed(1),
          direction: diff > 0 ? 'up' : 'down',
          isStable: Math.abs(diff) < 0.1
        };
      }
    }

    return {
      weeklyPct: weeklyProgressPct,
      monthlyPct: monthlyProgressPct,
      streak,
      weeklyCount: uniqueDaysWeek,
      mostTrained,
      recommendation,
      weightTrend
    };
  }, [workouts, weightLogs]);


  const handleDeleteWorkout = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este treino?')) return;
    try {
      await api.deleteWorkout(id);
      toast.success('Treino excluído');
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Error deleting workout:', error);
      toast.error('Erro ao excluir');
    }
  };

  const handlePlanWorkoutLogged = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (!isAuthenticated) {
    return (
      <>
        <Toaster position="top-center" />
        <Login onLoginSuccess={() => setIsAuthenticated(true)} />
      </>
    );
  }

  return (
    <div className="h-[100dvh] bg-background flex flex-col overflow-hidden">
      <div className="max-w-md mx-auto relative w-full h-full flex flex-col overflow-hidden">
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#1F1F1F',
              color: '#fff',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)'
            }
          }}
        />

        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col justify-start gap-2 p-2 pb-24 overflow-y-auto scrollbar-hide"
            >
              <div className="flex-none pt-2">
                <ActivityRings
                  weeklyProgress={stats.weeklyPct}
                  monthlyProgress={stats.monthlyPct}
                  streak={stats.streak}
                />
              </div>

              <div className="flex-none px-1">
                <StatsCard
                  streak={stats.streak}
                  weeklyGoal={weeklyGoal}
                  weeklyProgress={stats.weeklyCount}
                  monthlyStats={{ most_trained: stats.mostTrained }}
                  weightTrend={stats.weightTrend}
                />
              </div>

              {/* Nutrition/Supplement row */}
              <div className="px-1 grid grid-cols-1 gap-2">
                <HydrationCard />
                <SupplementCard />
              </div>
            </motion.div>
          )}

          {activeTab === 'workouts' && (
            <motion.div
              key="workouts"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col overflow-hidden p-4"
            >
              {/* Sub-tab toggle: Plano vs Registro */}
              <div className="flex bg-surface-light p-1 rounded-xl mb-4 flex-none">
                {[
                  { key: 'plano', label: '📋 Meu Plano' },
                  { key: 'registro', label: '📊 Histórico' },
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setWorkoutsSubTab(tab.key)}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                      workoutsSubTab === tab.key
                        ? 'bg-surface text-white shadow-lg'
                        : 'text-text-secondary hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {workoutsSubTab === 'plano' && (
                  <motion.div
                    key="plano"
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 15 }}
                    transition={{ duration: 0.15 }}
                    className="flex-1 overflow-y-auto scrollbar-hide"
                  >
                    <WorkoutPlanSection onWorkoutLogged={handlePlanWorkoutLogged} />
                  </motion.div>
                )}

                {workoutsSubTab === 'registro' && (
                  <motion.div
                    key="registro"
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    transition={{ duration: 0.15 }}
                    className="flex-1 flex flex-col overflow-hidden"
                  >
                    <WorkoutSection
                      workouts={workouts}
                      weeklyStats={weeklyStats}
                      onDeleteWorkout={handleDeleteWorkout}
                      recommendation={stats.recommendation}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

            </motion.div>
          )}

          {activeTab === 'progress' && (
            <motion.div
              key="progress"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col overflow-hidden p-4"
            >
              <div className="flex-1 flex flex-col overflow-hidden mt-2">
                <ProgressView />
              </div>
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              <ProfileView
                stats={{
                  totalWorkouts: workouts.length,
                  streak: stats.streak,
                  monthlyGoals: stats.weeklyPct >= 100 ? 1 : 0
                }}
                onLogout={() => setIsAuthenticated(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
}

export default App;
