import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MuscleGroupSelector from './MuscleGroupSelector';
import { X } from 'lucide-react';

export default function WorkoutModal({ isOpen, onClose, onSave, initialData }) {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [muscleGroups, setMuscleGroups] = useState([]);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (initialData) {
            setDate(initialData.date);
            setMuscleGroups(initialData.muscle_groups ? initialData.muscle_groups.split(',') : []);
            setNotes(initialData.notes || '');
        } else {
            setDate(new Date().toISOString().split('T')[0]);
            setMuscleGroups([]);
            setNotes('');
        }
    }, [initialData, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ date, muscle_groups: muscleGroups, notes });
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                />

                {/* Modal Content */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-surface border border-white/10 w-full max-w-md rounded-3xl overflow-hidden relative z-10 shadow-2xl max-h-[90vh] flex flex-col"
                >
                    {/* Header */}
                    <div className="p-4 border-b border-white/5 flex justify-between items-center bg-surface-light">
                        <h2 className="text-xl font-bold text-white">
                            {initialData ? 'Editar Treino' : 'Registrar Treino'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <X size={24} className="text-text-secondary" />
                        </button>
                    </div>

                    {/* Form */}
                    <div className="p-4 overflow-y-auto custom-scrollbar">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Date Input */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-text-secondary uppercase tracking-wider">
                                    Data
                                </label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono"
                                    required
                                />
                            </div>

                            {/* Muscle Group Selector */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-text-secondary uppercase tracking-wider">
                                    Grupos Musculares
                                </label>
                                <MuscleGroupSelector
                                    selected={muscleGroups}
                                    onChange={setMuscleGroups}
                                />
                                {muscleGroups.length === 0 && (
                                    <p className="text-xs text-red-400 mt-1">Selecione pelo menos um grupo</p>
                                )}
                            </div>

                            {/* Notes Input */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-text-secondary uppercase tracking-wider">
                                    Observações (Opcional)
                                </label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Como foi o treino? Cargas, repetições..."
                                    className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all min-h-[100px] resize-none"
                                />
                            </div>

                            {/* Actions */}
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={muscleGroups.length === 0}
                                    className="w-full bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transform transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                >
                                    {initialData ? 'Salvar Alterações' : 'Registrar Treino'}
                                </button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
