import React from 'react';

export default function Header({ title = "MyFit", subtitle = "Sua jornada diária" }) {
    return (
        <div className="flex justify-between items-center mb-6">
            <div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                    {title}
                </h1>
                <p className="text-sm text-text-secondary uppercase tracking-wider font-medium">
                    {subtitle}
                </p>
            </div>
            <div>
                <div className="w-10 h-10 rounded-full bg-surface-light border border-white/10 flex items-center justify-center">
                    <span className="text-lg">🏋️‍♂️</span>
                </div>
            </div>
        </div>
    );
}
