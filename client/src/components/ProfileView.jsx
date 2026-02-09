import React from 'react';
import { motion } from 'framer-motion';
import { User, LogOut, Shield, Settings, Info, Dumbbell, Calendar, Trophy } from 'lucide-react';
import * as api from '../services/api';

const ProfileView = ({ stats, onLogout }) => {
    const userString = localStorage.getItem('myfit_user');
    const user = userString ? JSON.parse(userString) : { username: 'Atleta' };

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
        </div>
    );
};

export default ProfileView;
