import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import * as api from '../services/api';

const MUSCLE_LABELS = {
    peito: 'Peito', costas: 'Costas', pernas: 'Pernas',
    ombros: 'Ombros', biceps: 'Bíceps', triceps: 'Tríceps',
    abdomen: 'Abdômen', cardio: 'Cardio', alongamento: 'Alongamento'
};

const DAY_COLORS = [
    { bg: 'from-blue-900/40 to-blue-800/20', border: 'border-blue-500/30', accent: 'bg-blue-500', text: 'text-blue-300', ring: 'ring-blue-500/40' },
    { bg: 'from-green-900/40 to-green-800/20', border: 'border-green-500/30', accent: 'bg-green-500', text: 'text-green-300', ring: 'ring-green-500/40' },
    { bg: 'from-orange-900/40 to-orange-800/20', border: 'border-orange-500/30', accent: 'bg-orange-500', text: 'text-orange-300', ring: 'ring-orange-500/40' },
    { bg: 'from-purple-900/40 to-purple-800/20', border: 'border-purple-500/30', accent: 'bg-purple-500', text: 'text-purple-300', ring: 'ring-purple-500/40' },
    { bg: 'from-red-900/40 to-red-800/20', border: 'border-red-500/30', accent: 'bg-red-500', text: 'text-red-300', ring: 'ring-red-500/40' },
];

function formatReps(ex) {
    if (ex.notes && !ex.reps_min) return ex.notes;
    if (ex.reps_min === ex.reps_max || !ex.reps_max) return `${ex.reps_min} reps`;
    return `${ex.reps_min}-${ex.reps_max} reps`;
}

// ─── Active Workout Session Modal ──────────────────────────────────────────
function ActiveSession({ plan, onFinish, onClose }) {
    const [completed, setCompleted] = useState({});
    const [saving, setSaving] = useState(false);
    const color = DAY_COLORS[(plan.day_number - 1) % DAY_COLORS.length];
    const total = plan.exercises.length;
    const doneCount = Object.values(completed).filter(Boolean).length;
    const allDone = doneCount === total;

    const toggle = (id) => {
        setCompleted(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleFinish = async () => {
        setSaving(true);
        try {
            const muscleGroups = plan.muscle_groups.split(',');
            const exerciseNames = plan.exercises
                .filter(e => completed[e.id])
                .map(e => e.name)
                .join(', ');

            await api.logWorkout({
                date: api.formatDate(),
                muscle_groups: muscleGroups,
                notes: `Plano: ${plan.name}. Exercícios: ${exerciseNames}`
            });

            toast.success('Treino concluído e registrado!');
            onFinish();
        } catch (err) {
            toast.error('Erro ao registrar treino');
        } finally {
            setSaving(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[200] flex flex-col"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
            {/* Header */}
            <div className={`bg-gradient-to-r ${color.bg} border-b ${color.border} px-4 pt-12 pb-4`}>
                <div className="flex items-center justify-between mb-1">
                    <button onClick={onClose} className="text-white/60 text-sm font-medium">
                        ✕ Sair
                    </button>
                    <span className={`text-xs font-bold uppercase tracking-widest ${color.text}`}>
                        Em andamento
                    </span>
                </div>
                <h2 className="text-white font-bold text-xl mt-2">{plan.name}</h2>
                <div className="flex items-center gap-3 mt-3">
                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            className={`h-full ${color.accent}`}
                            animate={{ width: `${(doneCount / total) * 100}%` }}
                            transition={{ type: 'spring', stiffness: 120 }}
                        />
                    </div>
                    <span className="text-white/70 text-sm font-bold">
                        {doneCount}/{total}
                    </span>
                </div>
            </div>

            {/* Exercise List */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {plan.exercises.map((ex, idx) => {
                    const done = !!completed[ex.id];
                    return (
                        <motion.button
                            key={ex.id}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => toggle(ex.id)}
                            className={`w-full text-left rounded-2xl p-4 border transition-all duration-200 flex items-center gap-4 ${
                                done
                                    ? `${color.border} bg-white/5`
                                    : 'border-white/10 bg-white/5'
                            }`}
                        >
                            {/* Checkbox */}
                            <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                done
                                    ? `${color.accent} border-transparent`
                                    : 'border-white/30'
                            }`}>
                                {done && <span className="text-white text-sm font-bold">✓</span>}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <p className={`font-semibold text-base transition-all ${done ? 'text-white/40 line-through' : 'text-white'}`}>
                                    {ex.name}
                                </p>
                                <p className={`text-sm mt-0.5 ${done ? 'text-white/25' : 'text-white/50'}`}>
                                    {ex.sets} séries × {formatReps(ex)}
                                </p>
                            </div>

                            {/* Index badge */}
                            <span className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                                done ? 'text-white/20 bg-white/5' : `${color.text} bg-white/5`
                            }`}>
                                {idx + 1}
                            </span>
                        </motion.button>
                    );
                })}
            </div>

            {/* Finish Button */}
            <div className="px-4 pb-6 pt-2">
                <AnimatePresence>
                    {doneCount > 0 && (
                        <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            whileTap={{ scale: 0.97 }}
                            disabled={saving}
                            onClick={handleFinish}
                            className={`w-full py-4 rounded-2xl font-bold text-lg text-white shadow-xl transition-all ${
                                allDone
                                    ? `${color.accent} shadow-${color.accent}/30`
                                    : 'bg-white/20'
                            } ${saving ? 'opacity-60' : ''}`}
                        >
                            {saving
                                ? 'Salvando...'
                                : allDone
                                    ? '🏆 Concluir Treino!'
                                    : `Concluir (${doneCount}/${total} exercícios)`
                            }
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

// ─── Plan Day Card ──────────────────────────────────────────────────────────
function PlanCard({ plan, onStart }) {
    const [expanded, setExpanded] = useState(false);
    const color = DAY_COLORS[(plan.day_number - 1) % DAY_COLORS.length];
    const muscles = plan.muscle_groups.split(',').map(m => MUSCLE_LABELS[m] || m);

    return (
        <motion.div
            layout
            className={`bg-gradient-to-br ${color.bg} border ${color.border} rounded-2xl overflow-hidden`}
        >
            {/* Card Header */}
            <button
                className="w-full flex items-center gap-3 p-4 text-left"
                onClick={() => setExpanded(v => !v)}
            >
                {/* Day badge */}
                <div className={`w-10 h-10 ${color.accent} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                    <span className="text-white font-black text-lg">{plan.day_number}</span>
                </div>

                <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-sm leading-tight">{plan.name}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                        {muscles.map(m => (
                            <span key={m} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/10 ${color.text}`}>
                                {m}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-white/40 text-xs">{plan.exercises.length} ex.</span>
                    <span className={`text-white/50 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>
                        ▾
                    </span>
                </div>
            </button>

            {/* Expandable Exercise List */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-2 space-y-2 border-t border-white/5 pt-2">
                            {plan.exercises.map((ex, idx) => (
                                <div key={ex.id} className="flex items-start gap-3 py-1.5">
                                    <span className={`text-xs font-bold w-5 h-5 ${color.accent} rounded-full flex items-center justify-center flex-shrink-0 text-white mt-0.5`}>
                                        {idx + 1}
                                    </span>
                                    <div>
                                        <p className="text-white text-sm font-medium">{ex.name}</p>
                                        <p className="text-white/40 text-xs">{ex.sets} séries × {formatReps(ex)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="px-4 pb-4 pt-2">
                            <motion.button
                                whileTap={{ scale: 0.97 }}
                                onClick={() => onStart(plan)}
                                className={`w-full py-3 rounded-xl ${color.accent} text-white font-bold text-sm shadow-lg`}
                            >
                                ▶ Iniciar Treino
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// ─── Main WorkoutPlanSection ────────────────────────────────────────────────
export default function WorkoutPlanSection({ onWorkoutLogged }) {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeSession, setActiveSession] = useState(null);

    useEffect(() => {
        loadPlans();
    }, []);

    const loadPlans = async () => {
        try {
            setLoading(true);
            const data = await api.getPlans();
            setPlans(data);
        } catch (err) {
            toast.error('Erro ao carregar plano de treino');
        } finally {
            setLoading(false);
        }
    };

    const handleFinish = () => {
        setActiveSession(null);
        if (onWorkoutLogged) onWorkoutLogged();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-10">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <>
            <div className="space-y-3">
                {plans.map(plan => (
                    <PlanCard
                        key={plan.id}
                        plan={plan}
                        onStart={setActiveSession}
                    />
                ))}
            </div>

            <AnimatePresence>
                {activeSession && (
                    <ActiveSession
                        plan={activeSession}
                        onFinish={handleFinish}
                        onClose={() => setActiveSession(null)}
                    />
                )}
            </AnimatePresence>
        </>
    );
}
