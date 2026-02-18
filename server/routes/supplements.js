const express = require('express');
const router = express.Router();
const { getAsync, runAsync } = require('../config/database');
const authenticateToken = require('../middleware/auth');

router.use(authenticateToken);

// GET supplement log for a specific date
router.get('/:date', async (req, res) => {
    try {
        const userId = req.user.id;
        const { date } = req.params;

        const log = await getAsync(
            'SELECT * FROM supplement_logs WHERE user_id = ? AND date = ?',
            [userId, date]
        );

        res.json(log || { date, taken_morning: 0, taken_evening: 0 });
    } catch (error) {
        console.error('Error fetching supplement log:', error);
        res.status(500).json({ error: 'Failed to fetch supplement log', details: error.message });
    }
});

// POST - log or update supplement intake for a date
router.post('/', async (req, res) => {
    try {
        const userId = req.user.id;
        const { date, taken_morning, taken_evening } = req.body;

        if (!date) return res.status(400).json({ error: 'Date is required' });

        await runAsync(
            `INSERT INTO supplement_logs (user_id, date, taken_morning, taken_evening)
             VALUES (?, ?, ?, ?)
             ON CONFLICT(user_id, date) DO UPDATE SET
               taken_morning = excluded.taken_morning,
               taken_evening = excluded.taken_evening`,
            [userId, date, taken_morning ? 1 : 0, taken_evening ? 1 : 0]
        );

        const log = await getAsync(
            'SELECT * FROM supplement_logs WHERE user_id = ? AND date = ?',
            [userId, date]
        );
        res.json(log);
    } catch (error) {
        console.error('Error logging supplement:', error);
        res.status(500).json({ error: 'Failed to log supplement', details: error.message });
    }
});

module.exports = router;
