import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ComparisonModal({ isOpen, photo1, photo2, onClose }) {
    const [sliderPosition, setSliderPosition] = useState(50);
    const containerRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);

    // Sort photos properly: older date (Before) on left/bottom, newer date (After) on right/top
    // This sorting ensures Photo1 is always BEFORE and Photo2 is AFTER chronologically
    const [beforePhoto, setBeforePhoto] = useState(null);
    const [afterPhoto, setAfterPhoto] = useState(null);

    useEffect(() => {
        if (isOpen && photo1 && photo2) {
            const d1 = new Date(photo1.date);
            const d2 = new Date(photo2.date);
            if (d1 < d2) {
                setBeforePhoto(photo1);
                setAfterPhoto(photo2);
            } else {
                setBeforePhoto(photo2);
                setAfterPhoto(photo1);
            }
            setSliderPosition(50);
        }
    }, [isOpen, photo1, photo2]);

    const handleMove = (clientX) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        // Calculate percentage (0 to 100)
        let x = clientX - rect.left;
        x = Math.max(0, Math.min(x, rect.width));
        const percentage = (x / rect.width) * 100;
        setSliderPosition(percentage);
    };

    const handleMouseDown = () => setIsDragging(true);
    const handleMouseUp = () => setIsDragging(false);

    const handleMouseMove = (e) => {
        if (isDragging) handleMove(e.clientX);
    };

    const handleTouchMove = (e) => {
        // Prevent scrolling while sliding
        // e.preventDefault(); // React synthetic events don't support preventDefault on touchmove well for passive listeners
        handleMove(e.touches[0].clientX);
    };

    if (!isOpen || !beforePhoto || !afterPhoto) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-surface w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
                >
                    {/* Header */}
                    <div className="p-4 flex items-center justify-between border-b border-white/10 shrink-0">
                        <h3 className="text-lg font-bold text-white">Comparativo</h3>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Comparison Area */}
                    <div
                        className="relative flex-1 bg-black overflow-hidden cursor-col-resize select-none touch-none aspect-[3/4]"
                        ref={containerRef}
                        onMouseMove={handleMouseMove}
                        onMouseDown={handleMouseDown}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onTouchMove={handleTouchMove}
                        onTouchStart={handleMouseDown}
                        onTouchEnd={handleMouseUp}
                    >
                        {/* 1. Underlying Image (AFTER) - The "New" result on the right */}
                        <img
                            src={afterPhoto.image_data}
                            alt="Depois"
                            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                        />
                        <div className="absolute top-4 right-4 bg-black/60 px-3 py-1 rounded-full text-xs font-bold text-white border border-white/20 z-10">
                            DEPOIS
                        </div>

                        {/* 2. Overlay Image (BEFORE) - The "Old" starting point on the left */}
                        <div
                            className="absolute inset-0 h-full overflow-hidden border-r-2 border-primary shadow-[0_0_15px_rgba(0,0,0,0.5)] z-20"
                            style={{ width: `${sliderPosition}%` }}
                        >
                            {/* This inner div compensates for the width change to keep the image static relative to the container */}
                            <div className="relative w-full h-full" style={{ width: containerRef.current ? `${containerRef.current.offsetWidth}px` : '100%' }}>
                                <img
                                    src={beforePhoto.image_data}
                                    alt="Antes"
                                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                                    // Use 'vw' or fixed width approach if ref is null initially, but ref should be there on render
                                    style={{ width: '100%', height: '100%' }}
                                />
                                <div className="absolute top-4 left-4 bg-black/60 px-3 py-1 rounded-full text-xs font-bold text-white border border-white/20">
                                    ANTES
                                </div>
                            </div>
                        </div>

                        {/* 3. Slider Handle */}
                        <div
                            className="absolute top-0 bottom-0 w-10 -ml-5 flex items-center justify-center cursor-col-resize z-30 group touch-none"
                            style={{ left: `${sliderPosition}%` }}
                        >
                            <div className="w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center transform transition-transform group-active:scale-110">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black opacity-60">
                                    <polyline points="15 18 9 12 15 6"></polyline>
                                    <polyline points="9 18 3 12 9 6"></polyline> {/* Arrows icon essentially */}
                                    <path d="M16 12h-2"></path> <path d="M8 12H6"></path>
                                </svg>
                                <div className="absolute w-0.5 h-6 bg-black/20 rounded-full" />
                            </div>
                        </div>
                    </div>

                    {/* Footer / Details */}
                    <div className="p-4 bg-surface-light shrink-0 border-t border-white/5">
                        <div className="flex justify-between items-center text-sm">
                            <div className="text-left">
                                <p className="text-xs text-text-secondary uppercase tracking-wider font-bold">Início</p>
                                <p className="font-bold text-white text-base">{new Date(beforePhoto.date).toLocaleDateString()}</p>
                                {beforePhoto.caption && <p className="text-xs text-text-secondary line-clamp-1 max-w-[120px]">{beforePhoto.caption}</p>}
                            </div>

                            <div className="px-3 py-1 bg-surface rounded-lg">
                                <span className="text-xs font-mono text-text-secondary">VS</span>
                            </div>

                            <div className="text-right">
                                <p className="text-xs text-text-secondary uppercase tracking-wider font-bold">Atual</p>
                                <p className="font-bold text-white text-base">{new Date(afterPhoto.date).toLocaleDateString()}</p>
                                {afterPhoto.caption && <p className="text-xs text-text-secondary line-clamp-1 max-w-[120px]">{afterPhoto.caption}</p>}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
