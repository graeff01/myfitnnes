const express = require('express');
const router = express.Router();
const { allAsync, getAsync, runAsync } = require('../config/database');
const authenticateToken = require('../middleware/auth');

router.use(authenticateToken);

// ============================================
// WEIGHT TRACKING ROUTES
// ============================================

// Get all weight logs
router.get('/weight', async (req, res) => {
    try {
        const { startDate, endDate, limit } = req.query;
        const userId = req.user.id;

        let query = 'SELECT * FROM weight_logs WHERE user_id = ?';
        const params = [userId];

        if (startDate && endDate) {
            query += ' AND date BETWEEN ? AND ?';
            params.push(startDate, endDate);
        } else if (startDate) {
            query += ' AND date >= ?';
            params.push(startDate);
        }

        query += ' ORDER BY date DESC';

        if (limit) {
            query += ' LIMIT ?';
            params.push(parseInt(limit));
        }

        const logs = await allAsync(query, params);
        res.json(logs);
    } catch (error) {
        console.error('Error fetching weight logs:', error);
        res.status(500).json({ error: 'Failed to fetch weight logs', details: error.message });
    }
});

// Log weight
router.post('/weight', async (req, res) => {
    try {
        const { date, weight, notes } = req.body;
        const userId = req.user.id;

        if (!date || !weight) {
            return res.status(400).json({ error: 'Date and weight are required' });
        }

        if (weight <= 0 || weight > 500) {
            return res.status(400).json({ error: 'Invalid weight value' });
        }

        // Always insert new record (remove existing check to allow history)
        const result = await runAsync(
            'INSERT INTO weight_logs (user_id, date, weight, notes) VALUES (?, ?, ?, ?)',
            [userId, date, weight, notes || null]
        );
        const log = await getAsync('SELECT * FROM weight_logs WHERE id = ? AND user_id = ?', [result.lastID, userId]);
        res.status(201).json(log);
    } catch (error) {
        console.error('Error logging weight:', error);
        res.status(500).json({ error: 'Failed to log weight', details: error.message });
    }
});

// Delete weight log
router.delete('/weight/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const result = await runAsync('DELETE FROM weight_logs WHERE id = ? AND user_id = ?', [id, userId]);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Weight log not found or unauthorized' });
        }

        res.json({ message: 'Weight log deleted successfully' });
    } catch (error) {
        console.error('Error deleting weight log:', error);
        res.status(500).json({ error: 'Failed to delete weight log', details: error.message });
    }
});

// ============================================
// MEASUREMENTS ROUTES
// ============================================

// Get all measurements
router.get('/measurements', async (req, res) => {
    try {
        const { startDate, endDate, limit } = req.query;
        const userId = req.user.id;

        let query = 'SELECT * FROM measurements WHERE user_id = ?';
        const params = [userId];

        if (startDate && endDate) {
            query += ' AND date BETWEEN ? AND ?';
            params.push(startDate, endDate);
        } else if (startDate) {
            query += ' AND date >= ?';
            params.push(startDate);
        }

        query += ' ORDER BY date DESC';

        if (limit) {
            query += ' LIMIT ?';
            params.push(parseInt(limit));
        }

        const measurements = await allAsync(query, params);
        res.json(measurements);
    } catch (error) {
        console.error('Error fetching measurements:', error);
        res.status(500).json({ error: 'Failed to fetch measurements', details: error.message });
    }
});

// Log measurements
router.post('/measurements', async (req, res) => {
    try {
        const { date, chest, waist, hips, left_arm, right_arm, left_thigh, right_thigh, left_calf, right_calf, notes } = req.body;
        const userId = req.user.id;

        if (!date) {
            return res.status(400).json({ error: 'Date is required' });
        }

        // Always insert new record (remove existing check to allow history)
        const result = await runAsync(`
            INSERT INTO measurements 
            (user_id, date, chest, waist, hips, left_arm, right_arm, left_thigh, right_thigh, left_calf, right_calf, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [userId, date, chest, waist, hips, left_arm, right_arm, left_thigh, right_thigh, left_calf, right_calf, notes || null]);

        const measurement = await getAsync('SELECT * FROM measurements WHERE id = ? AND user_id = ?', [result.lastID, userId]);
        res.status(201).json(measurement);
    } catch (error) {
        console.error('Error logging measurements:', error);
        res.status(500).json({ error: 'Failed to log measurements', details: error.message });
    }
});

// Delete measurement
router.delete('/measurements/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await runAsync('DELETE FROM measurements WHERE id = ?', [id]);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Measurement not found' });
        }

        res.json({ message: 'Measurement deleted successfully' });
    } catch (error) {
        console.error('Error deleting measurement:', error);
        res.status(500).json({ error: 'Failed to delete measurement', details: error.message });
    }
});

// ============================================
// EVOLUTION PHOTOS ROUTES
// ============================================

// Get all photos
router.get('/photos', async (req, res) => {
    try {
        const userId = req.user.id;
        const query = 'SELECT * FROM evolution_photos WHERE user_id = ? ORDER BY date DESC';
        const photos = await allAsync(query, [userId]);
        res.json(photos);
    } catch (error) {
        console.error('Error fetching photos:', error);
        res.status(500).json({ error: 'Failed to fetch photos', details: error.message });
    }
});

// Log photo
router.post('/photos', async (req, res) => {
    try {
        const { date, image_data, caption } = req.body;
        const userId = req.user.id;

        if (!date || !image_data) {
            return res.status(400).json({ error: 'Date and image_data are required' });
        }

        const result = await runAsync(
            'INSERT INTO evolution_photos (user_id, date, image_data, caption) VALUES (?, ?, ?, ?)',
            [userId, date, image_data, caption || null]
        );
        const photo = await getAsync('SELECT * FROM evolution_photos WHERE id = ? AND user_id = ?', [result.lastID, userId]);
        res.status(201).json(photo);
    } catch (error) {
        console.error('Error logging photo:', error);
        res.status(500).json({ error: 'Failed to log photo', details: error.message });
    }
});

// Delete photo
router.delete('/photos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const result = await runAsync('DELETE FROM evolution_photos WHERE id = ? AND user_id = ?', [id, userId]);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Photo not found or unauthorized' });
        }

        res.json({ message: 'Photo deleted successfully' });
    } catch (error) {
        console.error('Error deleting photo:', error);
        res.status(500).json({ error: 'Failed to delete photo', details: error.message });
    }
});

module.exports = router;
