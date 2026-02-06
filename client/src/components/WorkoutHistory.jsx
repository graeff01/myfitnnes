import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { muscleGroups } from './MuscleGroupSelector';

const WorkoutHistory = ({ workouts = [], onDelete, onEdit }) => {
    const [editingId, setEditingId] = useState(null);

    // Group workouts by date
    const groupedWorkouts = workouts.reduce((acc, workout) => {
        const date = workout.date;
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(workout);
        return acc;
    }, {});

    // Format date for display
    const formatDate = (dateStr) => {
        const date = new Date(dateStr + 'T00:00:00');
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (dateStr === today.toISOString().split('T')[0]) {
            return 'Hoje';
        } else if (dateStr === yesterday.toISOString().split('T')[0]) {
            return 'Ontem';
        } else {
            return date.toLocaleDateString('pt-BR', {
                day: 'numeric',
                month: 'short',
                weekday: 'short'
            });
        }
    };

    const getColorForMuscle = (muscle) => {
        const group = muscleGroups.find(g => g.id === muscle);
        return group ? group.color.replace('bg-', '') : 'gray-500';
    };

    const getMuscleLabel = (muscle) => {
        const group = muscleGroups.find(g => g.id === muscle);
        return group ? group.label : muscle;
    };

    if (workouts.length === 0) {
        return (
            <div className="card text-center py-12">
                <div className="text-6xl mb-4">💪</div>
                <h3 className="text-lg font-semibold mb-2">Nenhum treino registrado</h3>
                <p className="text-text-secondary text-sm">
                    Comece registrando seu primeiro treino acima!
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <AnimatePresence>
                {Object.entries(groupedWorkouts).map(([date, dayWorkouts], index) => (
                    <motion.div
                        key={date}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ delay: index * 0.05 }}
                        className="card"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-text-primary">{formatDate(date)}</h4>
                            <span className="text-xs text-text-secondary">
                                {dayWorkouts.length} treino{dayWorkouts.length > 1 ? 's' : ''}
                            </span>
                        </div>

                        <div className="space-y-2">
                            {dayWorkouts.map((workout) => {
                                const muscleGroupsArray = workout.muscle_groups.split(',');
                                const isToday = workout.date === new Date().toISOString().split('T')[0];

                                return (
                                    <motion.div
                                        key={workout.id}
                                        layout
                                        className="p-3 bg-surface-light rounded-xl space-y-2"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex flex-wrap gap-2">
                                                {muscleGroupsArray.map((muscle, idx) => (
                                                    <div key={idx} className="flex items-center gap-2">
                                                        <div
                                                            className="w-3 h-3 rounded-full"
                                                            style={{ backgroundColor: `#${getColorForMuscle(muscle)}` }}
                                                        />
                                                        <span className="font-medium text-sm">{getMuscleLabel(muscle)}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex gap-2">
                                                {isToday && (
                                                    <button
                                                        onClick={() => onEdit(workout)}
                                                        className="p-2 hover:bg-surface rounded-lg transition-colors"
                                                    >
                                                        <svg
                                                            className="w-5 h-5 text-text-secondary hover:text-tertiary"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                            />
                                                        </svg>
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => onDelete(workout.id)}
                                                    className="p-2 hover:bg-surface rounded-lg transition-colors"
                                                >
                                                    <svg
                                                        className="w-5 h-5 text-text-secondary hover:text-red-500"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                        />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>

                                        {workout.notes && (
                                            <div className="text-sm text-text-secondary italic pl-5">
                                                "{workout.notes}"
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default WorkoutHistory;
