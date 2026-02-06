import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as api from '../services/api';

const WeightModal = ({ isOpen, onClose, onSave }) => {
    const [weight, setWeight] = useState('');
    const [notes, setNotes] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        if (!weight || parseFloat(weight) <= 0) {
            alert('Por favor, insira um peso válido');
            return;
        }

        setIsLoading(true);
        try {
            await api.logWeight(parseFloat(weight), notes);

            // Haptic feedback
            if (navigator.vibrate) {
                navigator.vibrate(50);
            }

            onSave();
            setWeight('');
            setNotes('');
            onClose();
        } catch (error) {
            console.error('Error logging weight:', error);
            alert('Erro ao registrar peso. Tente novamente.');
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
                className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="card max-w-md w-full"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold">⚖️ Registrar Peso</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-surface-light rounded-full transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="space-y-4">
                        {/* Weight input */}
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">
                                Peso (kg)
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                                placeholder="Ex: 75.5"
                                className="w-full px-4 py-3 bg-surface-light rounded-2xl text-text-primary text-2xl font-bold text-center focus:outline-none focus:ring-2 focus:ring-primary"
                                autoFocus
                            />
                        </div>

                        {/* Notes input */}
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">
                                Nota (opcional)
                            </label>
                            <input
                                type="text"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Ex: Após café da manhã"
                                className="w-full px-4 py-3 bg-surface-light rounded-2xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                                maxLength={50}
                            />
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-3 pt-4">
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
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default WeightModal;
