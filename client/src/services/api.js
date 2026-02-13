const API_BASE = import.meta.env.PROD ? '/api' : 'http://localhost:3000/api';

// Helper to format date as YYYY-MM-DD (local time)
export function formatDate(date = new Date()) {
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
}

// Helper to get auth headers
const getAuthHeaders = () => {
    const token = localStorage.getItem('myfit_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
};

const handleResponse = async (response) => {
    if (!response.ok) {
        let errorData;
        try {
            errorData = await response.json();
        } catch (e) {
            throw new Error(response.statusText || 'Erro na requisição');
        }

        const errorMsg = errorData.details
            ? `${errorData.error}: ${errorData.details}`
            : (errorData.error || 'Erro desconhecido');
        throw new Error(errorMsg);
    }
    return response.json();
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
    return handleResponse(response);
};

export const getWorkoutsByDate = async (date) => {
    const response = await fetch(`${API_BASE}/workouts/date/${date}`, { headers: getAuthHeaders() });
    return handleResponse(response);
};

export const getWeeklyStats = async () => {
    const response = await fetch(`${API_BASE}/workouts/stats/weekly`, {
        headers: getAuthHeaders()
    });
    return handleResponse(response);
};

export const getMonthlyStats = async (month) => {
    const params = month ? `?month=${month}` : '';
    const response = await fetch(`${API_BASE}/workouts/stats/monthly${params}`, { headers: getAuthHeaders() });
    return handleResponse(response);
};

export const getStreak = async () => {
    const response = await fetch(`${API_BASE}/workouts/stats/streak`, { headers: getAuthHeaders() });
    return handleResponse(response);
};

export const logWorkout = async (arg1, arg2, arg3) => {
    let date, muscle_groups, notes;
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
    return handleResponse(response);
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
    return handleResponse(response);
};

export const deleteWorkout = async (id) => {
    const response = await fetch(`${API_BASE}/workouts/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    return handleResponse(response);
};

export const getSettings = async () => {
    const response = await fetch(`${API_BASE}/workouts/settings`, { headers: getAuthHeaders() });
    return handleResponse(response);
};

export const updateSettings = async (settings) => {
    const response = await fetch(`${API_BASE}/workouts/settings`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(settings)
    });
    return handleResponse(response);
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
    return handleResponse(response);
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
    return handleResponse(response);
};

export const deleteWeightLog = async (id) => {
    const response = await fetch(`${API_BASE}/metrics/weight/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    return handleResponse(response);
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
    return handleResponse(response);
};

export const logMeasurements = async (arg1, arg2, arg3) => {
    let date, measurements, notes;
    if (typeof arg1 === 'object' && !arg1.chest && !arg1.waist) {
        ({ date = formatDate(), notes = '', ...measurements } = arg1);
    } else if (typeof arg1 === 'object') {
        measurements = arg1;
        notes = arg2 || '';
        date = arg3 || formatDate();
    }
    const response = await fetch(`${API_BASE}/metrics/measurements`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ date, ...measurements, notes })
    });
    return handleResponse(response);
};

export const deleteMeasurement = async (id) => {
    const response = await fetch(`${API_BASE}/metrics/measurements/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    return handleResponse(response);
};

// ============================================
// HYDRATION API
// ============================================

export const getHydration = async (date) => {
    const response = await fetch(`${API_BASE}/hydration/${date}`, { headers: getAuthHeaders() });
    return handleResponse(response);
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
    return handleResponse(response);
};

export const updateHydration = logHydration;

// Evolution Photos
export const getPhotos = async () => {
    const response = await fetch(`${API_BASE}/metrics/photos`, { headers: getAuthHeaders() });
    return handleResponse(response);
};

export const uploadPhoto = async (photoData) => {
    const response = await fetch(`${API_BASE}/metrics/photos`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(photoData)
    });
    return handleResponse(response);
};

export const deletePhoto = async (id) => {
    const response = await fetch(`${API_BASE}/metrics/photos/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    return handleResponse(response);
};
