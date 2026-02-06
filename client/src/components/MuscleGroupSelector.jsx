import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const muscleGroups = [
    { id: 'peito', label: 'Peito', icon: '💪', color: 'FA114F' },
    { id: 'costas', label: 'Costas', icon: '🔙', color: '00F0FF' },
    { id: 'pernas', label: 'Pernas', icon: '🦵', color: 'A855F7' },
    { id: 'ombros', label: 'Ombros', icon: '🙆', color: 'F97316' },
    { id: 'biceps', label: 'Bíceps', icon: '💪', color: 'EAB308' },
    { id: 'triceps', label: 'Tríceps', icon: '💪', color: 'EC4899' },
    { id: 'abdomen', label: 'Abdômen', icon: '🍫', color: '22C55E' },
    { id: 'cardio', label: 'Cardio', icon: '🏃', color: '06B6D4' },
    { id: 'alongamento', label: 'Flex', icon: '🧘', color: '14B8A6' }
];

const MuscleGroupSelector = ({ onConfirm, isLoading, initialSelected = [] }) => {
    const [selectedGroups, setSelectedGroups] = useState(initialSelected);
    const [notes, setNotes] = useState('');
    const [showConfirmation, setShowConfirmation] = useState(false);

    // Initialize state from props
    useEffect(() => {
        if (initialSelected.length > 0) {
            setSelectedGroups(initialSelected);
        }
    }, [initialSelected]);

    const toggleGroup = (id) => {
        setSelectedGroups(prev => {
            const newSelection = prev.includes(id)
                ? prev.filter(g => g !== id)
                : [...prev, id];

            // Haptic feedback
            if (navigator.vibrate) {
                navigator.vibrate(10);
            }

            return newSelection;
        });
    };

    const handleConfirm = () => {
        if (selectedGroups.length === 0) return;
        onConfirm(selectedGroups, notes);
        // Reset if not editing (handled by parent usually, but good practice)
        if (initialSelected.length === 0) {
            setSelectedGroups([]);
            setNotes('');
            setShowConfirmation(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Grid of Muscle Groups */}
            <div className="grid grid-cols-3 gap-3">
                {muscleGroups.map((group) => {
                    const isSelected = selectedGroups.includes(group.id);
                    return (
                        <motion.button
                            key={group.id}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => toggleGroup(group.id)}
                            className={`
                relative aspect-square rounded-2xl flex flex-col items-center justify-center gap-2
                transition-all duration-300 border-2
                ${isSelected
                                    ? 'bg-primary border-primary text-white shadow-[0_0_20px_rgba(250,17,79,0.4)]'
                                    : 'bg-surface-light border-transparent text-text-secondary hover:bg-surface hover:border-surface-light/50'}
              `}
                        >
                            <span className={`text-2xl filter ${isSelected ? 'drop-shadow-md' : 'grayscale opacity-70'}`}>
                                {group.icon}
                            </span>
                            <span className={`text-xs font-bold tracking-wide ${isSelected ? 'text-white' : 'text-text-secondary'}`}>
                                {group.label.toUpperCase()}
                            </span>

                            {/* Selection Checkmark Indicator */}
                            {isSelected && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute top-2 right-2 w-4 h-4 bg-white rounded-full flex items-center justify-center"
                                >
                                    <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </motion.div>
                            )}
                        </motion.button>
                    );
                })}
            </div>

            {/* Selected Groups Summary & Notes */}
            <AnimatePresence>
                {selectedGroups.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4 overflow-hidden"
                    >
                        {/* Notes Input */}
                        <div className="bg-surface-light rounded-2xl p-4 border border-white/5">
                            <label className="block text-xs font-bold text-text-secondary mb-2 uppercase tracking-wider">
                                Notas do Treino
                            </label>
                            <input
                                type="text"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Ex: Cargas aumentadas, foco em..."
                                className="w-full bg-surface border-none rounded-xl px-4 py-3 text-text-primary placeholder-text-secondary/50 focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                            />
                        </div>

                        {/* Confirm Button */}
                        <motion.button
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleConfirm}
                            disabled={isLoading}
                            className={`
                w-full py-4 rounded-2xl font-bold text-lg tracking-wide
                flex items-center justify-center gap-2
                shadow-lg shadow-primary/20
                ${isLoading
                                    ? 'bg-surface text-text-secondary cursor-not-allowed'
                                    : 'bg-primary text-white hover:bg-primary-dark'}
              `}
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    SALVANDO...
                                </span>
                            ) : (
                                <>
                                    CONFIRMAR TREINO ({selectedGroups.length})
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </>
                            )}
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MuscleGroupSelector;
