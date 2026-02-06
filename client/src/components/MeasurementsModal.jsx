import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as api from '../services/api';

const measurementFields = [
    { id: 'chest', label: 'Peito', icon: '💪' },
    { id: 'waist', label: 'Cintura', icon: '📏' },
    { id: 'hips', label: 'Quadril', icon: '📐' },
    { id: 'left_arm', label: 'Braço E', icon: '💪' },
    { id: 'right_arm', label: 'Braço D', icon: '💪' },
    { id: 'left_thigh', label: 'Coxa E', icon: '🦵' },
    { id: 'right_thigh', label: 'Coxa D', icon: '🦵' },
    { id: 'left_calf', label: 'Panturrilha E', icon: '🦵' },
    { id: 'right_calf', label: 'Panturrilha D', icon: '🦵' },
];

const MeasurementsModal = ({ isOpen, onClose, onSave }) => {
    const [measurements, setMeasurements] = useState({});
    const [notes, setNotes] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (field, value) => {
        setMeasurements(prev => ({
            ...prev,
            [field]: value ? parseFloat(value) : null
        }));
    };

    const handleSave = async () => {
        // Check if at least one measurement is filled
        const hasData = Object.values(measurements).some(v => v !== null && v > 0);

        if (!hasData) {
            alert('Por favor, preencha pelo menos uma medida');
            return;
        }

        setIsLoading(true);
        try {
            await api.logMeasurements(measurements, notes);

            // Haptic feedback
            if (navigator.vibrate) {
                navigator.vibrate(50);
            }

            onSave();
            setMeasurements({});
            setNotes('');
            onClose();
        } catch (error) {
            console.error('Error logging measurements:', error);
            alert('Erro ao registrar medidas. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 overflow-y-auto"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="card max-w-md w-full my-8"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold">📏 Registrar Medidas</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-surface-light rounded-full transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-hide pr-2">
                        {measurementFields.map((field) => (
                            <div key={field.id}>
                                <label className="block text-sm font-medium text-text-secondary mb-2">
                                    {field.icon} {field.label} (cm)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={measurements[field.id] || ''}
                                    onChange={(e) => handleChange(field.id, e.target.value)}
                                    placeholder="Ex: 35.5"
                                    className="w-full px-4 py-3 bg-surface-light rounded-2xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                        ))}

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">
                                Nota (opcional)
                            </label>
                            <input
                                type="text"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Ex: Medidas pós-treino"
                                className="w-full px-4 py-3 bg-surface-light rounded-2xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                                maxLength={50}
                            />
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-3 pt-6 mt-6 border-t border-surface-light">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 rounded-2xl font-semibold bg-surface-light text-text-primary hover:bg-surface transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isLoading}
                            className={`flex-1 py-3 rounded-2xl font-semibold transition-all ${isLoading
                                    ? 'bg-surface text-text-secondary'
                                    : 'bg-primary text-white hover:bg-opacity-90'
                                }`}
                        >
                            {isLoading ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default MeasurementsModal;
