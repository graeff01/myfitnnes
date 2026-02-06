const API_BASE = import.meta.env.PROD ? '/api' : 'http://localhost:3000/api';

// Helper to format dates as YYYY-MM-DD
export const formatDate = (date = new Date()) => {
    return date.toISOString().split('T')[0];
};

// ============================================
// WORKOUTS API
// ============================================

export const getWorkouts = async (startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await fetch(`${API_BASE}/workouts?${params}`);
    if (!response.ok) throw new Error('Failed to fetch workouts');
    return response.json();
};

export const getWorkoutsByDate = async (date) => {
    const response = await fetch(`${API_BASE}/workouts/date/${date}`);
    if (!response.ok) throw new Error('Failed to fetch workouts');
    return response.json();
};

export const getWeeklyStats = async (startDate) => {
    const params = startDate ? `?startDate=${startDate}` : '';
    const response = await fetch(`${API_BASE}/workouts/stats/weekly${params}`);
    if (!response.ok) throw new Error('Failed to fetch weekly stats');
    return response.json();
};

export const getMonthlyStats = async (month) => {
    const params = month ? `?month=${month}` : '';
    const response = await fetch(`${API_BASE}/workouts/stats/monthly${params}`);
    if (!response.ok) throw new Error('Failed to fetch monthly stats');
    return response.json();
};

export const getStreak = async () => {
    const response = await fetch(`${API_BASE}/workouts/stats/streak`);
    if (!response.ok) throw new Error('Failed to fetch streak');
    return response.json();
};

export const logWorkout = async (muscleGroups, notes = '', date = formatDate()) => {
    const response = await fetch(`${API_BASE}/workouts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            date,
            muscle_groups: Array.isArray(muscleGroups) ? muscleGroups : [muscleGroups],
            notes
        })
    });

    if (!response.ok) throw new Error('Failed to log workout');
    return response.json();
};

export const updateWorkout = async (id, muscleGroups, notes = '') => {
    const response = await fetch(`${API_BASE}/workouts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            muscle_groups: Array.isArray(muscleGroups) ? muscleGroups : [muscleGroups],
            notes
        })
    });

    if (!response.ok) throw new Error('Failed to update workout');
    return response.json();
};

export const deleteWorkout = async (id) => {
    const response = await fetch(`${API_BASE}/workouts/${id}`, {
        method: 'DELETE'
    });

    if (!response.ok) throw new Error('Failed to delete workout');
    return response.json();
};

export const getSettings = async () => {
    const response = await fetch(`${API_BASE}/workouts/settings`);
    if (!response.ok) throw new Error('Failed to fetch settings');
    return response.json();
};

export const updateSettings = async (weeklyGoal) => {
    const response = await fetch(`${API_BASE}/workouts/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weekly_goal: weeklyGoal })
    });

    if (!response.ok) throw new Error('Failed to update settings');
    return response.json();
};

// ============================================
// WEIGHT TRACKING API
// ============================================

export const getWeightLogs = async (startDate, endDate, limit) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (limit) params.append('limit', limit);

    const response = await fetch(`${API_BASE}/metrics/weight?${params}`);
    if (!response.ok) throw new Error('Failed to fetch weight logs');
    return response.json();
};

export const logWeight = async (weight, notes = '', date = formatDate()) => {
    const response = await fetch(`${API_BASE}/metrics/weight`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, weight, notes })
    });

    if (!response.ok) throw new Error('Failed to log weight');
    return response.json();
};

export const deleteWeightLog = async (id) => {
    const response = await fetch(`${API_BASE}/metrics/weight/${id}`, {
        method: 'DELETE'
    });

    if (!response.ok) throw new Error('Failed to delete weight log');
    return response.json();
};

// ============================================
// MEASUREMENTS API
// ============================================

export const getMeasurements = async (startDate, endDate, limit) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (limit) params.append('limit', limit);

    const response = await fetch(`${API_BASE}/metrics/measurements?${params}`);
    if (!response.ok) throw new Error('Failed to fetch measurements');
    return response.json();
};

export const logMeasurements = async (measurements, notes = '', date = formatDate()) => {
    const response = await fetch(`${API_BASE}/metrics/measurements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, ...measurements, notes })
    });

    if (!response.ok) throw new Error('Failed to log measurements');
    return response.json();
};

export const deleteMeasurement = async (id) => {
    const response = await fetch(`${API_BASE}/metrics/measurements/${id}`, {
        method: 'DELETE'
    });

    if (!response.ok) throw new Error('Failed to delete measurement');
    return response.json();
};

// ============================================
// HYDRATION API
// ============================================

export const getHydration = async (date) => {
    const response = await fetch(`${API_BASE}/hydration/${date}`);
    if (!response.ok) throw new Error('Failed to fetch hydration');
    return response.json();
};

export const updateHydration = async (volume_ml, goal_ml = 2500, date = formatDate()) => {
    const response = await fetch(`${API_BASE}/hydration`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, volume_ml, goal_ml })
    });

    if (!response.ok) throw new Error('Failed to update hydration');
    return response.json();
};
