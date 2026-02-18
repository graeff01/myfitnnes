const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// API Routes
const workoutsRouter = require('./routes/workouts');
const metricsRouter = require('./routes/metrics');
const hydrationRouter = require('./routes/hydration');
const authRouter = require('./routes/auth');
const plansRouter = require('./routes/plans');
const supplementsRouter = require('./routes/supplements');

app.use('/api/workouts', workoutsRouter);
app.use('/api/metrics', metricsRouter);
app.use('/api/hydration', hydrationRouter);
app.use('/api/auth', authRouter);
app.use('/api/plans', plansRouter);
app.use('/api/supplements', supplementsRouter);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/dist')));

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    });
}

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 API available at http://localhost:${PORT}/api`);
});
