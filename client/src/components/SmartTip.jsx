import { motion } from 'framer-motion';

const SmartTip = ({ recommendation }) => {
    if (!recommendation) return null;

    const { muscle, icon, message, daysText } = recommendation;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            whileHover={{ scale: 1.02, rotate: [0, -1, 1, 0] }}
            className="group relative overflow-hidden rounded-[2rem] p-[1.5px] bg-gradient-to-br from-primary via-tertiary to-secondary shadow-lg shadow-primary/20"
        >
            {/* Pulsing Highlight Background */}
            <motion.div
                animate={{
                    opacity: [0.3, 0.6, 0.3],
                    scale: [1, 1.1, 1]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 bg-primary/20 blur-xl pointer-events-none"
            />

            <div className="relative bg-surface p-4 flex items-center gap-4 rounded-[1.95rem] overflow-hidden">
                {/* Floating Icon Container */}
                <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="flex-none w-14 h-14 bg-gradient-to-tr from-primary/20 to-tertiary/20 rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-white/10"
                >
                    {icon}
                </motion.div>

                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary bg-primary/10 px-2 py-0.5 rounded-full">Insights</span>
                        <motion.span
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="w-1.5 h-1.5 rounded-full bg-secondary shadow-[0_0_8px_#92E82A]"
                        />
                    </div>

                    <p className="text-sm font-medium text-text-primary leading-tight">
                        {message} <motion.span
                            animate={{ color: ['#FA114F', '#00D9FF', '#FA114F'] }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="font-black uppercase italic"
                        >
                            {muscle}
                        </motion.span> {daysText}.
                    </p>

                    <p className="text-[11px] text-text-secondary mt-1 font-bold italic flex items-center gap-1">
                        🚀 Foco total hoje!
                    </p>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 -mr-4 -mt-4 w-16 h-16 bg-primary/10 blur-2xl rounded-full" />
                <div className="absolute bottom-0 left-1/2 -ml-8 -mb-4 w-24 h-8 bg-tertiary/10 blur-xl rounded-full" />
            </div>
        </motion.div>
    );
};

export default SmartTip;
