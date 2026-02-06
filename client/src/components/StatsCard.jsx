import { motion } from 'framer-motion';
import { muscleGroups } from './MuscleGroupSelector';

const StatsCard = ({ monthlyStats, streak, weeklyGoal, weeklyProgress }) => {
    const mostTrained = monthlyStats?.most_trained;
    const mostTrainedGroup = muscleGroups.find(g => g.id === mostTrained);

    // Calculate best week (simplified - could be enhanced)
    const bestWeek = Math.max(weeklyProgress, 0);

    // Check if weekly goal is met
    const goalMet = weeklyProgress >= weeklyGoal;

    return (
        <div className="card">
            <h3 className="text-lg font-semibold mb-4">📊 Estatísticas</h3>

            <div className="grid grid-cols-3 gap-4">
                {/* Streak */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                >
                    <div className="text-3xl font-bold text-tertiary mb-1">
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
                    <div className="text-3xl mb-1">
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
                    <div className={`text-3xl font-bold mb-1 ${goalMet ? 'text-secondary' : 'text-text-primary'}`}>
                        {goalMet ? '✅' : '🎯'} {weeklyProgress}/{weeklyGoal}
                    </div>
                    <div className="text-xs text-text-secondary">
                        Meta semanal
                    </div>
                </motion.div>
            </div>

            {/* Goal progress bar */}
            <div className="mt-4">
                <div className="h-2 bg-surface-light rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((weeklyProgress / weeklyGoal) * 100, 100)}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className={`h-full ${goalMet ? 'bg-secondary' : 'bg-primary'}`}
                    />
                </div>
            </div>
        </div>
    );
};

export default StatsCard;
