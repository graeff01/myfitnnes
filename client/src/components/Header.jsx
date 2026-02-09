import { LogOut } from 'lucide-react';
import * as api from '../services/api';

export default function Header({ title = "MyFit", subtitle = "Sua jornada diária", onLogout }) {
    return (
        <div className="flex justify-between items-center mb-3">
            <div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                    {title}
                </h1>
                <p className="text-sm text-text-secondary uppercase tracking-wider font-medium">
                    {subtitle}
                </p>
            </div>
            <div className="flex items-center gap-3">
                <button
                    onClick={() => {
                        api.logout();
                        if (onLogout) onLogout();
                    }}
                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-red-400 hover:bg-red-400/10 transition-all"
                    title="Sair"
                >
                    <LogOut className="w-5 h-5" />
                </button>
                <div className="w-10 h-10 rounded-full bg-surface-light border border-white/10 flex items-center justify-center">
                    <span className="text-lg">🏋️‍♂️</span>
                </div>
            </div>
        </div>
    );
}
