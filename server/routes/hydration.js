const express = require('express');
const router = express.Router();
const { getAsync, runAsync } = require('../db/database');

// Get hydration for a specific date
router.get('/:date', async (req, res) => {
    try {
        const { date } = req.params;
        const log = await getAsync('SELECT * FROM hydration_logs WHERE date = ?', [date]);

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
        res.status(500).json({ error: 'Failed to fetch hydration' });
    }
});

// Update hydration
router.post('/', async (req, res) => {
    try {
        const { date, volume_ml, goal_ml } = req.body;

        if (!date || volume_ml === undefined) {
            return res.status(400).json({ error: 'Date and volume_ml are required' });
        }

        const existing = await getAsync('SELECT id FROM hydration_logs WHERE date = ?', [date]);

        if (existing) {
            await runAsync(
                'UPDATE hydration_logs SET volume_ml = ?, goal_ml = ? WHERE date = ?',
                [volume_ml, goal_ml || 2500, date]
            );
        } else {
            await runAsync(
                'INSERT INTO hydration_logs (date, volume_ml, goal_ml) VALUES (?, ?, ?)',
                [date, volume_ml, goal_ml || 2500]
            );
        }

        const updated = await getAsync('SELECT * FROM hydration_logs WHERE date = ?', [date]);
        res.json(updated);
    } catch (error) {
        console.error('Error logging hydration:', error);
        res.status(500).json({ error: 'Failed to log hydration' });
    }
});

module.exports = router;
