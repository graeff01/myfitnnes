import { motion } from 'framer-motion';
import { muscleGroups } from './MuscleGroupSelector';

const StatsCard = ({ monthlyStats, streak, weeklyGoal, weeklyProgress, weightTrend }) => {
    const mostTrained = monthlyStats?.most_trained;
    const mostTrainedGroup = muscleGroups.find(g => g.id === mostTrained);

    // Calculate best week (simplified - could be enhanced)
    const bestWeek = Math.max(weeklyProgress, 0);

    // Check if weekly goal is met
    const goalMet = weeklyProgress >= weeklyGoal;

    return (
        <div className="bg-surface/50 border border-white/5 rounded-2xl p-3 shadow-inner">
            <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-2">Estatísticas</h3>

            <div className="grid grid-cols-3 gap-2">
                {/* Streak */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                >
                    <div className="text-2xl font-bold text-tertiary mb-0.5">
                        {streak >= 7 ? '🔥' : '⚡'} {streak}
                    </div>
                    <div className="text-xs text-text-secondary">
                        Dias seguidos
                    </div>
                </motion.div>

                {/* Most trained */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-center"
                >
                    <div className="text-2xl mb-0.5">
                        {mostTrainedGroup ? mostTrainedGroup.label.split(' ')[0] : '💪'}
                    </div>
                    <div className="text-xs text-text-secondary">
                        Mais treinado
                    </div>
                </motion.div>

                {/* Weekly goal */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-center"
                >
                    <div className={`text-2xl font-bold mb-0.5 ${goalMet ? 'text-secondary' : 'text-text-primary'}`}>
                        {goalMet ? '✅' : '🎯'} {weeklyProgress}/{weeklyGoal}
                    </div>
                    <div className="text-xs text-text-secondary">
                        Meta semanal
                    </div>
                </motion.div>
            </div>

            {/* Goal progress bar */}
            <div className="mt-2">
                <div className="h-2 bg-surface-light rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((weeklyProgress / weeklyGoal) * 100, 100)}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className={`h-full ${goalMet ? 'bg-secondary' : 'bg-primary'}`}
                    />
                </div>
            </div>

            {/* Weight Trend */}
            {weightTrend && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between"
                >
                    <span className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">Tendência de Peso</span>
                    <span className={`text-xs font-bold flex items-center gap-1 ${weightTrend.direction === 'down' ? 'text-secondary' : 'text-primary'}`}>
                        {weightTrend.isStable ? (
                            'Estável ⚖️'
                        ) : (
                            <>
                                {weightTrend.direction === 'down' ? '▼' : '▲'} {weightTrend.diff}kg nesta semana
                            </>
                        )}
                    </span>
                </motion.div>
            )}
        </div>
    );
};

export default StatsCard;
