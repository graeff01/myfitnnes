import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, MessageSquare, Trash2 } from 'lucide-react';

const PhotoDetailModal = ({ isOpen, photo, onClose, onDelete }) => {
    if (!isOpen || !photo) return <AnimatePresence />;

    const formatDate = (dateStr) => {
        const date = new Date(dateStr + 'T00:00:00');
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/95 flex items-center justify-center z-[100] p-0 sm:p-4 overflow-hidden"
                onClick={onClose}
            >
                {/* Close Button - Floats on mobile, fixed on desktop */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white z-[110] transition-colors backdrop-blur-md border border-white/10 shadow-lg"
                >
                    <X className="w-6 h-6" />
                </button>

                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-4xl h-full sm:h-auto max-h-[100dvh] sm:max-h-[90dvh] flex flex-col sm:rounded-[32px] overflow-hidden bg-[#121212] border border-white/5 shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Image Container */}
                    <div className="flex-1 overflow-hidden bg-black flex items-center justify-center min-h-0">
                        <img
                            src={photo.image_data}
                            alt={photo.caption || 'Foto de evolução'}
                            className="w-full h-full object-contain"
                        />
                    </div>

                    {/* Info Section - High-end style */}
                    <div className="flex-none p-6 sm:p-8 bg-gradient-to-t from-black via-[#121212] to-[#121212]/0 -mt-10 pt-16 relative z-10">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-primary font-bold tracking-tight bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20">
                                    <Calendar className="w-4 h-4" />
                                    <span className="text-sm">{formatDate(photo.date)}</span>
                                </div>
                                <button
                                    onClick={() => {
                                        if (onDelete) onDelete(photo.id);
                                        onClose();
                                    }}
                                    className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-2xl transition-all border border-red-500/10 active:scale-95"
                                    title="Excluir foto"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-zinc-500">
                                    <MessageSquare className="w-4 h-4" />
                                    <span className="text-xs font-semibold uppercase tracking-widest">Descrição</span>
                                </div>
                                <p className="text-white text-lg font-medium leading-relaxed">
                                    {photo.caption || <span className="text-zinc-600 italic">Sem legenda descritiva.</span>}
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default PhotoDetailModal;
