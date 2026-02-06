import { motion } from 'framer-motion';

const muscleGroups = [
    { id: 'perna', label: '🦵 Perna', color: 'bg-perna' },
    { id: 'peito', label: '💪 Peito', color: 'bg-peito' },
    { id: 'costas', label: '🔙 Costas', color: 'bg-costas' },
    { id: 'ombro', label: '🏋️ Ombro', color: 'bg-ombro' },
    { id: 'braco', label: '💪 Braço', color: 'bg-braco' },
    { id: 'cardio', label: '❤️ Cardio', color: 'bg-cardio' },
];

const MuscleGroupButton = ({ muscleGroup, onClick, isLoading }) => {
    const group = muscleGroups.find(g => g.id === muscleGroup);

    const handleClick = () => {
        // Haptic feedback (vibration)
        if (navigator.vibrate) {
            navigator.vibrate(10);
        }
        onClick(muscleGroup);
    };

    return (
        <motion.button
            className={`muscle-btn ${group.color} ${isLoading ? 'opacity-50' : ''}`}
            onClick={handleClick}
            disabled={isLoading}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <span className="text-3xl">{group.label.split(' ')[0]}</span>
            <span className="text-base font-medium">{group.label.split(' ')[1]}</span>
        </motion.button>
    );
};

const MuscleGroupGrid = ({ onLogWorkout, isLoading }) => {
    return (
        <div className="grid grid-cols-2 gap-4 w-full max-w-md">
            {muscleGroups.map((group, index) => (
                <motion.div
                    key={group.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                >
                    <MuscleGroupButton
                        muscleGroup={group.id}
                        onClick={onLogWorkout}
                        isLoading={isLoading}
                    />
                </motion.div>
            ))}
        </div>
    );
};

export default MuscleGroupGrid;
export { muscleGroups };
