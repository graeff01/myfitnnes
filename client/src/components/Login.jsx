import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, UserPlus, Lock, User, ArrowRight, Loader2, Dumbbell } from 'lucide-react';
import { login, register } from '../services/api';
import { toast } from 'react-hot-toast';

export default function Login({ onLoginSuccess }) {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username || !password) {
            toast.error('Preencha todos os campos');
            return;
        }

        setLoading(true);
        try {
            if (isLogin) {
                await login(username, password);
                toast.success('Bem-vindo de volta!');
            } else {
                await register(username, password);
                toast.success('Conta criada com sucesso!');
            }
            onLoginSuccess();
        } catch (error) {
            toast.error(error.message || 'Erro ao processar');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[100dvh] bg-black flex items-center justify-center p-6 pb-12 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-sm z-10"
            >
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                        className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-primary/20 shadow-[0_0_30px_rgba(var(--primary-rgb),0.1)]"
                    >
                        <Dumbbell className="w-10 h-10 text-primary" />
                    </motion.div>
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">MyFit Tracker</h1>
                    <p className="text-zinc-400">Sua jornada fitness elevada de nível.</p>
                </div>

                <div className="bg-[#121212]/80 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 shadow-2xl overflow-hidden relative">
                    <div className="flex bg-white/5 p-1.5 rounded-2xl mb-8">
                        <button
                            onClick={() => setIsLogin(true)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all duration-300 ${isLogin ? 'bg-primary text-black font-semibold' : 'text-zinc-400'}`}
                        >
                            <LogIn className="w-4 h-4" />
                            <span>Login</span>
                        </button>
                        <button
                            onClick={() => setIsLogin(false)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all duration-300 ${!isLogin ? 'bg-primary text-black font-semibold' : 'text-zinc-400'}`}
                        >
                            <UserPlus className="w-4 h-4" />
                            <span>Criar Conta</span>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-zinc-500 ml-1 uppercase tracking-wider">Usuário</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                    <User className="w-5 h-5 text-zinc-500 group-focus-within:text-primary transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Seu usuário"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all placeholder:text-zinc-600"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-zinc-500 ml-1 uppercase tracking-wider">Senha</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                    <Lock className="w-5 h-5 text-zinc-500 group-focus-within:text-primary transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    placeholder="Sua senha"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all placeholder:text-zinc-600"
                                />
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02, backgroundColor: '#d9ff00' }}
                            whileTap={{ scale: 0.98 }}
                            disabled={loading}
                            className="w-full bg-primary text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 mt-4 shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <>
                                    <span>{isLogin ? 'Entrar Agora' : 'Começar Jornada'}</span>
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </motion.button>
                    </form>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-zinc-600 text-sm">
                        Suas informações são gravadas localmente e no servidor de forma segura.
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
