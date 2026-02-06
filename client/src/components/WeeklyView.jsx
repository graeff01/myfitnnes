import { motion } from 'framer-motion';
import { muscleGroups } from './MuscleGroupSelector';

const WeeklyView = ({ weeklyData = [], onDayClick }) => {
    const days = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
    const today = new Date().getDay();

    // Get last 7 days
    const getLast7Days = () => {
        const result = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            result.push({
                date: date.toISOString().split('T')[0],
                dayOfWeek: date.getDay(),
                dayLabel: days[date.getDay()]
            });
        }
        return result;
    };

    const last7Days = getLast7Days();

    // Map workout data to days
    const getDayWorkouts = (dateStr) => {
        const dayData = weeklyData.find(w => w.date === dateStr);
        if (!dayData) return [];
        return dayData.muscle_groups ? dayData.muscle_groups.split(',') : [];
    };

    const getColorForMuscle = (muscle) => {
        const group = muscleGroups.find(g => g.id === muscle);
        return group ? group.color : '888888';
    };

    return (
        <div className="card">
            <h3 className="text-lg font-semibold mb-4">Última Semana</h3>
            <div className="grid grid-cols-7 gap-1">
                {last7Days.map((day, index) => {
                    const workouts = getDayWorkouts(day.date);
                    const isToday = day.dayOfWeek === today;

                    return (
                        <motion.button
                            key={day.date}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onDayClick && onDayClick(day.date)}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex flex-col items-center gap-2 p-1 rounded-lg hover:bg-surface-light transition-colors w-full"
                        >
                            <div className="text-xs text-text-secondary font-medium">
                                {day.dayLabel}
                            </div>
                            <div
                                className={`aspect-square w-full max-w-[40px] rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isToday ? 'border-tertiary bg-surface' : workouts.length > 0 ? 'border-transparent bg-surface-light' : 'border-transparent bg-surface-light opacity-50'
                                    }`}
                                style={{
                                    borderColor: workouts.length > 0 ? `#${getColorForMuscle(workouts[0])}` : (isToday ? '' : 'transparent')
                                }}
                            >
                                {workouts.length > 0 ? (
                                    <span className="text-xs font-bold">{workouts.length}</span>
                                ) : (
                                    <span className="text-[10px] text-text-secondary">-</span>
                                )}
                            </div>

                            <div className="flex gap-0.5 h-1.5 justify-center w-full px-0.5">
                                {workouts.length > 0 && workouts.slice(0, 3).map((muscle, i) => (
                                    <div
                                        key={i}
                                        className="w-1.5 h-1.5 rounded-full"
                                        style={{ backgroundColor: `#${getColorForMuscle(muscle)}` }}
                                    />
                                ))}
                            </div>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
};

export default WeeklyView;
