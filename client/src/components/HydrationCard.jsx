import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as api from '../services/api';

const HydrationCard = () => {
    const [volume, setVolume] = useState(0);
    const [goal, setGoal] = useState(2500); // Default 2500ml
    const [showGoalInput, setShowGoalInput] = useState(false);

    useEffect(() => {
        loadHydration();
    }, []);

    const loadHydration = async () => {
        try {
            const date = api.formatDate();
            const data = await api.getHydration(date);
            if (data) {
                setVolume(data.volume_ml || 0);
                setGoal(data.goal_ml || 2500);
            } else {
                // Initialize if no entries for today
                setVolume(0);
            }
        } catch (error) {
            console.error('Error loading hydration:', error);
        }
    };

    const updateVolume = async (amount) => {
        try {
            const newVolume = Math.max(0, volume + amount);
            const date = api.formatDate();
            await api.logHydration({
                date,
                volume: newVolume,
                goal
            });
            setVolume(newVolume);

            if (newVolume >= goal && volume < goal) {
                // Celebration effect?
            }
        } catch (error) {
            console.error('Error updating hydration:', error);
        }
    };

    const handleGoalChange = async (newGoal) => {
        try {
            const date = api.formatDate();
            await api.logHydration({
                date,
                volume,
                goal: parseInt(newGoal)
            });
            setGoal(parseInt(newGoal));
            setShowGoalInput(false);
        } catch (error) {
            console.error('Error updating goal:', error);
        }
    };

    const percentage = Math.min((volume / goal) * 100, 100);

    return (
        <div className="bg-gradient-to-br from-blue-900/30 to-surface border border-blue-500/20 rounded-2xl p-4 overflow-hidden relative">
            <div className="flex items-center justify-between mb-2 relative z-10">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">💧</span>
                    <h3 className="text-lg font-semibold text-blue-100">Hidratação</h3>
                </div>
                <button
                    onClick={() => setShowGoalInput(true)}
                    className="text-text-secondary text-sm hover:text-white transition-colors"
                >
                    {volume} / {goal} ml ✏️
                </button>
            </div>

            <AnimatePresence>
                {showGoalInput && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-6"
                        onClick={() => setShowGoalInput(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-surface border border-white/10 p-6 rounded-3xl w-full max-w-xs shadow-2xl relative z-[101]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-white font-bold mb-4 text-center">Definir Meta Diária</h3>
                            <div className="flex flex-col gap-4">
                                <input
                                    type="number"
                                    value={goal}
                                    onChange={(e) => setGoal(e.target.value)}
                                    className="bg-background border border-white/10 rounded-xl px-4 py-3 text-white text-center text-2xl font-bold focus:outline-none focus:border-blue-500 transition-colors"
                                    placeholder="Ex: 2500"
                                    autoFocus
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowGoalInput(false)}
                                        className="flex-1 bg-surface-light text-text-secondary px-4 py-3 rounded-xl font-bold"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={() => handleGoalChange(goal)}
                                        className="flex-1 bg-blue-500 text-white px-4 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20"
                                    >
                                        Salvar
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Progress Bar Container */}
            <div className="h-4 bg-blue-900/30 rounded-full overflow-hidden mb-3 relative z-10">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    className="h-full bg-gradient-to-r from-blue-600 to-blue-400 relative"
                >
                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </motion.div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-2 relative z-10">
                {[200, 300, 500].map((amount) => (
                    <motion.button
                        key={amount}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => updateVolume(amount)}
                        className="py-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-100 text-sm font-bold flex flex-col items-center justify-center border border-blue-500/10 transition-colors"
                    >
                        <span>+{amount}</span>
                        <span className="text-[10px] opacity-70">ml</span>
                    </motion.button>
                ))}
            </div>

            <div className="mt-2 flex gap-2 relative z-10">
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => updateVolume(-200)}
                    className="py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-200 text-sm font-bold flex-1 flex items-center justify-center border border-red-500/10 transition-colors"
                >
                    <span>-200ml</span>
                </motion.button>
            </div>

            {/* Achievement text */}
            {percentage >= 100 && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute bottom-0 left-0 right-0 bg-blue-500 text-white text-[10px] font-bold text-center py-0.5 tracking-wider uppercase"
                >
                    🎉 Meta diária batida!
                </motion.div>
            )}
        </div>
    );
};

export default HydrationCard;
