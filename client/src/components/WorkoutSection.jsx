import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import WeeklyView from './WeeklyView';
import MonthlyView from './MonthlyView';
import WorkoutHistory from './WorkoutHistory';
import SmartTip from './SmartTip';

export default function WorkoutSection({
    workouts,
    weeklyStats,
    onEditWorkout,
    onDeleteWorkout,
    recommendation // Added
}) {
    const [viewMode, setViewMode] = useState('week'); // week, month, list
    const [viewDate, setViewDate] = useState(null);

    const filteredWorkouts = viewDate
        ? workouts.filter(w => w.date === viewDate)
        : [];

    return (
        <div className="flex-1 flex flex-col overflow-hidden space-y-4">
            {/* Enhanced Smart Recommendation */}
            <SmartTip recommendation={recommendation} />

            {/* Header / Tabs */}
            <div className="flex bg-surface-light p-1 rounded-xl">
                {['week', 'month', 'list'].map((mode) => (
                    <button
                        key={mode}
                        onClick={() => setViewMode(mode)}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${viewMode === mode
                            ? 'bg-surface text-white shadow-lg'
                            : 'text-text-secondary hover:text-white'
                            }`}
                    >
                        {mode === 'week' && 'Semana'}
                        {mode === 'month' && 'Mês'}
                        {mode === 'list' && 'Histórico'}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide">
                <AnimatePresence mode="wait">
                    {viewMode === 'week' && (
                        <motion.div
                            key="week"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
                            <WeeklyView weeklyData={weeklyStats} onDayClick={setViewDate} />
                        </motion.div>
                    )}

                    {viewMode === 'month' && (
                        <motion.div
                            key="month"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
                            <MonthlyView workouts={workouts} onDayClick={setViewDate} />
                        </motion.div>
                    )}

                    {viewMode === 'list' && (
                        <motion.div
                            key="list"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
                            <WorkoutHistory
                                workouts={workouts}
                                onEdit={onEditWorkout}
                                onDelete={onDeleteWorkout}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Selected Day Details (for Week/Month views) */}
            {viewMode !== 'list' && viewDate && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-surface/50 border border-white/5 rounded-2xl p-4"
                >
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-primary font-bold uppercase tracking-wider">
                            {(() => {
                                const [year, month, day] = viewDate.split('-').map(Number);
                                const date = new Date(year, month - 1, day);
                                return date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
                            })()}
                        </h3>
                        <button onClick={() => setViewDate(null)} className="text-text-secondary text-sm">
                            Fechar
                        </button>
                    </div>

                    <div className="space-y-2">
                        {filteredWorkouts.length > 0 ? (
                            filteredWorkouts.map(w => {
                                const groups = w.muscle_groups.split(',');
                                return (
                                    <div key={w.id} className="p-3 bg-surface-light rounded-xl flex justify-between items-center border border-white/5">
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
                                            <button onClick={() => onEditWorkout(w)} className="p-2 hover:bg-white/10 rounded-full transition-colors">✏️</button>
                                            <button onClick={() => onDeleteWorkout(w.id)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-red-400">🗑️</button>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-6 text-text-secondary">
                                <p>Descanso neste dia 😴</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </div>
    );
}
