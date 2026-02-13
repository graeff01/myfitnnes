const express = require('express');
const router = express.Router();
const { allAsync, getAsync, runAsync } = require('../config/database');
const authenticateToken = require('../middleware/auth');

router.use(authenticateToken);

// Get all workouts (with optional date range)
router.get('/', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const userId = req.user.id;

        let query = 'SELECT * FROM workouts WHERE user_id = ?';
        const params = [userId];

        if (startDate && endDate) {
            query += ' AND date BETWEEN ? AND ?';
            params.push(startDate, endDate);
        } else if (startDate) {
            query += ' AND date >= ?';
            params.push(startDate);
        }

        query += ' ORDER BY date DESC, created_at DESC';

        const workouts = await allAsync(query, params);
        res.json(workouts);
    } catch (error) {
        console.error('Error fetching workouts:', error);
        res.status(500).json({ error: 'Failed to fetch workouts', details: error.message });
    }
});

// Get workouts for a specific date
router.get('/date/:date', async (req, res) => {
    try {
        const { date } = req.params;
        const userId = req.user.id;
        const workouts = await allAsync('SELECT * FROM workouts WHERE date = ? AND user_id = ? ORDER BY created_at DESC', [date, userId]);
        res.json(workouts);
    } catch (error) {
        console.error('Error fetching workouts for date:', error);
        res.status(500).json({ error: 'Failed to fetch workouts', details: error.message });
    }
});

// Get weekly statistics
router.get('/stats/weekly', async (req, res) => {
    try {
        const { startDate } = req.query;
        const userId = req.user.id;

        // If no start date provided, use current week
        const start = startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const end = new Date().toISOString().split('T')[0];

        const stats = await allAsync(`
      SELECT 
        date,
        muscle_groups,
        notes,
        COUNT(*) as workout_count
      FROM workouts
      WHERE user_id = ? AND date BETWEEN ? AND ?
      GROUP BY date
      ORDER BY date ASC
    `, [userId, start, end]);

        res.json(stats);
    } catch (error) {
        console.error('Error fetching weekly stats:', error);
        res.status(500).json({ error: 'Failed to fetch weekly stats', details: error.message });
    }
});

// Get monthly statistics
router.get('/stats/monthly', async (req, res) => {
    try {
        const { month } = req.query; // Format: YYYY-MM
        const userId = req.user.id;

        // If no month provided, use current month
        const targetMonth = month || new Date().toISOString().slice(0, 7);

        const workouts = await allAsync(`
      SELECT muscle_groups
      FROM workouts
      WHERE user_id = ? AND strftime('%Y-%m', date) = ?
    `, [userId, targetMonth]);

        // Count muscle groups
        const muscleGroupCount = {};
        workouts.forEach(w => {
            const groups = w.muscle_groups.split(',');
            groups.forEach(group => {
                muscleGroupCount[group] = (muscleGroupCount[group] || 0) + 1;
            });
        });

        const totalDays = await getAsync(`
      SELECT COUNT(DISTINCT date) as training_days
      FROM workouts
      WHERE user_id = ? AND strftime('%Y-%m', date) = ?
    `, [userId, targetMonth]);

        res.json({
            month: targetMonth,
            training_days: totalDays?.training_days || 0,
            muscle_groups: Object.entries(muscleGroupCount).map(([muscle_group, count]) => ({
                muscle_group,
                count
            })),
            most_trained: Object.entries(muscleGroupCount).sort((a, b) => b[1] - a[1])[0]?.[0] || null
        });
    } catch (error) {
        console.error('Error fetching monthly stats:', error);
        res.status(500).json({ error: 'Failed to fetch monthly stats', details: error.message });
    }
});

// Get current streak
router.get('/stats/streak', async (req, res) => {
    try {
        const userId = req.user.id;
        const allDates = await allAsync(`
      SELECT DISTINCT date 
      FROM workouts 
      WHERE user_id = ?
      ORDER BY date DESC
    `, [userId]);

        if (allDates.length === 0) {
            return res.json({ streak: 0 });
        }

        let streak = 0;
        const today = new Date().toISOString().split('T')[0];
        let currentDate = new Date(today);

        for (const { date } of allDates) {
            const workoutDate = new Date(date);
            const diffDays = Math.floor((currentDate - workoutDate) / (1000 * 60 * 60 * 24));

            if (diffDays === 0 || diffDays === 1) {
                streak++;
                currentDate = workoutDate;
            } else {
                break;
            }
        }

        res.json({ streak });
    } catch (error) {
        console.error('Error calculating streak:', error);
        res.status(500).json({ error: 'Failed to calculate streak' });
    }
});

// Log a new workout
router.post('/', async (req, res) => {
    try {
        const { date, muscle_groups, notes } = req.body;
        const userId = req.user.id;

        if (!date || !muscle_groups || muscle_groups.length === 0) {
            return res.status(400).json({ error: 'Date and at least one muscle_group are required' });
        }

        // Validate muscle groups
        const validGroups = ['peito', 'costas', 'pernas', 'ombros', 'biceps', 'triceps', 'abdomen', 'cardio', 'alongamento'];
        const groupsArray = Array.isArray(muscle_groups) ? muscle_groups : [muscle_groups];

        for (const group of groupsArray) {
            if (!validGroups.includes(group)) {
                return res.status(400).json({ error: `Invalid muscle group: ${group}` });
            }
        }

        const muscleGroupsStr = groupsArray.join(',');

        const result = await runAsync(`
      INSERT INTO workouts (user_id, date, muscle_groups, notes)
      VALUES (?, ?, ?, ?)
    `, [userId, date, muscleGroupsStr, notes || null]);

        const workout = await getAsync('SELECT * FROM workouts WHERE id = ? AND user_id = ?', [result.lastID, userId]);

        res.status(201).json(workout);
    } catch (error) {
        console.error('Error logging workout:', error);
        res.status(500).json({ error: 'Failed to log workout' });
    }
});

// Update a workout
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { muscle_groups, notes } = req.body;
        const userId = req.user.id;

        if (!muscle_groups || muscle_groups.length === 0) {
            return res.status(400).json({ error: 'At least one muscle_group is required' });
        }

        const validGroups = ['peito', 'costas', 'pernas', 'ombros', 'biceps', 'triceps', 'abdomen', 'cardio', 'alongamento'];
        const groupsArray = Array.isArray(muscle_groups) ? muscle_groups : [muscle_groups];

        for (const group of groupsArray) {
            if (!validGroups.includes(group)) {
                return res.status(400).json({ error: `Invalid muscle group: ${group}` });
            }
        }

        const muscleGroupsStr = groupsArray.join(',');

        const result = await runAsync(`
      UPDATE workouts 
      SET muscle_groups = ?, notes = ?
      WHERE id = ? AND user_id = ?
    `, [muscleGroupsStr, notes || null, id, userId]);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Workout not found or unauthorized' });
        }

        const workout = await getAsync('SELECT * FROM workouts WHERE id = ? AND user_id = ?', [id, userId]);
        res.json(workout);
    } catch (error) {
        console.error('Error updating workout:', error);
        res.status(500).json({ error: 'Failed to update workout' });
    }
});

// Delete a workout
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const result = await runAsync('DELETE FROM workouts WHERE id = ? AND user_id = ?', [id, userId]);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Workout not found or unauthorized' });
        }

        res.json({ message: 'Workout deleted successfully' });
    } catch (error) {
        console.error('Error deleting workout:', error);
        res.status(500).json({ error: 'Failed to delete workout' });
    }
});

// Get user settings
router.get('/settings', async (req, res) => {
    try {
        const userId = req.user.id;
        const settings = await getAsync('SELECT * FROM settings WHERE user_id = ?', [userId]);
        res.json(settings || { weekly_goal: 4 });
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ error: 'Failed to fetch settings', details: error.message });
    }
});

// Update user settings
router.put('/settings', async (req, res) => {
    try {
        const { weekly_goal, weight_goal } = req.body;
        const userId = req.user.id;

        const existing = await getAsync('SELECT id FROM settings WHERE user_id = ?', [userId]);

        if (existing) {
            let query = 'UPDATE settings SET ';
            const params = [];
            const updates = [];

            if (weekly_goal) {
                updates.push('weekly_goal = ?');
                params.push(weekly_goal);
            }
            if (weight_goal) {
                updates.push('weight_goal = ?');
                params.push(weight_goal);
            }

            if (updates.length === 0) return res.status(400).json({ error: 'No settings to update' });

            query += updates.join(', ') + ', updated_at = CURRENT_TIMESTAMP WHERE user_id = ?';
            params.push(userId);

            await runAsync(query, params);
        } else {
            // Default 4 days if creating new and weekly_goal not provided
            await runAsync(`
                INSERT INTO settings (user_id, weekly_goal, weight_goal)
                VALUES (?, ?, ?)
            `, [userId, weekly_goal || 4, weight_goal || null]);
        }

        const updated = await getAsync('SELECT * FROM settings WHERE user_id = ?', [userId]);
        res.json(updated);
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ error: 'Failed to update settings', details: error.message });
    }
});

module.exports = router;
