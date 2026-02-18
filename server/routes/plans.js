const express = require('express');
const router = express.Router();
const { allAsync, getAsync, runAsync } = require('../config/database');
const authenticateToken = require('../middleware/auth');

router.use(authenticateToken);

const DEFAULT_PLANS = [
    {
        name: 'Dia 1 – Peito + Tríceps',
        day_number: 1,
        muscle_groups: 'peito,triceps',
        exercises: [
            { name: 'Supino reto', sets: 4, reps_min: 8, reps_max: 10, notes: null, order_index: 0 },
            { name: 'Supino inclinado', sets: 3, reps_min: 8, reps_max: 10, notes: null, order_index: 1 },
            { name: 'Crucifixo (máquina ou halteres)', sets: 3, reps_min: 10, reps_max: 12, notes: null, order_index: 2 },
            { name: 'Tríceps corda', sets: 3, reps_min: 10, reps_max: 12, notes: null, order_index: 3 },
            { name: 'Tríceps testa', sets: 3, reps_min: 8, reps_max: 10, notes: null, order_index: 4 },
        ]
    },
    {
        name: 'Dia 2 – Costas + Bíceps',
        day_number: 2,
        muscle_groups: 'costas,biceps',
        exercises: [
            { name: 'Puxada frontal', sets: 4, reps_min: 8, reps_max: 10, notes: null, order_index: 0 },
            { name: 'Remada baixa', sets: 3, reps_min: 8, reps_max: 10, notes: null, order_index: 1 },
            { name: 'Remada unilateral', sets: 3, reps_min: 10, reps_max: 10, notes: null, order_index: 2 },
            { name: 'Rosca direta', sets: 3, reps_min: 8, reps_max: 10, notes: null, order_index: 3 },
            { name: 'Rosca alternada', sets: 3, reps_min: 10, reps_max: 10, notes: null, order_index: 4 },
        ]
    },
    {
        name: 'Dia 3 – Pernas',
        day_number: 3,
        muscle_groups: 'pernas',
        exercises: [
            { name: 'Agachamento ou Leg Press', sets: 4, reps_min: 8, reps_max: 10, notes: null, order_index: 0 },
            { name: 'Cadeira extensora', sets: 3, reps_min: 10, reps_max: 12, notes: null, order_index: 1 },
            { name: 'Mesa flexora', sets: 3, reps_min: 10, reps_max: 12, notes: null, order_index: 2 },
            { name: 'Panturrilha (em pé ou sentado)', sets: 4, reps_min: 12, reps_max: 15, notes: null, order_index: 3 },
        ]
    },
    {
        name: 'Dia 4 – Ombros + Abdômen',
        day_number: 4,
        muscle_groups: 'ombros,abdomen',
        exercises: [
            { name: 'Desenvolvimento com halteres', sets: 4, reps_min: 8, reps_max: 10, notes: null, order_index: 0 },
            { name: 'Elevação lateral', sets: 3, reps_min: 10, reps_max: 12, notes: null, order_index: 1 },
            { name: 'Elevação frontal', sets: 3, reps_min: 10, reps_max: 10, notes: null, order_index: 2 },
            { name: 'Abdominal (máquina ou solo)', sets: 3, reps_min: 15, reps_max: 15, notes: null, order_index: 3 },
            { name: 'Prancha', sets: 3, reps_min: null, reps_max: null, notes: '30-45 segundos', order_index: 4 },
        ]
    },
    {
        name: 'Dia 5 – Costas + Braços',
        day_number: 5,
        muscle_groups: 'costas,biceps,triceps',
        exercises: [
            { name: 'Puxada aberta', sets: 3, reps_min: 8, reps_max: 10, notes: null, order_index: 0 },
            { name: 'Remada curvada', sets: 3, reps_min: 8, reps_max: 10, notes: null, order_index: 1 },
            { name: 'Rosca direta', sets: 3, reps_min: 8, reps_max: 10, notes: null, order_index: 2 },
            { name: 'Tríceps corda', sets: 3, reps_min: 10, reps_max: 12, notes: null, order_index: 3 },
            { name: 'Rosca martelo', sets: 3, reps_min: 10, reps_max: 10, notes: null, order_index: 4 },
        ]
    }
];

// GET all plans with exercises for the user
router.get('/', async (req, res) => {
    try {
        const userId = req.user.id;
        let plans = await allAsync(
            'SELECT * FROM workout_plans WHERE user_id = ? ORDER BY day_number',
            [userId]
        );

        // Auto-seed default plans if user has none
        if (plans.length === 0) {
            for (const plan of DEFAULT_PLANS) {
                const result = await runAsync(
                    'INSERT INTO workout_plans (user_id, name, day_number, muscle_groups) VALUES (?, ?, ?, ?)',
                    [userId, plan.name, plan.day_number, plan.muscle_groups]
                );
                for (const ex of plan.exercises) {
                    await runAsync(
                        'INSERT INTO plan_exercises (plan_id, name, sets, reps_min, reps_max, notes, order_index) VALUES (?, ?, ?, ?, ?, ?, ?)',
                        [result.lastID, ex.name, ex.sets, ex.reps_min, ex.reps_max, ex.notes, ex.order_index]
                    );
                }
            }
            plans = await allAsync(
                'SELECT * FROM workout_plans WHERE user_id = ? ORDER BY day_number',
                [userId]
            );
        }

        for (const plan of plans) {
            plan.exercises = await allAsync(
                'SELECT * FROM plan_exercises WHERE plan_id = ? ORDER BY order_index',
                [plan.id]
            );
        }

        res.json(plans);
    } catch (error) {
        console.error('Error fetching plans:', error);
        res.status(500).json({ error: 'Failed to fetch plans', details: error.message });
    }
});

// GET single plan with exercises
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const plan = await getAsync(
            'SELECT * FROM workout_plans WHERE id = ? AND user_id = ?',
            [id, userId]
        );
        if (!plan) return res.status(404).json({ error: 'Plan not found' });

        plan.exercises = await allAsync(
            'SELECT * FROM plan_exercises WHERE plan_id = ? ORDER BY order_index',
            [plan.id]
        );
        res.json(plan);
    } catch (error) {
        console.error('Error fetching plan:', error);
        res.status(500).json({ error: 'Failed to fetch plan', details: error.message });
    }
});

// POST - add exercise to a plan
router.post('/:id/exercises', async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { name, sets, reps_min, reps_max, notes } = req.body;

        const plan = await getAsync(
            'SELECT id FROM workout_plans WHERE id = ? AND user_id = ?',
            [id, userId]
        );
        if (!plan) return res.status(404).json({ error: 'Plan not found' });

        const maxOrder = await getAsync(
            'SELECT MAX(order_index) as max_idx FROM plan_exercises WHERE plan_id = ?',
            [id]
        );
        const order_index = (maxOrder?.max_idx ?? -1) + 1;

        const result = await runAsync(
            'INSERT INTO plan_exercises (plan_id, name, sets, reps_min, reps_max, notes, order_index) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [id, name, sets, reps_min || null, reps_max || null, notes || null, order_index]
        );

        const exercise = await getAsync('SELECT * FROM plan_exercises WHERE id = ?', [result.lastID]);
        res.status(201).json(exercise);
    } catch (error) {
        console.error('Error adding exercise:', error);
        res.status(500).json({ error: 'Failed to add exercise', details: error.message });
    }
});

// DELETE - remove exercise from plan
router.delete('/:planId/exercises/:exerciseId', async (req, res) => {
    try {
        const { planId, exerciseId } = req.params;
        const userId = req.user.id;

        const plan = await getAsync(
            'SELECT id FROM workout_plans WHERE id = ? AND user_id = ?',
            [planId, userId]
        );
        if (!plan) return res.status(404).json({ error: 'Plan not found' });

        await runAsync('DELETE FROM plan_exercises WHERE id = ? AND plan_id = ?', [exerciseId, planId]);
        res.json({ message: 'Exercise removed' });
    } catch (error) {
        console.error('Error deleting exercise:', error);
        res.status(500).json({ error: 'Failed to delete exercise', details: error.message });
    }
});

module.exports = router;
