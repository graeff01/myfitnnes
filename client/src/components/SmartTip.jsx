import { motion } from 'framer-motion';

const SmartTip = ({ recommendation }) => {
    if (!recommendation) return null;

    const { muscle, days, icon } = recommendation;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 p-1 opacity-10">
                <span className="text-6xl">{icon}</span>
            </div>

            <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center text-2xl relative z-10">
                {icon}
            </div>

            <div className="flex-1 relative z-10">
                <p className="text-sm text-text-primary leading-tight">
                    Você não treina <span className="font-bold text-primary capitalize">{muscle}</span> há <span className="font-bold">{days} {days === 1 ? 'dia' : 'dias'}</span>.
                </p>
                <p className="text-xs text-text-secondary mt-1 font-medium italic">
                    Que tal focar nisso hoje? 💪
                </p>
            </div>
        </motion.div>
    );
};

export default SmartTip;
