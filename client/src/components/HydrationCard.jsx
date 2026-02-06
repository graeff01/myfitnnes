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
            setVolume(data.volume_ml || 0);
            setGoal(data.goal_ml || 2500);
        } catch (error) {
            console.error('Error loading hydration:', error);
        }
    };

    const updateVolume = async (amount) => {
        const newVolume = Math.max(0, volume + amount);

        // Optimistic update
        setVolume(newVolume);

        // Haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate(20);
        }

        try {
            await api.updateHydration(newVolume, goal);
        } catch (error) {
            console.error('Error updating hydration:', error);
            loadHydration(); // Revert
        }
    };

    const handleGoalChange = async (newGoal) => {
        setGoal(newGoal);
        setShowGoalInput(false);
        try {
            await api.updateHydration(volume, newGoal);
        } catch (error) {
            console.error('Error updating hydration goal:', error);
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
                    className="text-sm font-medium text-blue-200 hover:text-white transition-colors flex items-center gap-1 bg-blue-500/10 px-3 py-1 rounded-full"
                >
                    {volume} / {goal} ml ✏️
                </button>
            </div>

            {showGoalInput && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 bg-surface z-20 flex items-center justify-center p-4"
                >
                    <div className="w-full flex gap-2">
                        <input
                            type="number"
                            value={goal}
                            onChange={(e) => setGoal(parseInt(e.target.value) || 0)}
                            className="flex-1 bg-surface-light rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Meta em ml"
                        />
                        <button
                            onClick={() => handleGoalChange(goal)}
                            className="bg-blue-500 text-white px-4 py-2 rounded-xl font-bold"
                        >
                            Salvar
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Progress Bar Container */}
            <div className="h-4 bg-blue-900/30 rounded-full overflow-hidden mb-3 relative z-10">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ type: "spring", stiffness: 50, damping: 15 }}
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-400"
                />
            </div>

            {/* Quick Add Buttons */}
            <div className="grid grid-cols-4 gap-3 relative z-10">
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
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => updateVolume(-200)}
                    className="py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-200 text-sm font-bold flex items-center justify-center border border-red-500/10 transition-colors"
                >
                    <span>-200</span>
                </motion.button>
            </div>

            {/* Decorative Background Liquid */}
            <motion.div
                className="absolute bottom-0 left-0 right-0 bg-blue-500/5 blur-2xl"
                style={{ height: `${percentage}%` }}
                animate={{ height: `${percentage}%` }}
                transition={{ duration: 1 }}
            />

            {/* Celebration */}
            <AnimatePresence>
                {volume >= goal && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-4 text-center text-sm font-bold text-cyan-300 relative z-10"
                    >
                        🎉 Meta diária batida! Continue assim!
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default HydrationCard;
