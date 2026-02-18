import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import * as api from '../services/api';

const SupplementCard = () => {
    const [takenMorning, setTakenMorning] = useState(false);
    const [takenEvening, setTakenEvening] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadLog();
    }, []);

    const loadLog = async () => {
        try {
            const date = api.formatDate();
            const data = await api.getSupplementLog(date);
            if (data) {
                setTakenMorning(!!data.taken_morning);
                setTakenEvening(!!data.taken_evening);
            }
        } catch (err) {
            console.error('Error loading supplement log:', err);
        }
    };

    const toggle = async (period) => {
        const newMorning = period === 'morning' ? !takenMorning : takenMorning;
        const newEvening = period === 'evening' ? !takenEvening : takenEvening;

        setSaving(true);
        try {
            await api.logSupplement({
                date: api.formatDate(),
                taken_morning: newMorning,
                taken_evening: newEvening
            });

            if (period === 'morning') setTakenMorning(newMorning);
            else setTakenEvening(newEvening);

            if (newMorning && newEvening) {
                toast.success('Hipercalórico completo hoje!');
            }
        } catch (err) {
            toast.error('Erro ao salvar');
        } finally {
            setSaving(false);
        }
    };

    const bothDone = takenMorning && takenEvening;
    const oneDone = takenMorning || takenEvening;

    return (
        <div className="bg-gradient-to-br from-amber-900/30 to-surface border border-amber-500/20 rounded-2xl p-4 relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">🥤</span>
                    <div>
                        <h3 className="text-sm font-bold text-amber-100">Hipercalórico</h3>
                        <p className="text-[10px] text-amber-300/60">2x ao dia</p>
                    </div>
                </div>
                <div className={`text-xs font-bold px-2 py-1 rounded-full ${
                    bothDone
                        ? 'bg-green-500/20 text-green-300'
                        : oneDone
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-white/5 text-white/30'
                }`}>
                    {bothDone ? '✓ Completo' : oneDone ? '1/2' : '0/2'}
                </div>
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-2 gap-2">
                {/* Morning */}
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    disabled={saving}
                    onClick={() => toggle('morning')}
                    className={`relative flex flex-col items-center justify-center py-3 rounded-xl border-2 transition-all duration-200 overflow-hidden ${
                        takenMorning
                            ? 'bg-amber-500/20 border-amber-500/60 text-amber-100'
                            : 'bg-white/5 border-white/10 text-white/40'
                    }`}
                >
                    {takenMorning && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute inset-0 bg-amber-500/10 rounded-xl"
                        />
                    )}
                    <span className="text-xl relative z-10">{takenMorning ? '☀️' : '🌅'}</span>
                    <span className="text-xs font-bold mt-1 relative z-10">Manhã</span>
                    {takenMorning && (
                        <span className="text-[10px] text-amber-300/80 relative z-10">Tomado ✓</span>
                    )}
                </motion.button>

                {/* Evening */}
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    disabled={saving}
                    onClick={() => toggle('evening')}
                    className={`relative flex flex-col items-center justify-center py-3 rounded-xl border-2 transition-all duration-200 overflow-hidden ${
                        takenEvening
                            ? 'bg-amber-500/20 border-amber-500/60 text-amber-100'
                            : 'bg-white/5 border-white/10 text-white/40'
                    }`}
                >
                    {takenEvening && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute inset-0 bg-amber-500/10 rounded-xl"
                        />
                    )}
                    <span className="text-xl relative z-10">{takenEvening ? '🌙' : '🌆'}</span>
                    <span className="text-xs font-bold mt-1 relative z-10">Tarde/Noite</span>
                    {takenEvening && (
                        <span className="text-[10px] text-amber-300/80 relative z-10">Tomado ✓</span>
                    )}
                </motion.button>
            </div>

            {/* Achievement banner */}
            <AnimatePresence>
                {bothDone && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute bottom-0 left-0 right-0 bg-amber-500 text-white text-[10px] font-bold text-center py-1 tracking-wider uppercase"
                    >
                        💪 Hipercalórico completo hoje!
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SupplementCard;
