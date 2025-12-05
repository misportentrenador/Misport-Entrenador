import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { BookingWizard } from './components/BookingWizard';
import { Calendar, User, LayoutDashboard, LogOut, Menu, X, Plus, Users, MapPin, Clock, List, XCircle, AlertCircle, Filter } from 'lucide-react';
import { UserRole } from './types';

// --- Protected Route Component ---
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: UserRole[] }) => {
    const { user } = useApp();
    const location = useLocation();

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!allowedRoles.includes(user.role)) {
        // Redirect to their default dashboard if they try to access unauthorized page
        return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/'} replace />;
    }

    return <>{children}</>;
};

// --- Dashboard Component (CLIENT) ---
const Dashboard: React.FC = () => {
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

// --- Admin Dashboard Component ---
const AdminDashboard: React.FC = () => {
    const { reservations, centers, trainers, scheduleRules } = useApp();
    const [filterCenter, setFilterCenter] = useState<string>('all');
    const [filterDate, setFilterDate] = useState<string>('');
    const [activeTab, setActiveTab] = useState<'reservas' | 'centros' | 'entrenadores'>('reservas');

    // Admin sees ALL reservations, filtered by UI controls
    const filteredReservations = reservations.filter(r => {
        const matchesCenter = filterCenter === 'all' || r.centerId === filterCenter;
        const matchesDate = filterDate === '' || r.date === filterDate;
        return matchesCenter && matchesDate;
    });

    return (
        <div className="space-y-8 animate-fade-in">
            <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-gray-800 pb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Panel de Administración</h1>
                    <p className="text-sm text-gray-400 mt-1">Gestión integral de centros y reservas</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                    <div className="flex items-center gap-2">
                         <Filter size={16} className="text-misportBlue" />
                         <span className="text-xs font-bold text-gray-500 uppercase">Filtros</span>
                    </div>
                    <select 
                        className="bg-misportDark border border-gray-700 text-white p-2.5 rounded-lg w-full sm:w-48 shadow-sm focus:border-misportBlue focus:ring-1 focus:ring-misportBlue outline-none text-sm"
                        value={filterCenter}
                        onChange={(e) => setFilterCenter(e.target.value)}
                    >
                        <option value="all">Todos los Centros</option>
                        {centers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <input 
                        type="date"
                        className="bg-misportDark border border-gray-700 text-white p-2.5 rounded-lg w-full sm:w-auto shadow-sm focus:border-misportBlue focus:ring-1 focus:ring-misportBlue outline-none text-sm"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        placeholder="Filtrar por fecha"
                    />
                    {filterDate && (
                        <button onClick={() => setFilterDate('')} className="text-xs text-red-400 hover:text-red-300 underline">
                            Limpiar fecha
                        </button>
                    )}
                </div>
            </header>

            {/* Admin Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Reservas Totales', val: reservations.length, icon: Calendar, color: 'text-misportBlue', bg: 'bg-blue-900/20' },
                    { label: 'Centros Activos', val: centers.filter(c => c.isActive).length, icon: MapPin, color: 'text-misportOrange', bg: 'bg-orange-900/20' },
                    { label: 'Entrenadores', val: trainers.length, icon: Users, color: 'text-green-400', bg: 'bg-green-900/20' },
                    { label: 'Reglas Horarias', val: scheduleRules.length, icon: Clock, color: 'text-purple-400', bg: 'bg-purple-900/20' }
                ].map((stat, i) => (
                    <div key={i} className="bg-misportDark p-6 rounded-xl shadow-lg border border-gray-800 flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-xs uppercase tracking-wider font-bold">{stat.label}</p>
                            <p className="text-3xl font-bold text-white mt-2">{stat.val}</p>
                        </div>
                        <div className={`${stat.bg} p-3 rounded-lg ${stat.color}`}><stat.icon size={24}/></div>
                    </div>
                ))}
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-gray-800 overflow-x-auto">
                {['reservas', 'centros', 'entrenadores'].map((tab) => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`px-8 py-4 font-medium text-sm transition-colors relative capitalize whitespace-nowrap ${activeTab === tab ? 'text-misportBlue' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        <span className="flex items-center gap-2">
                            {tab === 'reservas' && <List size={16}/>}
                            {tab === 'centros' && <MapPin size={16}/>}
                            {tab === 'entrenadores' && <Users size={16}/>}
                            {tab}
                        </span>
                        {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-misportBlue shadow-[0_0_10px_rgba(0,123,255,0.5)]"></div>}
                    </button>
                ))}
            </div>

            {/* Tab Content: RESERVAS */}
            {activeTab === 'reservas' && (
                <div className="bg-misportDark rounded-xl shadow-lg border border-gray-800 overflow-hidden">
                    <div className="p-5 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            Listado de Reservas 
                            {filterDate && <span className="text-xs font-normal text-gray-400 bg-gray-800 px-2 py-1 rounded">Fecha: {filterDate}</span>}
                        </h3>
                        <button className="text-misportBlue hover:text-blue-400 text-sm font-bold flex items-center gap-1 transition-colors"><Plus size={16}/> Nueva</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-400">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-900/50 border-b border-gray-800">
                                <tr>
                                    <th className="px-6 py-4">Fecha</th>
                                    <th className="px-6 py-4">Cliente</th>
                                    <th className="px-6 py-4">Centro</th>
                                    <th className="px-6 py-4">Entrenador</th>
                                    <th className="px-6 py-4">Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredReservations.map(r => {
                                    const trainer = trainers.find(t => t.id === r.trainerId);
                                    const center = centers.find(c => c.id === r.centerId);
                                    return (
                                        <tr key={r.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-white whitespace-nowrap">{r.date} <span className="text-gray-500 ml-1">{r.startTime}</span></td>
                                            <td className="px-6 py-4">{r.userId === 'u_client_demo' ? 'Cliente Demo' : r.userId}</td>
                                            <td className="px-6 py-4">{center?.name}</td>
                                            <td className="px-6 py-4">{trainer?.name || '-'}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold border ${r.status === 'CONFIRMED' ? 'bg-green-900/20 text-green-400 border-green-900/50' : 'bg-red-900/20 text-red-400 border-red-900/50'}`}>
                                                    {r.status === 'CONFIRMED' ? 'ACTIVA' : 'CANCELADA'}
                                                </span>
                                            </td>
                                        </tr>
                                    )
                                })}
                                {filteredReservations.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-600">
                                            <Calendar className="mx-auto mb-2 opacity-20" size={32}/>
                                            No hay reservas que coincidan con los filtros.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Tab Content: CENTROS */}
            {activeTab === 'centros' && (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {centers.map(center => (
                        <div key={center.id} className="group bg-misportDark rounded-xl shadow-lg border border-gray-800 overflow-hidden hover:border-misportBlue/50 transition-all">
                            <div className="h-40 overflow-hidden relative">
                                <img src={center.image} alt={center.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"/>
                                <div className="absolute top-2 right-2">
                                     <span className={`px-2 py-1 rounded text-xs font-bold shadow-sm ${center.isActive ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                                        {center.isActive ? 'ACTIVO' : 'INACTIVO'}
                                     </span>
                                </div>
                            </div>
                            <div className="p-5">
                                <h3 className="font-bold text-lg text-white">{center.name}</h3>
                                <p className="text-sm text-gray-400 flex items-center gap-1 mt-1"><MapPin size={14} className="text-misportBlue"/> {center.address}</p>
                                <p className="text-sm text-gray-500 mt-3 line-clamp-2">{center.description}</p>
                            </div>
                        </div>
                    ))}
                 </div>
            )}

            {/* Tab Content: ENTRENADORES */}
            {activeTab === 'entrenadores' && (
                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {trainers.map(trainer => (
                        <div key={trainer.id} className="bg-misportDark rounded-xl shadow-lg border border-gray-800 overflow-hidden hover:border-misportBlue/50 transition-all text-center pb-4">
                            <div className="aspect-[4/5] relative overflow-hidden bg-gray-900">
                                <img src={trainer.avatar} alt={trainer.name} className="w-full h-full object-cover filter grayscale contrast-125 hover:grayscale-0 transition-all duration-500"/>
                            </div>
                            <div className="mt-4 px-4">
                                <h3 className="font-bold text-white">{trainer.name}</h3>
                                <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">{trainer.specialties.length} Especialidades</p>
                                <div className="mt-3 flex justify-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${trainer.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                    <span className="text-xs text-gray-400">{trainer.isActive ? 'Disponible' : 'No disponible'}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                 </div>
            )}
        </div>
    );
};

// --- Login Screen ---
const LoginScreen: React.FC = () => {
    const { login, user } = useApp();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // Redirect if already logged in
    if (user) {
        return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/'} replace />;
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            setError('Por favor completa todos los campos');
            return;
        }
        
        const success = login(email, password);
        if (!success) {
            setError('Credenciales inválidas. Verifica tu email y contraseña.');
        }
    };

    return (
        <div className="min-h-screen bg-misportBlack flex items-center justify-center p-4 relative overflow-hidden">
             {/* Abstract Background Element */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute -top-[10%] -right-[10%] w-[50%] h-[50%] bg-misportBlue/20 rounded-full blur-[120px]"></div>
                <div className="absolute -bottom-[10%] -left-[10%] w-[50%] h-[50%] bg-misportOrange/10 rounded-full blur-[120px]"></div>
            </div>

            <div className="bg-misportDark rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-800 relative z-10">
                <div className="text-center mb-8">
                    <div className="w-24 h-auto mx-auto mb-6">
                        {/* Using IMG tag for logo as requested */}
                        <img 
                            src="/misport-logo.png" 
                            alt="MISPORT Logo" 
                            className="w-full h-full object-contain"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                        />
                        <div className="hidden flex items-center justify-center w-16 h-16 bg-misportBlue rounded-full mx-auto text-white">
                            <Users size={32} />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-1">BIENVENIDO</h1>
                    <p className="text-gray-400 font-medium text-sm">Accede a tu cuenta MISPORT</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Correo electrónico</label>
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-600 focus:ring-2 focus:ring-misportBlue focus:border-transparent outline-none transition-all"
                            placeholder="usuario@misport.com"
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
                        INICIAR SESIÓN
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-800 text-center">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-3">Accesos de demostración</p>
                    <div className="text-sm text-gray-400 space-y-3 bg-gray-900/50 p-4 rounded-lg border border-gray-800 text-left">
                        <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                            <span>Admin:</span> 
                            <div className="text-right">
                                <span className="font-mono text-white block">admin@misport.es</span>
                                <span className="text-xs text-gray-600">Pass: Misport123!</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <span>Usuario:</span> 
                            <div className="text-right">
                                <span className="font-mono text-white block">cliente@misport.es</span>
                                <span className="text-xs text-gray-600">Pass: Cliente123!</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- Layout & Main App ---
const Layout: React.FC = () => {
    const { user, logout, isAdmin } = useApp();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-misportBlack flex flex-col font-sans text-gray-200">
            {/* Navbar */}
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
                        {user && (
                            <div className="hidden md:flex items-center space-x-8">
                                <Link to="/" className="text-gray-300 hover:text-misportBlue font-medium transition-colors text-sm uppercase tracking-wide">Inicio</Link>
                                {!isAdmin && <Link to="/book" className="text-gray-300 hover:text-misportBlue font-medium transition-colors text-sm uppercase tracking-wide">Reservar</Link>}
                                {isAdmin && <Link to="/admin" className="text-misportBlue font-bold transition-colors text-sm uppercase tracking-wide">Administración</Link>}
                                <div className="flex items-center gap-4 ml-6 pl-6 border-l border-gray-800">
                                    <div className="text-right">
                                        <span className="block text-sm font-bold text-white leading-tight">{user.name}</span>
                                        <span className="block text-xs text-misportBlue uppercase tracking-wider">{user.role === 'ADMIN' ? 'Administrador' : 'Cliente'}</span>
                                    </div>
                                    <button onClick={logout} title="Salir" className="text-gray-400 hover:text-red-500 transition-colors bg-gray-900 p-2.5 rounded-full border border-gray-800 hover:border-red-900">
                                        <LogOut size={18} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Mobile Button */}
                        {user && (
                            <div className="md:hidden flex items-center">
                                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-300 hover:text-white p-2">
                                    {mobileMenuOpen ? <X /> : <Menu />}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && user && (
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

            <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
                <Routes>
                    <Route path="/login" element={<LoginScreen />} />
                    
                    {/* Protected Client Routes */}
                    <Route path="/" element={
                        <ProtectedRoute allowedRoles={['CLIENT']}>
                            <Dashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/book" element={
                        <ProtectedRoute allowedRoles={['CLIENT']}>
                            <BookingWizard />
                        </ProtectedRoute>
                    } />
                    
                    {/* Protected Admin Routes */}
                    <Route path="/admin" element={
                        <ProtectedRoute allowedRoles={['ADMIN']}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    } />

                    {/* Catch all - Redirect based on role or to login */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
        </div>
    );
};

const App: React.FC = () => {
  return (
    <AppProvider>
        <HashRouter>
            <Layout />
        </HashRouter>
    </AppProvider>
  );
};

export default App;