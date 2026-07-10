
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, Outlet, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { FinanceProvider } from './context/FinanceContext';
import { BookingWizard } from './components/BookingWizard';
import { Calendar, LogOut, Menu, X, Clock, XCircle, AlertCircle, Lock } from 'lucide-react';
import { AdminShell } from './layouts/AdminShell';
import { InicioPage } from './pages/admin/InicioPage';
import { ClientesPage } from './pages/admin/ClientesPage';
import { AgendaPage } from './pages/admin/AgendaPage';
import { ReservasPage } from './pages/admin/ReservasPage';
import { CentrosPage } from './pages/admin/CentrosPage';
import { EntrenadoresPage } from './pages/admin/EntrenadoresPage';
import { FinanzasPage } from './pages/admin/FinanzasPage';
import { ProximamentePage } from './pages/admin/ProximamentePage';

// --- ROUTE GUARDS ---

const RequireAuth = ({ children }: { children?: React.ReactNode }) => {
    const { user } = useApp();
    const location = useLocation();

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    return <>{children}</>;
};

const RequireAdmin = ({ children }: { children?: React.ReactNode }) => {
    const { user } = useApp();
    
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (user.role !== 'ADMIN') {
        // Silent redirect to home if a client tries to access admin
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

// --- SCREENS ---

// 1. CLIENT DASHBOARD
const ClientDashboard: React.FC = () => {
    const { user, reservations, centers, cancelReservation } = useApp();
    // Filter strictly by user ID
    const myReservations = reservations
        .filter(r => r.userId === user?.id)
        .sort((a, b) => b.createdAt - a.createdAt);

    const handleCancelClick = (reservationId: string) => {
        if (window.confirm("¿Estás seguro de que deseas cancelar esta reserva? Esta acción no se puede deshacer.")) {
            cancelReservation(reservationId);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Hero Card */}
            <div className="bg-gradient-to-r from-misportBlue to-blue-900 text-white p-8 rounded-2xl shadow-xl relative overflow-hidden border border-blue-800/50">
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2">Hola, {user?.name.split(' ')[0]} 👋</h1>
                    <p className="opacity-90 font-light text-blue-100">¿Listo para superar tus límites en MISPORT?</p>
                    <Link to="/book" className="mt-8 inline-block bg-misportOrange hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-bold shadow-lg transition-all hover:translate-y-[-2px] hover:shadow-orange-500/20">
                        NUEVA RESERVA
                    </Link>
                </div>
                <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-10 translate-y-10">
                    <Calendar size={200} />
                </div>
            </div>

            {/* Reservations List */}
            <div>
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 border-l-4 border-misportBlue pl-3">
                    Mis Próximas Sesiones
                </h2>
                <div className="grid gap-4">
                    {myReservations.length === 0 ? (
                        <div className="text-center p-12 bg-misportDark rounded-xl shadow-sm border border-gray-800">
                            <AlertCircle className="mx-auto text-gray-600 mb-3" size={48} />
                            <p className="text-gray-400 font-medium">No tienes reservas activas.</p>
                            <Link to="/book" className="text-misportBlue text-sm font-bold mt-3 inline-block hover:underline">¡Reserva tu primera clase!</Link>
                        </div>
                    ) : (
                        myReservations.map(r => {
                            const center = centers.find(c => c.id === r.centerId);
                            const isConfirmed = r.status === 'CONFIRMED';
                            
                            return (
                                <div key={r.id} className={`bg-misportDark p-6 rounded-xl shadow-lg border flex flex-col sm:flex-row justify-between items-center hover:border-misportBlue/30 transition-all gap-4 ${isConfirmed ? 'border-gray-800' : 'border-red-900/30 bg-red-950/10 opacity-75'}`}>
                                    <div className="flex gap-5 items-center w-full sm:w-auto">
                                        <div className={`p-4 rounded-lg font-bold text-center min-w-[80px] ${isConfirmed ? 'bg-blue-900/20 text-misportBlue border border-blue-900/50' : 'bg-gray-800 text-gray-500'}`}>
                                            <div className="text-xs uppercase tracking-wider">{new Date(r.date).toLocaleDateString('es-ES', { month: 'short' }).replace('.', '')}</div>
                                            <div className="text-3xl leading-none mt-1">{new Date(r.date).getDate()}</div>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg text-white">{center?.name}</h4>
                                            <p className="text-gray-400 font-medium flex items-center gap-1.5 text-sm mt-1">
                                                <Clock size={14} className="text-misportOrange" /> {r.startTime} - {r.endTime}
                                            </p>
                                            <span className={`inline-flex items-center gap-1 mt-3 text-xs px-2.5 py-0.5 rounded border ${isConfirmed ? 'bg-green-900/20 text-green-400 border-green-900/50' : 'bg-red-900/20 text-red-400 border-red-900/50'}`}>
                                                {isConfirmed ? 'CONFIRMADA' : 'CANCELADA'}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {isConfirmed && (
                                        <button 
                                            onClick={() => handleCancelClick(r.id)}
                                            className="w-full sm:w-auto flex items-center justify-center gap-2 text-red-400 hover:bg-red-950/30 hover:text-red-300 px-5 py-2.5 rounded-lg text-sm font-bold transition-all border border-transparent hover:border-red-900/30 group"
                                        >
                                            <XCircle size={18} className="group-hover:scale-110 transition-transform"/>
                                            Cancelar
                                        </button>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

// 2. LOGIN SCREEN
const LoginScreen: React.FC = () => {
    const { login, user } = useApp();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    if (user) {
        return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/'} replace />;
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!email || !password) {
            setError('Por favor completa todos los campos');
            return;
        }
        
        const result = login(email, password);
        if (!result.success) {
            setError(result.message || 'Credenciales inválidas');
        }
    };

    return (
        <div className="min-h-screen bg-misportBlack flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute -top-[10%] -right-[10%] w-[50%] h-[50%] bg-misportBlue/10 rounded-full blur-[120px]"></div>
                <div className="absolute -bottom-[10%] -left-[10%] w-[50%] h-[50%] bg-misportOrange/5 rounded-full blur-[120px]"></div>
            </div>

            <div className="bg-misportDark rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-800 relative z-10">
                <div className="text-center mb-8">
                     <img 
                        src="/misport-logo.png" 
                        alt="MISPORT Logo" 
                        className="w-40 h-auto object-contain mx-auto mb-6"
                    />
                    <h1 className="text-2xl font-bold text-white mb-1">INICIAR SESIÓN</h1>
                    <p className="text-gray-400 font-medium text-sm">Accede a tu cuenta</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Correo electrónico</label>
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:ring-2 focus:ring-misportBlue focus:border-transparent outline-none transition-all"
                            placeholder="tu@email.com"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Contraseña</label>
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:ring-2 focus:ring-misportBlue focus:border-transparent outline-none transition-all"
                            placeholder="••••••••"
                        />
                    </div>
                    
                    {error && <p className="text-red-400 text-sm text-center bg-red-900/20 p-2 rounded">{error}</p>}

                    <button 
                        type="submit"
                        className="w-full bg-misportBlue hover:bg-blue-600 text-white font-bold py-4 rounded-lg transition-all shadow-lg hover:shadow-blue-600/20 transform hover:-translate-y-0.5 mt-2"
                    >
                        ENTRAR
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-800 text-center">
                    <p className="text-sm text-gray-500">
                        ¿No tienes cuenta? <Link to="/register" className="text-misportBlue hover:text-white font-bold transition-colors">Regístrate aquí</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

// 4. REGISTER SCREEN
const RegisterScreen: React.FC = () => {
    const { register, user } = useApp();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    if (user) {
        return <Navigate to="/" replace />;
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!name || !email || !password) {
            setError('Todos los campos son obligatorios');
            return;
        }

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        const result = register(name, email, password);
        if (!result.success) {
            setError(result.message || 'Error al registrarse');
        }
    };

    return (
        <div className="min-h-screen bg-misportBlack flex items-center justify-center p-4 relative overflow-hidden">
            <div className="bg-misportDark rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-800 relative z-10">
                <div className="text-center mb-6">
                     <img src="/misport-logo.png" alt="MISPORT" className="w-32 h-auto object-contain mx-auto mb-4"/>
                    <h1 className="text-2xl font-bold text-white mb-1">CREAR CUENTA</h1>
                    <p className="text-gray-400 font-medium text-sm">Únete a MISPORT Solution Training</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nombre Completo</label>
                        <input 
                            type="text" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-3.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:ring-2 focus:ring-misportBlue focus:border-transparent outline-none transition-all"
                            placeholder="Tu nombre"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Correo electrónico</label>
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:ring-2 focus:ring-misportBlue focus:border-transparent outline-none transition-all"
                            placeholder="tu@email.com"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Contraseña</label>
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:ring-2 focus:ring-misportBlue focus:border-transparent outline-none transition-all"
                            placeholder="Mínimo 6 caracteres"
                        />
                    </div>
                    
                    {error && <p className="text-red-400 text-sm text-center bg-red-900/20 p-2 rounded">{error}</p>}

                    <button 
                        type="submit"
                        className="w-full bg-misportOrange hover:bg-orange-600 text-white font-bold py-4 rounded-lg transition-all shadow-lg hover:shadow-orange-500/20 transform hover:-translate-y-0.5 mt-2"
                    >
                        REGISTRARSE
                    </button>
                </form>

                <div className="mt-6 pt-6 border-t border-gray-800 text-center">
                    <p className="text-sm text-gray-500">
                        ¿Ya tienes cuenta? <Link to="/login" className="text-misportBlue hover:text-white font-bold transition-colors">Inicia sesión</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};


// --- CLIENT CHROME (navbar + content for client-facing routes) ---
const ClientChrome: React.FC = () => {
    const { user, logout, isAdmin } = useApp();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-misportBlack flex flex-col font-sans text-gray-200">
            {/* Navbar (Only visible if logged in) */}
            {user && (
                <nav className="bg-misportBlack border-b border-gray-800 sticky top-0 z-50 shadow-md">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-20">
                            <div className="flex items-center">
                                <Link to="/" className="flex items-center gap-3 group">
                                    <div className="h-10 w-auto">
                                        <img src="/misport-logo.png" alt="MISPORT" className="h-full w-auto object-contain" />
                                    </div>
                                    <span className="text-white font-bold text-xl tracking-tight hidden sm:block group-hover:text-misportBlue transition-colors">
                                        SOLUTION TRAINING
                                    </span>
                                </Link>
                            </div>
                            
                            {/* Desktop Menu */}
                            <div className="hidden md:flex items-center space-x-8">
                                <Link to="/" className="text-gray-300 hover:text-misportBlue font-medium transition-colors text-sm uppercase tracking-wide">Inicio</Link>
                                {!isAdmin && <Link to="/book" className="text-gray-300 hover:text-misportBlue font-medium transition-colors text-sm uppercase tracking-wide">Reservar</Link>}
                                {isAdmin && <Link to="/admin" className="text-misportBlue font-bold transition-colors text-sm uppercase tracking-wide flex items-center gap-1"><Lock size={14}/> Administración</Link>}
                                <div className="flex items-center gap-4 ml-6 pl-6 border-l border-gray-800">
                                    <div className="text-right">
                                        <span className="block text-sm font-bold text-white leading-tight">{user.name}</span>
                                        <span className="block text-xs text-gray-500 uppercase tracking-wider">{isAdmin ? 'Administrador' : 'Cliente'}</span>
                                    </div>
                                    <button onClick={logout} title="Salir" className="text-gray-400 hover:text-red-500 transition-colors bg-gray-900 p-2.5 rounded-full border border-gray-800 hover:border-red-900">
                                        <LogOut size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Mobile Button */}
                            <div className="md:hidden flex items-center">
                                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-300 hover:text-white p-2">
                                    {mobileMenuOpen ? <X /> : <Menu />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    {mobileMenuOpen && (
                        <div className="md:hidden bg-misportDark border-b border-gray-800 p-4 space-y-4 shadow-xl absolute w-full z-50">
                            <div className="pb-4 border-b border-gray-800 mb-4">
                                <p className="font-bold text-white">{user.name}</p>
                                <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block text-gray-300 hover:text-white font-medium py-2">INICIO</Link>
                            {!isAdmin && <Link to="/book" onClick={() => setMobileMenuOpen(false)} className="block text-gray-300 hover:text-white font-medium py-2">RESERVAR</Link>}
                            {isAdmin && <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="block text-misportBlue font-bold py-2">ADMINISTRACIÓN</Link>}
                            <button onClick={logout} className="text-red-400 font-medium w-full text-left py-2 flex items-center gap-2 mt-4"><LogOut size={16}/> Cerrar Sesión</button>
                        </div>
                    )}
                </nav>
            )}

            <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
                <Outlet />
            </main>
        </div>
    );
};

// --- ROUTES ---
const Layout: React.FC = () => {
    return (
        <Routes>
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/register" element={<RegisterScreen />} />

            {/* Protected Client Routes (top navbar chrome) */}
            <Route element={<ClientChrome />}>
                <Route path="/" element={
                    <RequireAuth>
                        <ClientDashboard />
                    </RequireAuth>
                } />
                <Route path="/book" element={
                    <RequireAuth>
                        <BookingWizard />
                    </RequireAuth>
                } />
            </Route>

            {/* Protected Admin Routes (sidebar dashboard chrome) */}
            <Route path="/admin" element={
                <RequireAdmin>
                    <AdminShell />
                </RequireAdmin>
            }>
                <Route index element={<Navigate to="inicio" replace />} />
                <Route path="inicio" element={<InicioPage />} />
                <Route path="clientes" element={<ClientesPage />} />
                <Route path="agenda" element={<AgendaPage />} />
                <Route path="reservas" element={<ReservasPage />} />
                <Route path="centros" element={<CentrosPage />} />
                <Route path="entrenadores" element={<EntrenadoresPage />} />
                <Route path="finanzas" element={<FinanzasPage />} />
                <Route path="proximamente" element={<ProximamentePage />} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

const App: React.FC = () => {
  return (
    <AppProvider>
        <FinanceProvider>
            <HashRouter>
                <Layout />
            </HashRouter>
        </FinanceProvider>
    </AppProvider>
  );
};

export default App;
