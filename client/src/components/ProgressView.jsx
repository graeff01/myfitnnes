import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as api from '../services/api';
import WeightModal from './WeightModal';
import MeasurementsModal from './MeasurementsModal';
import PhotoDetailModal from './PhotoDetailModal';

const ProgressView = () => {
    const [weightLogs, setWeightLogs] = useState([]);
    const [measurements, setMeasurements] = useState([]);
    const [photos, setPhotos] = useState([]);
    const [showWeightModal, setShowWeightModal] = useState(false);
    const [showMeasurementsModal, setShowMeasurementsModal] = useState(false);
    const [showPhotoModal, setShowPhotoModal] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [activeChart, setActiveChart] = useState('weight'); // 'weight', 'measurements', or 'photos'
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [weightData, measurementsData, photosData] = await Promise.all([
                api.getWeightLogs(null, null, 12),
                api.getMeasurements(null, null, 12),
                api.getPhotos()
            ]);
            setWeightLogs(weightData);
            setMeasurements(measurementsData);
            setPhotos(photosData);
        } catch (error) {
            console.error('Error loading progress data:', error);
        }
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = async () => {
            try {
                setUploading(true);
                const caption = prompt("Digite uma legenda para esta foto (opcional):") || '';
                await api.uploadPhoto({
                    date: new Date().toISOString().split('T')[0],
                    image_data: reader.result,
                    caption
                });
                loadData();
            } catch (error) {
                console.error('Error uploading photo:', error);
                alert('Erro ao carregar foto');
            } finally {
                setUploading(false);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleDeletePhoto = async (id) => {
        if (!window.confirm('Excluir esta foto da evolução?')) return;
        try {
            await api.deletePhoto(id);
            loadData();
        } catch (error) {
            console.error('Error deleting photo:', error);
        }
    };

    const handleWeightSave = () => {
        loadData();
    };

    const handleMeasurementsSave = () => {
        loadData();
    };

    // Calculate weight change
    const getWeightChange = () => {
        if (weightLogs.length < 2) return null;
        const latest = weightLogs[0].weight;
        const oldest = weightLogs[weightLogs.length - 1].weight;
        const change = latest - oldest;
        return {
            value: Math.abs(change).toFixed(1),
            isGain: change > 0,
            percentage: ((change / oldest) * 100).toFixed(1)
        };
    };

    const weightChange = getWeightChange();

    // Format date for display
    const formatDate = (dateStr) => {
        const date = new Date(dateStr + 'T00:00:00');
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    };

    // Get measurement change
    const getMeasurementChange = (field) => {
        const validMeasurements = measurements.filter(m => m[field]);
        if (validMeasurements.length < 2) return null;

        const latest = validMeasurements[0][field];
        const oldest = validMeasurements[validMeasurements.length - 1][field];
        const change = latest - oldest;

        return {
            value: Math.abs(change).toFixed(1),
            isIncrease: change > 0
        };
    };

    return (
        <div className="flex-1 overflow-y-auto scrollbar-hide space-y-6 pb-32">
            {/* Header with action buttons */}
            <div className="card">
                <h2 className="text-2xl font-bold mb-4">📈 Progresso</h2>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => setShowWeightModal(true)}
                        className="py-4 px-4 bg-primary rounded-2xl font-semibold text-white hover:bg-opacity-90 transition-all active:scale-95"
                    >
                        ⚖️ Registrar Peso
                    </button>
                    <button
                        onClick={() => setShowMeasurementsModal(true)}
                        className="py-4 px-4 bg-secondary rounded-2xl font-semibold text-black hover:bg-opacity-90 transition-all active:scale-95"
                    >
                        📏 Registrar Medidas
                    </button>
                </div>
            </div>

            {/* Chart selector */}
            <div className="flex gap-2 bg-surface-light p-1 rounded-full">
                <button
                    onClick={() => setActiveChart('weight')}
                    className={`flex-1 py-2 rounded-full font-medium transition-all ${activeChart === 'weight' ? 'bg-surface text-text-primary' : 'text-text-secondary'
                        }`}
                >
                    ⚖️ Peso
                </button>
                <button
                    onClick={() => setActiveChart('measurements')}
                    className={`flex-1 py-2 rounded-full font-medium transition-all ${activeChart === 'measurements' ? 'bg-surface text-text-primary' : 'text-text-secondary'
                        }`}
                >
                    📏 Medidas
                </button>
                <button
                    onClick={() => setActiveChart('photos')}
                    className={`flex-1 py-2 rounded-full font-medium transition-all ${activeChart === 'photos' ? 'bg-surface text-text-primary' : 'text-text-secondary'
                        }`}
                >
                    📸 Fotos
                </button>
            </div>

            {/* Weight Chart */}
            {activeChart === 'weight' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Evolução de Peso</h3>
                        {weightChange && (
                            <div className={`text-sm font-semibold ${weightChange.isGain ? 'text-secondary' : 'text-primary'}`}>
                                {weightChange.isGain ? '↗' : '↘'} {weightChange.value} kg ({weightChange.percentage}%)
                            </div>
                        )}
                    </div>

                    {weightLogs.length === 0 ? (
                        <div className="text-center py-12 text-text-secondary">
                            <div className="text-4xl mb-2">⚖️</div>
                            <p>Nenhum registro de peso ainda</p>
                            <p className="text-sm mt-1">Comece registrando seu peso acima!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Simple line chart visualization */}
                            <div className="relative h-40 flex items-end gap-1">
                                {weightLogs.slice().reverse().map((log, index) => {
                                    const maxWeight = Math.max(...weightLogs.map(l => l.weight));
                                    const minWeight = Math.min(...weightLogs.map(l => l.weight));
                                    const range = maxWeight - minWeight || 1;
                                    const height = ((log.weight - minWeight) / range) * 100;

                                    return (
                                        <motion.div
                                            key={log.id}
                                            initial={{ height: 0 }}
                                            animate={{ height: `${Math.max(height, 10)}%` }}
                                            transition={{ delay: index * 0.05 }}
                                            className="flex-1 bg-primary rounded-t-lg relative group"
                                            title={`${log.weight} kg - ${formatDate(log.date)}`}
                                        >
                                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-surface px-2 py-1 rounded text-xs whitespace-nowrap">
                                                {log.weight} kg
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {/* Weight history list */}
                            <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-hide">
                                {weightLogs.map((log, index) => (
                                    <motion.div
                                        key={log.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="flex items-center justify-between p-3 bg-surface-light rounded-xl"
                                    >
                                        <div>
                                            <div className="font-semibold text-lg">{log.weight} kg</div>
                                            <div className="text-xs text-text-secondary">{formatDate(log.date)}</div>
                                            {log.notes && (
                                                <div className="text-xs text-text-secondary italic mt-1">"{log.notes}"</div>
                                            )}
                                        </div>
                                        {index > 0 && (
                                            <div className={`text-sm font-medium ${log.weight > weightLogs[index - 1].weight ? 'text-secondary' : 'text-primary'
                                                }`}>
                                                {log.weight > weightLogs[index - 1].weight ? '↗' : '↘'}
                                                {Math.abs(log.weight - weightLogs[index - 1].weight).toFixed(1)} kg
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            )}

            {/* Measurements Chart */}
            {activeChart === 'measurements' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card"
                >
                    <h3 className="text-lg font-semibold mb-4">Medidas Corporais</h3>

                    {measurements.length === 0 ? (
                        <div className="text-center py-12 text-text-secondary">
                            <div className="text-4xl mb-2">📏</div>
                            <p>Nenhuma medida registrada ainda</p>
                            <p className="text-sm mt-1">Comece registrando suas medidas acima!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Latest measurements */}
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { field: 'chest', label: 'Peito', icon: '💪' },
                                    { field: 'waist', label: 'Cintura', icon: '📏' },
                                    { field: 'left_arm', label: 'Braço E', icon: '💪' },
                                    { field: 'right_arm', label: 'Braço D', icon: '💪' },
                                    { field: 'left_thigh', label: 'Coxa E', icon: '🦵' },
                                    { field: 'right_thigh', label: 'Coxa D', icon: '🦵' },
                                ].map(({ field, label, icon }) => {
                                    const latest = measurements.find(m => m[field]);
                                    const change = getMeasurementChange(field);

                                    if (!latest || !latest[field]) return null;

                                    return (
                                        <div key={field} className="p-3 bg-surface-light rounded-xl">
                                            <div className="text-xs text-text-secondary mb-1">{icon} {label}</div>
                                            <div className="flex items-baseline gap-2">
                                                <div className="text-xl font-bold">{latest[field]}</div>
                                                <div className="text-xs text-text-secondary">cm</div>
                                            </div>
                                            {change && (
                                                <div className={`text-xs font-medium mt-1 ${change.isIncrease ? 'text-secondary' : 'text-primary'
                                                    }`}>
                                                    {change.isIncrease ? '↗' : '↘'} {change.value} cm
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Measurements history */}
                            <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-hide">
                                <h4 className="text-sm font-semibold text-text-secondary">Histórico</h4>
                                {measurements.map((measurement, index) => (
                                    <motion.div
                                        key={measurement.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="p-3 bg-surface-light rounded-xl"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="text-sm font-semibold">{formatDate(measurement.date)}</div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 text-xs">
                                            {Object.entries(measurement).map(([key, value]) => {
                                                if (!value || key === 'id' || key === 'date' || key === 'notes' || key === 'created_at') return null;
                                                const label = key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
                                                return (
                                                    <div key={key}>
                                                        <span className="text-text-secondary">{label}:</span> {value}cm
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        {measurement.notes && (
                                            <div className="text-xs text-text-secondary italic mt-2">"{measurement.notes}"</div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            )}

            {/* Photo Evolution Gallery */}
            {activeChart === 'photos' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                >
                    <div className="card">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Galeria de Evolução</h3>
                            <label className="bg-primary hover:bg-opacity-90 text-white text-xs font-bold py-2 px-4 rounded-xl cursor-pointer transition-all active:scale-95 flex items-center gap-2">
                                <span>{uploading ? 'Carregando...' : '📷 Nova Foto'}</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handlePhotoUpload}
                                    disabled={uploading}
                                />
                            </label>
                        </div>

                        {photos.length === 0 ? (
                            <div className="text-center py-12 text-text-secondary">
                                <div className="text-4xl mb-2">📸</div>
                                <p>Nenhuma foto registrada ainda</p>
                                <p className="text-sm mt-1">Registre sua evolução visual!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3 pb-4">
                                {photos.map((photo, index) => (
                                    <motion.div
                                        key={photo.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="relative group rounded-2xl overflow-hidden aspect-[3/4] bg-surface-light border border-white/5 cursor-pointer"
                                        onClick={() => {
                                            setSelectedPhoto(photo);
                                            setShowPhotoModal(true);
                                        }}
                                    >
                                        <img
                                            src={photo.image_data}
                                            alt={photo.caption || 'Foto de evolução'}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3 opacity-90 transition-opacity group-hover:opacity-100">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1 min-w-0 pr-2">
                                                    <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">{formatDate(photo.date)}</p>
                                                    {photo.caption && (
                                                        <p className="text-xs text-white font-medium line-clamp-1">{photo.caption}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            )}

            {/* Modals */}
            <WeightModal
                isOpen={showWeightModal}
                onClose={() => setShowWeightModal(false)}
                onSave={handleWeightSave}
            />
            <MeasurementsModal
                isOpen={showMeasurementsModal}
                onClose={() => setShowMeasurementsModal(false)}
                onSave={handleMeasurementsSave}
            />
            <PhotoDetailModal
                isOpen={showPhotoModal}
                photo={selectedPhoto}
                onClose={() => setShowPhotoModal(false)}
                onDelete={handleDeletePhoto}
            />
        </div>
    );
};

export default ProgressView;
