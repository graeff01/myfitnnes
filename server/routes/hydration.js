const express = require('express');
const router = express.Router();
const { getAsync, runAsync } = require('../config/database');
const authenticateToken = require('../middleware/auth');

router.use(authenticateToken);

// Get hydration for a specific date
router.get('/:date', async (req, res) => {
    try {
        const { date } = req.params;
        const userId = req.user.id;
        const log = await getAsync('SELECT * FROM hydration_logs WHERE date = ? AND user_id = ?', [date, userId]);

        if (!log) {
            // Return default if no log exists
            return res.json({ date, volume_ml: 0, goal_ml: 2500 }); // Default 2500ml goal
        }

        // Fallback for old records without volume_ml
        if (log.volume_ml === undefined || log.volume_ml === null) {
            log.volume_ml = (log.glasses || 0) * 250; // Assume 250ml per glass
            log.goal_ml = (log.goal || 8) * 250;
        }

        res.json(log);
    } catch (error) {
        console.error('Error fetching hydration:', error);
        res.status(500).json({ error: 'Failed to fetch hydration', details: error.message });
    }
});

// Update hydration
router.post('/', async (req, res) => {
    try {
        const { date, volume_ml, goal_ml } = req.body;
        const userId = req.user.id;

        if (!date || volume_ml === undefined) {
            return res.status(400).json({ error: 'Date and volume_ml are required' });
        }

        const existing = await getAsync('SELECT id FROM hydration_logs WHERE date = ? AND user_id = ?', [date, userId]);

        if (existing) {
            await runAsync(
                'UPDATE hydration_logs SET volume_ml = ?, goal_ml = ? WHERE date = ? AND user_id = ?',
                [volume_ml, goal_ml || 2500, date, userId]
            );
        } else {
            await runAsync(
                'INSERT INTO hydration_logs (date, volume_ml, goal_ml, user_id) VALUES (?, ?, ?, ?)',
                [date, volume_ml, goal_ml || 2500, userId]
            );
        }

        const updated = await getAsync('SELECT * FROM hydration_logs WHERE date = ? AND user_id = ?', [date, userId]);
        res.json(updated);
    } catch (error) {
        console.error('Error logging hydration:', error);
        res.status(500).json({ error: 'Failed to log hydration', details: error.message });
    }
});

module.exports = router;
