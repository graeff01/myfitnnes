import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as api from './services/api';

// Components
import Header from './components/Header';
import ActivityRings from './components/ActivityRings';
import HydrationCard from './components/HydrationCard';
import StatsCard from './components/StatsCard'; // Added
import WorkoutModal from './components/WorkoutModal';
import BottomNav from './components/BottomNav';
import WorkoutSection from './components/WorkoutSection';
import ProgressView from './components/ProgressView';
import { Toaster, toast } from 'react-hot-toast';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [workouts, setWorkouts] = useState([]);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [weeklyStats, setWeeklyStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // User Settings
  const weeklyGoal = 4;

  const loadData = async () => {
    try {
      setLoading(true);
      const [workoutsData, statsData] = await Promise.all([
        api.getWorkouts(), // Fixed API name
        api.getWeeklyStats()
      ]);
      setWorkouts(workoutsData);
      setWeeklyStats(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [refreshKey]);

  // --- Statistics Calculation ---
  const stats = useMemo(() => {
    if (!workouts.length) return { weeklyPct: 0, monthlyPct: 0, streak: 0, weeklyCount: 0, mostTrained: null };

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // 1. Weekly Progress
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Start Sunday
    startOfWeek.setHours(0, 0, 0, 0);

    // Unique days trained this week
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

      // If last workout was today or yesterday, streak is active
      if (diffHours < 48) {
        streak = 1;
        let previousDate = new Date(currentDate);
        previousDate.setDate(previousDate.getDate() - 1);

        // Check backwards
        for (let i = 1; i < sortedDates.length; i++) {
          const dStr = sortedDates[i];
          const pStr = previousDate.toISOString().split('T')[0];

          if (dStr === pStr) {
            streak++;
            previousDate.setDate(previousDate.getDate() - 1);
          } else if (dStr > pStr) {
            continue; // Should not happen with sorted set
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

    return {
      weeklyPct: weeklyProgressPct,
      monthlyPct: monthlyProgressPct,
      streak,
      weeklyCount: uniqueDaysWeek,
      mostTrained
    };
  }, [workouts]);


  const handleSaveWorkout = async (data) => {
    try {
      if (selectedWorkout) {
        await api.updateWorkout(selectedWorkout.id, data);
        toast.success('Treino atualizado!');
      } else {
        await api.logWorkout(data);
        toast.success('Treino registrado!');
      }
      setShowWorkoutModal(false);
      setSelectedWorkout(null);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Error saving workout:', error);
      toast.error('Erro ao salvar treino');
    }
  };

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

  const handleEditWorkout = (workout) => {
    setSelectedWorkout(workout);
    setShowWorkoutModal(true);
  };

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
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col justify-between p-4 overflow-hidden"
            >
              <Header title="MyFit" subtitle="Sua jornada diária" />

              <ActivityRings
                weeklyProgress={stats.weeklyPct}
                monthlyProgress={stats.monthlyPct}
                streak={stats.streak}
              />

              <StatsCard
                streak={stats.streak}
                weeklyGoal={weeklyGoal}
                weeklyProgress={stats.weeklyCount}
                monthlyStats={{ most_trained: stats.mostTrained }}
              />

              <HydrationCard />
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
              <Header title="Seus Treinos" subtitle="Gerencie sua rotina" />
              <div className="flex-1 overflow-hidden mt-2">
                <WorkoutSection
                  workouts={workouts}
                  weeklyStats={weeklyStats}
                  onEditWorkout={handleEditWorkout}
                  onDeleteWorkout={handleDeleteWorkout}
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSelectedWorkout(null);
                  setShowWorkoutModal(true);
                }}
                className="fixed bottom-24 right-6 w-14 h-14 bg-primary rounded-full shadow-lg shadow-primary/30 flex items-center justify-center text-2xl z-40 border border-white/20"
              >
                ➕
              </motion.button>
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
              <Header title="Seu Progresso" subtitle="Acompanhe sua evolução" />
              <div className="flex-1 overflow-hidden mt-2">
                <ProgressView />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

        <WorkoutModal
          isOpen={showWorkoutModal}
          onClose={() => {
            setShowWorkoutModal(false);
            setSelectedWorkout(null);
          }}
          onSave={handleSaveWorkout}
          initialData={selectedWorkout}
        />
      </div>
    </div>
  );
}

export default App;
