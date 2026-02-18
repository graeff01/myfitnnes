import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, Shield, Settings, Info, Dumbbell, Calendar, Trophy, Target, Camera, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import * as api from '../services/api';

const ProfileView = ({ stats, onLogout }) => {
    const userString = localStorage.getItem('myfit_user');
    const user = userString ? JSON.parse(userString) : { username: 'Atleta' };
    const [goalPhoto, setGoalPhoto] = useState(null);
    const [loadingPhoto, setLoadingPhoto] = useState(true);
    const [showGoalPhoto, setShowGoalPhoto] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        loadGoalPhoto();
    }, []);

    const loadGoalPhoto = async () => {
        try {
            const photo = await api.getGoalPhoto();
            setGoalPhoto(photo);
        } catch (err) {
            console.error('Error loading goal photo:', err);
        } finally {
            setLoadingPhoto(false);
        }
    };

    const handleGoalPhotoUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Selecione uma imagem válida');
            return;
        }

        const reader = new FileReader();
        reader.onload = async (ev) => {
            const base64 = ev.target.result;
            try {
                await api.saveGoalPhoto(base64);
                setGoalPhoto(base64);
                toast.success('Foto objetivo salva!');
            } catch (err) {
                toast.error('Erro ao salvar foto');
            }
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveGoalPhoto = async () => {
        if (!window.confirm('Remover foto objetivo?')) return;
        try {
            await api.saveGoalPhoto(null);
            setGoalPhoto(null);
            toast.success('Foto objetivo removida');
        } catch (err) {
            toast.error('Erro ao remover foto');
        }
    };

    const handleLogout = () => {
        if (window.confirm('Deseja realmente sair da sua conta?')) {
            api.logout();
            if (onLogout) onLogout();
            window.location.reload();
        }
    };

    const profileSections = [
        {
            title: 'Conta',
            items: [
                { icon: User, label: 'Perfil', value: user.username },
                { icon: Shield, label: 'Privacidade', value: 'Protegido' },
            ]
        },
        {
            title: 'Aplicativo',
            items: [
                { icon: Settings, label: 'Configurações', value: 'Ajustar' },
                { icon: Info, label: 'Sobre', value: 'v1.0.0' },
            ]
        }
    ];

    return (
        <div className="flex flex-col h-full overflow-y-auto pb-24 scrollbar-hide">
            {/* Header / Avatar */}
            <div className="flex flex-col items-center py-8 relative">
                <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-primary/10 to-transparent -z-10" />

                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-24 h-24 rounded-full bg-surface-light border-4 border-primary/20 flex items-center justify-center mb-4 relative shadow-2xl shadow-primary/20"
                >
                    <User size={48} className="text-primary" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 bg-secondary rounded-full border-2 border-background flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    </div>
                </motion.div>

                <h2 className="text-2xl font-bold text-white mb-1">{user.username}</h2>
                <p className="text-text-secondary text-sm font-medium uppercase tracking-widest">Plano Premium</p>
            </div>

            {/* General Stats Rack */}
            <div className="grid grid-cols-3 gap-3 px-4 mb-8">
                <div className="bg-surface/50 border border-white/5 p-4 rounded-2xl flex flex-col items-center">
                    <Dumbbell className="text-primary mb-2" size={20} />
                    <span className="text-xl font-bold text-white">{stats.totalWorkouts || 0}</span>
                    <span className="text-[10px] text-zinc-500 uppercase font-bold text-center">Treinos</span>
                </div>
                <div className="bg-surface/50 border border-white/5 p-4 rounded-2xl flex flex-col items-center">
                    <Calendar className="text-secondary mb-2" size={20} />
                    <span className="text-xl font-bold text-white">{stats.streak || 0}</span>
                    <span className="text-[10px] text-zinc-500 uppercase font-bold text-center">Streak</span>
                </div>
                <div className="bg-surface/50 border border-white/5 p-4 rounded-2xl flex flex-col items-center">
                    <Trophy className="text-tertiary mb-2" size={20} />
                    <span className="text-xl font-bold text-white">{stats.monthlyGoals || 0}</span>
                    <span className="text-[10px] text-zinc-500 uppercase font-bold text-center">Metas</span>
                </div>
            </div>

            {/* Goal Photo Section */}
            <div className="px-4 mb-6">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 ml-1">
                    Meu Objetivo
                </h3>

                {!loadingPhoto && (
                    <div className="bg-surface/30 border border-white/5 rounded-2xl overflow-hidden">
                        {goalPhoto ? (
                            <div className="relative">
                                {/* Preview Thumbnail */}
                                <button
                                    onClick={() => setShowGoalPhoto(true)}
                                    className="w-full flex items-center gap-4 p-4 hover:bg-white/5 transition-colors"
                                >
                                    <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 ring-2 ring-primary/30">
                                        <img
                                            src={goalPhoto}
                                            alt="Objetivo"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="text-white font-semibold text-sm">Foto Objetivo</p>
                                        <p className="text-zinc-400 text-xs mt-0.5">Toque para ver em tela cheia</p>
                                    </div>
                                    <Target className="text-primary flex-shrink-0" size={20} />
                                </button>

                                {/* Actions */}
                                <div className="flex gap-2 px-4 pb-4">
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex-1 py-2 rounded-xl bg-primary/10 text-primary text-xs font-bold border border-primary/20 flex items-center justify-center gap-1.5"
                                    >
                                        <Camera size={14} />
                                        Trocar foto
                                    </button>
                                    <button
                                        onClick={handleRemoveGoalPhoto}
                                        className="py-2 px-4 rounded-xl bg-red-500/10 text-red-400 text-xs font-bold border border-red-500/20"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full flex flex-col items-center justify-center py-8 gap-3 hover:bg-white/5 transition-colors"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-primary/10 border-2 border-dashed border-primary/30 flex items-center justify-center">
                                    <Target className="text-primary" size={28} />
                                </div>
                                <div className="text-center">
                                    <p className="text-white/70 font-semibold text-sm">Adicionar foto objetivo</p>
                                    <p className="text-zinc-500 text-xs mt-0.5">Sua inspiração para treinar</p>
                                </div>
                            </button>
                        )}
                    </div>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleGoalPhotoUpload}
                />
            </div>

            {/* Menu Sections */}
            <div className="space-y-6 px-4">
                {profileSections.map((section) => (
                    <div key={section.title}>
                        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 ml-1">
                            {section.title}
                        </h3>
                        <div className="bg-surface/30 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">
                            {section.items.map((item, idx) => {
                                const Icon = item.icon;
                                return (
                                    <button
                                        key={item.label}
                                        className={`w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors ${idx !== section.items.length - 1 ? 'border-b border-white/5' : ''
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-surface-light flex items-center justify-center text-zinc-400">
                                                <Icon size={18} />
                                            </div>
                                            <span className="text-zinc-200 font-medium">{item.label}</span>
                                        </div>
                                        <span className="text-zinc-500 text-sm">{item.value}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}

                {/* Logout Button */}
                <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleLogout}
                    className="w-full mt-4 flex items-center justify-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 font-bold hover:bg-red-500/20 transition-all"
                >
                    <LogOut size={20} />
                    <span>Sair da Conta</span>
                </motion.button>
            </div>

            {/* Full-screen goal photo viewer */}
            <AnimatePresence>
                {showGoalPhoto && goalPhoto && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/95 z-[300] flex flex-col items-center justify-center"
                        onClick={() => setShowGoalPhoto(false)}
                    >
                        <div className="absolute top-12 right-4">
                            <button
                                onClick={() => setShowGoalPhoto(false)}
                                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="absolute top-12 left-4">
                            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/20 border border-primary/30">
                                <Target size={16} className="text-primary" />
                                <span className="text-primary text-sm font-bold">Meu Objetivo</span>
                            </div>
                        </div>
                        <motion.img
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            src={goalPhoto}
                            alt="Objetivo"
                            className="max-w-full max-h-full object-contain rounded-2xl"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProfileView;
