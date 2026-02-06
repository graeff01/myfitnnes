import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ActivityRings from './components/ActivityRings';
import MuscleGroupSelector from './components/MuscleGroupSelector';
import StatsCard from './components/StatsCard';
import WeeklyView from './components/WeeklyView';
import MonthlyView from './components/MonthlyView';
import WorkoutHistory from './components/WorkoutHistory';
import ProgressView from './components/ProgressView';
import HydrationCard from './components/HydrationCard';
import * as api from './services/api';
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState('today');
  const [workouts, setWorkouts] = useState([]);
  const [weeklyStats, setWeeklyStats] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState({ training_days: 0, muscle_groups: [] });
  const [streak, setStreak] = useState(0);
  const [settings, setSettings] = useState({ weekly_goal: 4 });
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [viewDate, setViewDate] = useState(null);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [workoutsData, weeklyData, monthlyData, streakData, settingsData] = await Promise.all([
        api.getWorkouts(),
        api.getWeeklyStats(),
        api.getMonthlyStats(),
        api.getStreak(),
        api.getSettings()
      ]);

      setWorkouts(workoutsData);
      setWeeklyStats(weeklyData);
      setMonthlyStats(monthlyData);
      setStreak(streakData.streak);
      setSettings(settingsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleLogWorkout = async (muscleGroups, notes) => {
    setIsLoading(true);
    try {
      if (editingWorkout) {
        // Update existing workout
        await api.updateWorkout(editingWorkout.id, muscleGroups, notes);
        setEditingWorkout(null);
      } else {
        // Create new workout
        await api.logWorkout(muscleGroups, notes);
      }

      // Show success animation
      setShowSuccess(true);

      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate([50, 100, 50]);
      }

      // Reload data
      await loadData();

      // Check for celebrations
      const newWeeklyCount = weeklyStats.length + 1;
      if (newWeeklyCount >= settings.weekly_goal) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }

      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error('Error logging workout:', error);
      alert('Erro ao registrar treino. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteWorkout = async (id) => {
    if (!confirm('Deseja realmente excluir este treino?')) return;

    try {
      await api.deleteWorkout(id);
      await loadData();
    } catch (error) {
      console.error('Error deleting workout:', error);
      alert('Erro ao excluir treino. Tente novamente.');
    }
  };

  const handleEditWorkout = (workout) => {
    setEditingWorkout(workout);
    setActiveTab('today');
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Calculate progress percentages
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const monthlyProgress = (monthlyStats.training_days / daysInMonth) * 100;

  const weeklyProgress = weeklyStats.length;
  const weeklyGoalProgress = (weeklyProgress / settings.weekly_goal) * 100;

  return (
    <div className="min-h-screen bg-background pb-20 px-4 pt-8">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">MyFit</h1>
          <p className="text-text-secondary text-sm">Sua consistência na academia</p>
        </motion.div>

        {/* Activity Rings */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <ActivityRings
            weeklyProgress={weeklyGoalProgress}
            monthlyProgress={monthlyProgress}
            streak={streak}
          />
        </motion.div>

        {/* Success Message */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="card bg-secondary text-black text-center py-4"
            >
              <div className="text-2xl mb-1">🎉</div>
              <div className="font-semibold">
                {editingWorkout ? 'Treino atualizado!' : 'Treino registrado!'}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Confetti Celebration */}
        <AnimatePresence>
          {showConfetti && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="card bg-gradient-to-r from-primary to-secondary text-white text-center py-6"
            >
              <div className="text-4xl mb-2">🎊 🎉 🎊</div>
              <div className="text-xl font-bold mb-1">Meta Semanal Batida!</div>
              <div className="text-sm opacity-90">Parabéns pela consistência! 💪</div>
            </motion.div>
          )}
        </AnimatePresence>



        {/* Stats Card */}
        <StatsCard
          monthlyStats={monthlyStats}
          streak={streak}
          weeklyGoal={settings.weekly_goal}
          weeklyProgress={weeklyProgress}
        />

        {/* Hydration Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <HydrationCard />
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide bg-surface-light p-1 rounded-full">
          {[
            { id: 'today', label: 'Hoje' },
            { id: 'week', label: 'Semana' },
            { id: 'month', label: 'Mês' },
            { id: 'progress', label: 'Progresso' },
            { id: 'history', label: 'Histórico' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'today' && (
            <motion.div
              key="today"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="card">
                <h2 className="text-xl font-bold mb-4">
                  {editingWorkout ? '✏️ Editar Treino' : 'Registrar Treino'}
                </h2>
                {editingWorkout && (
                  <div className="mb-4 p-3 bg-tertiary bg-opacity-10 rounded-xl">
                    <p className="text-sm text-tertiary">
                      Editando treino de hoje. Selecione os grupos musculares novamente.
                    </p>
                    <button
                      onClick={() => setEditingWorkout(null)}
                      className="text-xs text-text-secondary hover:text-text-primary mt-2"
                    >
                      Cancelar edição
                    </button>
                  </div>
                )}
                <MuscleGroupSelector
                  onConfirm={handleLogWorkout}
                  isLoading={isLoading}
                  initialSelected={editingWorkout ? editingWorkout.muscle_groups.split(',') : []}
                />
              </div>

              {/* Today's workouts */}
              {!editingWorkout && workouts.filter(w => w.date === api.formatDate()).length > 0 && (
                <div className="card">
                  <h3 className="text-lg font-semibold mb-3">Treinos de Hoje</h3>
                  <div className="space-y-2">
                    {workouts
                      .filter(w => w.date === api.formatDate())
                      .map(w => {
                        const groups = w.muscle_groups.split(',');
                        return (
                          <div key={w.id} className="p-3 bg-surface-light rounded-xl">
                            <div className="flex flex-wrap gap-2 mb-2">
                              {groups.map((group, idx) => (
                                <span key={idx} className="text-sm font-medium capitalize">
                                  {group}
                                  {idx < groups.length - 1 ? ',' : ''}
                                </span>
                              ))}
                            </div>
                            {w.notes && (
                              <p className="text-sm text-text-secondary italic">"{w.notes}"</p>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'week' && (
            <motion.div
              key="week"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <WeeklyView weeklyData={weeklyStats} onDayClick={setViewDate} />
              {viewDate && (
                <div className="mt-4">
                  <h3 className="text-sm font-bold text-text-secondary mb-2 uppercase tracking-wide">
                    {new Date(viewDate).toLocaleDateString('pt-BR')}
                  </h3>
                  <div className="space-y-2">
                    {workouts
                      .filter(w => w.date === viewDate)
                      .map(w => {
                        const groups = w.muscle_groups.split(',');
                        return (
                          <div key={w.id} className="p-3 bg-surface-light rounded-xl flex justify-between items-center">
                            <div>
                              <div className="flex flex-wrap gap-2 mb-1">
                                {groups.map((group, idx) => (
                                  <span key={idx} className="text-sm font-bold capitalize text-white">
                                    {group}
                                    {idx < groups.length - 1 ? ',' : ''}
                                  </span>
                                ))}
                              </div>
                              {w.notes && (
                                <p className="text-xs text-text-secondary italic">"{w.notes}"</p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => handleEditWorkout(w)} className="text-xl">✏️</button>
                              <button onClick={() => handleDeleteWorkout(w.id)} className="text-xl">🗑️</button>
                            </div>
                          </div>
                        );
                      })}
                    {workouts.filter(w => w.date === viewDate).length === 0 && (
                      <p className="text-center text-text-secondary py-4">Nenhum treino neste dia.</p>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'month' && (
            <motion.div
              key="month"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <MonthlyView workouts={workouts} onDayClick={setViewDate} />
              {viewDate && (
                <div className="mt-4">
                  <h3 className="text-sm font-bold text-text-secondary mb-2 uppercase tracking-wide">
                    {new Date(viewDate).toLocaleDateString('pt-BR')}
                  </h3>
                  <div className="space-y-2">
                    {workouts
                      .filter(w => w.date === viewDate)
                      .map(w => {
                        const groups = w.muscle_groups.split(',');
                        return (
                          <div key={w.id} className="p-3 bg-surface-light rounded-xl flex justify-between items-center">
                            <div>
                              <div className="flex flex-wrap gap-2 mb-1">
                                {groups.map((group, idx) => (
                                  <span key={idx} className="text-sm font-bold capitalize text-white">
                                    {group}
                                    {idx < groups.length - 1 ? ',' : ''}
                                  </span>
                                ))}
                              </div>
                              {w.notes && (
                                <p className="text-xs text-text-secondary italic">"{w.notes}"</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    {workouts.filter(w => w.date === viewDate).length === 0 && (
                      <p className="text-center text-text-secondary py-4">Nenhum treino neste dia.</p>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'progress' && (
            <motion.div
              key="progress"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <ProgressView />
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <WorkoutHistory
                workouts={workouts}
                onDelete={handleDeleteWorkout}
                onEdit={handleEditWorkout}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Streak Fire Effect */}
        {streak >= 7 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed bottom-4 right-4 text-6xl"
            style={{ filter: 'drop-shadow(0 0 10px rgba(255, 100, 0, 0.5))' }}
          >
            🔥
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default App;
