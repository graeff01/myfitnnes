import { motion } from 'framer-motion';

const SmartTip = ({ recommendation }) => {
    if (!recommendation) return null;

    const { muscle, icon, message, daysText } = recommendation;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-primary/10 border border-primary/20 rounded-2xl p-3 flex items-center gap-3 relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 p-1 opacity-5">
                <span className="text-4xl">{icon}</span>
            </div>

            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center text-xl relative z-10">
                {icon}
            </div>

            <div className="flex-1 relative z-10">
                <p className="text-xs text-text-primary leading-tight">
                    {message} <span className="font-bold text-primary capitalize">{muscle}</span> {daysText}.
                </p>
                <p className="text-[10px] text-text-secondary mt-0.5 font-medium italic">
                    Que tal focar nisso hoje? 💪
                </p>
            </div>
        </motion.div>
    );
};

export default SmartTip;
