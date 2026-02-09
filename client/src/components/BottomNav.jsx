import React from 'react';
import { Home, Dumbbell, LineChart, User } from 'lucide-react';
import * as api from '../services/api';

export default function BottomNav({ activeTab, setActiveTab }) {
    const navItems = [
        { id: 'home', icon: Home, label: 'Início' },
        { id: 'workouts', icon: Dumbbell, label: 'Treinos' },
        { id: 'progress', icon: LineChart, label: 'Progresso' },
        { id: 'profile', icon: User, label: 'Perfil' }
    ];

    const handleNavClick = (id) => {
        setActiveTab(id);
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-3 pt-2">
            <div className="bg-surface/80 backdrop-blur-xl border border-white/5 rounded-2xl shadow-xl flex justify-around items-center p-2 max-w-md mx-auto">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => handleNavClick(item.id)}
                            className={`relative flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-all duration-300 ${isActive ? 'text-primary' : 'text-text-secondary hover:text-white'
                                }`}
                        >
                            {isActive && (
                                <div className="absolute -top-2 w-8 h-1 bg-primary rounded-full shadow-[0_0_10px_#FA114F] animate-pulse" />
                            )}
                            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                            <span className={`text-[10px] mt-1 font-medium transition-all ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 hidden'
                                }`}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
