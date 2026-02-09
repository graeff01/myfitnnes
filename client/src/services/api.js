const API_BASE = import.meta.env.PROD ? '/api' : 'http://localhost:3000/api';

// Helper to get auth headers
const getAuthHeaders = () => {
    const token = localStorage.getItem('myfit_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
};

// ============================================
// AUTH API
// ============================================

export const login = async (username, password) => {
    const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to login');
    }
    const data = await response.json();
    localStorage.setItem('myfit_token', data.token);
    localStorage.setItem('myfit_user', JSON.stringify(data.user));
    return data;
};

export const register = async (username, password) => {
    const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to register');
    }
    const data = await response.json();
    localStorage.setItem('myfit_token', data.token);
    localStorage.setItem('myfit_user', JSON.stringify(data.user));
    return data;
};

export const logout = () => {
    localStorage.removeItem('myfit_token');
    localStorage.removeItem('myfit_user');
};

export const isAuthenticated = () => {
    return !!localStorage.getItem('myfit_token');
};

// ============================================
// WORKOUTS API
// ============================================

export const getWorkouts = async (startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await fetch(`${API_BASE}/workouts?${params}`, {
        headers: getAuthHeaders()
    });
    if (!response.ok) {
        if (response.status === 401) logout();
        throw new Error('Failed to fetch workouts');
    }
    return response.json();
};

export const getWorkoutsByDate = async (date) => {
    const response = await fetch(`${API_BASE}/workouts/date/${date}`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch workouts');
    return response.json();
};

export const getWeeklyStats = async (startDate) => {
    const params = startDate ? `?startDate=${startDate}` : '';
    const response = await fetch(`${API_BASE}/workouts/stats/weekly${params}`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch weekly stats');
    return response.json();
};

export const getMonthlyStats = async (month) => {
    const params = month ? `?month=${month}` : '';
    const response = await fetch(`${API_BASE}/workouts/stats/monthly${params}`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch monthly stats');
    return response.json();
};

export const getStreak = async () => {
    const response = await fetch(`${API_BASE}/workouts/stats/streak`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch streak');
    return response.json();
};

export const logWorkout = async (arg1, arg2, arg3) => {
    let date, muscle_groups, notes;

    // Check if first arg is an object (new format)
    if (typeof arg1 === 'object' && !Array.isArray(arg1)) {
        date = arg1.date || formatDate();
        muscle_groups = arg1.muscle_groups || arg1.muscleGroups;
        notes = arg1.notes || '';
    } else {
        muscle_groups = arg1;
        notes = arg2 || '';
        date = arg3 || formatDate();
    }

    const response = await fetch(`${API_BASE}/workouts`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
            date,
            muscle_groups: Array.isArray(muscle_groups) ? muscle_groups : [muscle_groups],
            notes
        })
    });

    if (!response.ok) throw new Error('Failed to log workout');
    return response.json();
};

export const updateWorkout = async (id, arg1, arg2) => {
    let muscle_groups, notes;

    if (typeof arg1 === 'object' && !Array.isArray(arg1)) {
        muscle_groups = arg1.muscle_groups || arg1.muscleGroups;
        notes = arg1.notes || '';
    } else {
        muscle_groups = arg1;
        notes = arg2 || '';
    }

    const response = await fetch(`${API_BASE}/workouts/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
            muscle_groups: Array.isArray(muscle_groups) ? muscle_groups : [muscle_groups],
            notes
        })
    });

    if (!response.ok) throw new Error('Failed to update workout');
    return response.json();
};

export const deleteWorkout = async (id) => {
    const response = await fetch(`${API_BASE}/workouts/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });

    if (!response.ok) throw new Error('Failed to delete workout');
    return response.json();
};

export const getSettings = async () => {
    const response = await fetch(`${API_BASE}/workouts/settings`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch settings');
    return response.json();
};

export const updateSettings = async (weeklyGoal) => {
    const response = await fetch(`${API_BASE}/workouts/settings`, {
        method: 'PUT',
        headers: getAuthHeaders(),
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

    const response = await fetch(`${API_BASE}/metrics/weight?${params}`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch weight logs');
    return response.json();
};

export const logWeight = async (arg1, arg2, arg3) => {
    let date, weight, notes;

    if (typeof arg1 === 'object') {
        ({ date = formatDate(), weight, notes = '' } = arg1);
    } else {
        weight = arg1;
        notes = arg2 || '';
        date = arg3 || formatDate();
    }

    const response = await fetch(`${API_BASE}/metrics/weight`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ date, weight, notes })
    });

    if (!response.ok) throw new Error('Failed to log weight');
    return response.json();
};

export const deleteWeightLog = async (id) => {
    const response = await fetch(`${API_BASE}/metrics/weight/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
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

    const response = await fetch(`${API_BASE}/metrics/measurements?${params}`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch measurements');
    return response.json();
};

export const logMeasurements = async (arg1, arg2, arg3) => {
    let date, measurements, notes;

    if (typeof arg1 === 'object' && !arg1.chest && !arg1.waist) { // Wrapped object
        ({ date = formatDate(), notes = '', ...measurements } = arg1);
    } else if (typeof arg1 === 'object') { // Direct measurements object
        measurements = arg1;
        notes = arg2 || '';
        date = arg3 || formatDate();
    }

    const response = await fetch(`${API_BASE}/metrics/measurements`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ date, ...measurements, notes })
    });

    if (!response.ok) throw new Error('Failed to log measurements');
    return response.json();
};

export const deleteMeasurement = async (id) => {
    const response = await fetch(`${API_BASE}/metrics/measurements/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });

    if (!response.ok) throw new Error('Failed to delete measurement');
    return response.json();
};

// ============================================
// HYDRATION API
// ============================================

export const getHydration = async (date) => {
    const response = await fetch(`${API_BASE}/hydration/${date}`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch hydration');
    return response.json();
};

// Evolution Photos
export const getPhotos = async () => {
    try {
        const response = await fetch(`${API_BASE}/metrics/photos`, { headers: getAuthHeaders() });
        return await response.json();
    } catch (error) {
        console.error('Error fetching photos:', error);
        throw error;
    }
};

export const uploadPhoto = async (photoData) => {
    try {
        const response = await fetch(`${API_BASE}/metrics/photos`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(photoData)
        });
        return await response.json();
    } catch (error) {
        console.error('Error uploading photo:', error);
        throw error;
    }
};

export const deletePhoto = async (id) => {
    try {
        const response = await fetch(`${API_BASE}/metrics/photos/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        return await response.json();
    } catch (error) {
        console.error('Error deleting photo:', error);
        throw error;
    }
};

export const logHydration = async (arg1, arg2, arg3) => {
    let date, volume_ml, goal_ml;

    if (typeof arg1 === 'object') {
        date = arg1.date || formatDate();
        volume_ml = arg1.volume !== undefined ? arg1.volume : arg1.volume_ml;
        goal_ml = arg1.goal !== undefined ? arg1.goal : arg1.goal_ml;
    } else {
        volume_ml = arg1;
        goal_ml = arg2 || 2500;
        date = arg3 || formatDate();
    }

    const response = await fetch(`${API_BASE}/hydration`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ date, volume_ml, goal_ml })
    });

    if (!response.ok) throw new Error('Failed to update hydration');
    return response.json();
};

// Alias for backward compatibility
export const updateHydration = logHydration;
