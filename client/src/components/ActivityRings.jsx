import { motion } from 'framer-motion';

const ActivityRings = ({ weeklyProgress = 0, monthlyProgress = 0, streak = 0 }) => {
    const ringSize = 175;
    const strokeWidth = 14;
    const center = ringSize / 2;

    // Calculate ring radii
    const outerRadius = center - strokeWidth / 2 - 5;
    const middleRadius = outerRadius - strokeWidth - 8;
    const innerRadius = middleRadius - strokeWidth - 8;

    // Calculate circumferences
    const outerCircumference = 2 * Math.PI * outerRadius;
    const middleCircumference = 2 * Math.PI * middleRadius;
    const innerCircumference = 2 * Math.PI * innerRadius;

    // Calculate dash offsets (progress)
    const outerOffset = outerCircumference * (1 - monthlyProgress / 100);
    const middleOffset = middleCircumference * (1 - weeklyProgress / 100);
    const innerOffset = innerCircumference * (1 - Math.min(streak / 30, 1)); // Max 30 day streak

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative" style={{ width: ringSize, height: ringSize }}>
                <svg width={ringSize} height={ringSize} className="transform -rotate-90">
                    {/* Outer Ring - Monthly Progress */}
                    <circle
                        cx={center}
                        cy={center}
                        r={outerRadius}
                        fill="none"
                        stroke="#1C1C1E"
                        strokeWidth={strokeWidth}
                    />
                    <motion.circle
                        cx={center}
                        cy={center}
                        r={outerRadius}
                        fill="none"
                        stroke="#FA114F"
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={outerCircumference}
                        initial={{ strokeDashoffset: outerCircumference }}
                        animate={{ strokeDashoffset: outerOffset }}
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                    />

                    {/* Middle Ring - Weekly Progress */}
                    <circle
                        cx={center}
                        cy={center}
                        r={middleRadius}
                        fill="none"
                        stroke="#1C1C1E"
                        strokeWidth={strokeWidth}
                    />
                    <motion.circle
                        cx={center}
                        cy={center}
                        r={middleRadius}
                        fill="none"
                        stroke="#92E82A"
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={middleCircumference}
                        initial={{ strokeDashoffset: middleCircumference }}
                        animate={{ strokeDashoffset: middleOffset }}
                        transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }}
                    />

                    {/* Inner Ring - Streak */}
                    <circle
                        cx={center}
                        cy={center}
                        r={innerRadius}
                        fill="none"
                        stroke="#1C1C1E"
                        strokeWidth={strokeWidth}
                    />
                    <motion.circle
                        cx={center}
                        cy={center}
                        r={innerRadius}
                        fill="none"
                        stroke="#00D9FF"
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={innerCircumference}
                        initial={{ strokeDashoffset: innerCircumference }}
                        animate={{ strokeDashoffset: innerOffset }}
                        transition={{ duration: 1.5, ease: 'easeOut', delay: 0.4 }}
                    />
                </svg>

                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6 }}
                        className="text-center"
                    >
                        <div className="text-3xl font-bold">{Math.round(monthlyProgress)}%</div>
                        <div className="text-[10px] text-text-secondary mt-0.5">Este mês</div>
                    </motion.div>
                </div>
            </div>

            {/* Ring Labels */}
            <div className="flex gap-6 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                    <span className="text-text-secondary">Mês</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-secondary"></div>
                    <span className="text-text-secondary">Semana</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-tertiary"></div>
                    <span className="text-text-secondary">{streak}d streak</span>
                </div>
            </div>
        </div>
    );
};

export default ActivityRings;
