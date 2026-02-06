import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { muscleGroups } from './MuscleGroupSelector';

const MonthlyView = ({ workouts = [], onDayClick }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Get first day of month and total days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Month names
    const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    // Get workouts for a specific date
    const getWorkoutsForDate = (day) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return workouts.filter(w => w.date === dateStr);
    };

    const getColorForMuscle = (muscle) => {
        const group = muscleGroups.find(g => g.id === muscle);
        return group ? group.color : '888888';
    };

    // Navigate months
    const previousMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    // Create calendar grid
    const calendarDays = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
        calendarDays.push(<div key={`empty-${i}`} className="aspect-square" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayWorkouts = getWorkoutsForDate(day);
        const isToday =
            day === new Date().getDate() &&
            month === new Date().getMonth() &&
            year === new Date().getFullYear();

        // Get all muscle groups for the day
        const allMuscles = dayWorkouts.flatMap(w => w.muscle_groups.split(','));

        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        calendarDays.push(
            <motion.button
                key={day}
                whileTap={{ scale: 0.9 }}
                onClick={() => onDayClick && onDayClick(dateStr)}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: day * 0.01 }}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center relative hover:bg-white/5 transition-colors ${isToday ? 'bg-surface ring-2 ring-tertiary' : dayWorkouts.length > 0 ? 'bg-surface-light' : ''
                    }`}
            >
                <span className={`text-sm font-medium ${dayWorkouts.length > 0 ? 'text-text-primary' : 'text-text-secondary'}`}>
                    {day}
                </span>
                {allMuscles.length > 0 && (
                    <div className="flex gap-0.5 mt-1 flex-wrap justify-center px-1">
                        {allMuscles.slice(0, 4).map((muscle, i) => (
                            <div
                                key={i}
                                className="w-1 h-1 rounded-full"
                                style={{ backgroundColor: `#${getColorForMuscle(muscle)}` }}
                            />
                        ))}
                    </div>
                )}
            </motion.button>
        );
    }

    return (
        <div className="card">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={previousMonth}
                    className="p-2 rounded-full hover:bg-surface-light transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h3 className="text-xl font-bold">
                    {monthNames[month]} {year}
                </h3>
                <button
                    onClick={nextMonth}
                    className="p-2 rounded-full hover:bg-surface-light transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>

            {/* Day labels */}
            <div className="grid grid-cols-7 gap-2 mb-2">
                {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
                    <div key={i} className="text-center text-xs text-text-secondary font-medium">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-2">
                {calendarDays}
            </div>
        </div>
    );
};

export default MonthlyView;
