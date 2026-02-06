import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as api from './services/api';

// Components
import Header from './components/Header';
import ActivityRings from './components/ActivityRings';
import HydrationCard from './components/HydrationCard';
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

  // User Settings (could be fetched from API)
  const weeklyGoal = 4; // Days per week

  const loadData = async () => {
    try {
      setLoading(true);
      const [workoutsData, statsData] = await Promise.all([
        api.getWorkouts(),
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
    if (!workouts.length) return { weekly: 0, monthly: 0, streak: 0 };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // 1. Weekly Progress
    // Find start of week (Sunday)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const workoutsThisWeek = workouts.filter(w => {
      const wDate = new Date(w.date + 'T00:00:00');
      return wDate >= startOfWeek;
    }).length; // This counts distinct WORKOUTS. If multiple per day? 
    // Usually 1 per day is the goal logic. 
    // Filter unique dates for the week
    const uniqueDaysWeek = new Set(workouts
      .filter(w => {
        const wDate = new Date(w.date + 'T00:00:00');
        return wDate >= startOfWeek;
      })
      .map(w => w.date)
    ).size;

    const weeklyProgress = Math.min((uniqueDaysWeek / weeklyGoal) * 100, 100);

    // 2. Monthly Progress (Arbitrary goal: 12 days?) or just consistency?
    // Let's assume goal is roughly weeklyGoal * 4
    const monthlyGoal = weeklyGoal * 4;
    const uniqueDaysMonth = new Set(workouts
      .filter(w => {
        const wDate = new Date(w.date + 'T00:00:00');
        return wDate.getMonth() === currentMonth && wDate.getFullYear() === currentYear;
      })
      .map(w => w.date)
    ).size;

    const monthlyProgress = Math.min((uniqueDaysMonth / monthlyGoal) * 100, 100);

    // 3. Streak
    let streak = 0;
    const sortedDates = [...new Set(workouts.map(w => w.date))].sort((a, b) => new Date(b) - new Date(a));

    // Check if trained today
    const trainedToday = sortedDates.includes(today.toISOString().split('T')[0]);
    let checkDate = new Date(today);

    // If not trained today, checking from yesterday for streak? 
    // Usually streak allows missing current day until it ends. 
    // Let's strictly count consecutive days backward from most recent workout logic?
    // User logic: "Streak" usually implies continuous.
    // If I didn't train today, streak might be 0? 
    // Or streak is "current active streak".

    // Simple logic:
    if (sortedDates.length > 0) {
      let currentString = sortedDates[0];
      let currentDate = new Date(currentString + 'T00:00:00');

      // Difference between today and last workout
      const diffHours = (today - currentDate) / (1000 * 60 * 60);

      if (diffHours < 48) { // If last workout was today or yesterday
        streak = 1;
        let previousDate = new Date(currentDate);
        previousDate.setDate(previousDate.getDate() - 1);

        for (let i = 1; i < sortedDates.length; i++) {
          const d = new Date(sortedDates[i] + 'T00:00:00');
          if (d.getTime() === previousDate.getTime()) {
            streak++;
            previousDate.setDate(previousDate.getDate() - 1);
          } else {
            break;
          }
        }
      }
    }

    return { weekly: weeklyProgress, monthly: monthlyProgress, streak };
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
    <div className="min-h-screen bg-background pb-24 px-4 pt-8">
      <div className="max-w-md mx-auto relative min-h-[80vh]">
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
              className="space-y-6"
            >
              <Header title="MyFit" subtitle="Sua jornada diária" />
              <ActivityRings
                weeklyProgress={stats.weekly}
                monthlyProgress={stats.monthly}
                streak={stats.streak}
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
            >
              <Header title="Seus Treinos" subtitle="Gerencie sua rotina" />
              <div className="mt-6">
                <WorkoutSection
                  workouts={workouts}
                  weeklyStats={weeklyStats}
                  onEditWorkout={handleEditWorkout}
                  onDeleteWorkout={handleDeleteWorkout}
                />
              </div>

              {/* Floating Action Button for Adding Workout */}
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
            >
              <Header title="Seu Progresso" subtitle="Acompanhe sua evolução" />
              <div className="mt-6">
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
