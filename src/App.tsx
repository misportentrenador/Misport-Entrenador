
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { BookingWizard } from './components/BookingWizard';
import { Calendar, User, LayoutDashboard, LogOut, Menu, X, Plus, Users, MapPin, Clock, List, XCircle, AlertCircle } from 'lucide-react';
import { Reservation } from './types';

// --- Dashboard Component (CLIENT) ---
const Dashboard: React.FC = () => {
    const { user, reservations, centers, cancelReservation } = useApp();
    const myReservations = reservations.filter(r => r.userId === user?.id).sort((a, b) => b.createdAt - a.createdAt);

    const handleCancelClick = (reservationId: string) => {
        if (window.confirm("¿Estás seguro de que deseas cancelar esta reserva? Esta acción no se puede deshacer.")) {
            cancelReservation(reservationId);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="bg-gradient-to-r from-secondary to-slate-700 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2">Hola, {user?.name.split(' ')[0]} 👋</h1>
                    <p className="opacity-90">Listo para entrenar hoy en MISPORT?</p>
                    <Link to="/book" className="mt-6 inline-block bg-primary hover:bg-orange-600 text-white px-6 py-3 rounded-full font-bold shadow-lg transition-transform hover:scale-105">
                        Nueva Reserva
                    </Link>
                </div>
                <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-10 translate-y-10">
                    <Calendar size={200} />
                </div>
            </div>

            <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Calendar className="text-primary" size={20} /> Mis Próximas Sesiones
                </h2>
                <div className="grid gap-4">
                    {myReservations.length === 0 ? (
                        <div className="text-center p-12 bg-white rounded-xl shadow-sm border border-gray-100">
                            <AlertCircle className="mx-auto text-gray-300 mb-3" size={48} />
                            <p className="text-gray-500 font-medium">No tienes reservas activas.</p>
                            <Link to="/book" className="text-primary text-sm font-bold mt-2 inline-block hover:underline">¡Reserva tu primera clase!</Link>
                        </div>
                    ) : (
                        myReservations.map(r => {
                            const center = centers.find(c => c.id === r.centerId);
                            const isConfirmed = r.status === 'CONFIRMED';
                            
                            return (
                                <div key={r.id} className={`bg-white p-5 rounded-xl shadow-sm border flex flex-col sm:flex-row justify-between items-center hover:shadow-md transition-shadow gap-4 ${isConfirmed ? 'border-gray-100' : 'border-gray-100 bg-gray-50 opacity-75'}`}>
                                    <div className="flex gap-5 items-center w-full sm:w-auto">
                                        <div className={`p-4 rounded-xl font-bold text-center min-w-[70px] ${isConfirmed ? 'bg-orange-50 text-primary' : 'bg-gray-200 text-gray-500'}`}>
                                            <div className="text-xs uppercase tracking-wider">{new Date(r.date).toLocaleDateString('es-ES', { month: 'short' }).replace('.', '')}</div>
                                            <div className="text-2xl leading-none mt-1">{new Date(r.date).getDate()}</div>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg text-gray-800">{center?.name}</h4>
                                            <p className="text-gray-500 font-medium flex items-center gap-1.5">
                                                <Clock size={14} /> {r.startTime} - {r.endTime}
                                            </p>
                                            <span className={`inline-flex items-center gap-1 mt-2 text-xs px-2.5 py-1 rounded-full font-bold ${isConfirmed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {isConfirmed ? 'Confirmada' : 'Cancelada'}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {isConfirmed && (
                                        <button 
                                            onClick={() => handleCancelClick(r.id)}
                                            className="w-full sm:w-auto flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 hover:text-red-600 px-4 py-2.5 rounded-lg text-sm font-bold transition-all border border-transparent hover:border-red-100 group"
                                            title="Cancelar esta reserva"
                                        >
                                            <XCircle size={18} className="group-hover:scale-110 transition-transform"/>
                                            Cancelar Reserva
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
    const [activeTab, setActiveTab] = useState<'reservas' | 'centros' | 'entrenadores'>('reservas');

    const filteredReservations = reservations.filter(r => filterCenter === 'all' || r.centerId === filterCenter);

    return (
        <div className="space-y-6 animate-fade-in">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Panel de Administración</h1>
                    <p className="text-sm text-gray-500">Gestión integral de MISPORT</p>
                </div>
                
                <div className="flex gap-2 w-full md:w-auto">
                    <select 
                        className="bg-white border p-2 rounded-lg w-full md:w-48 shadow-sm"
                        value={filterCenter}
                        onChange={(e) => setFilterCenter(e.target.value)}
                    >
                        <option value="all">Todos los Centros</option>
                        {centers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
            </header>

            {/* Admin Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-xs uppercase tracking-wider font-bold">Reservas Totales</p>
                        <p className="text-3xl font-bold text-secondary mt-1">{reservations.length}</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-full text-blue-600"><Calendar size={24}/></div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-xs uppercase tracking-wider font-bold">Centros Activos</p>
                        <p className="text-3xl font-bold text-primary mt-1">{centers.filter(c => c.isActive).length}</p>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-full text-primary"><MapPin size={24}/></div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-xs uppercase tracking-wider font-bold">Entrenadores</p>
                        <p className="text-3xl font-bold text-secondary mt-1">{trainers.length}</p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-full text-purple-600"><Users size={24}/></div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-xs uppercase tracking-wider font-bold">Reglas Horarias</p>
                        <p className="text-3xl font-bold text-gray-600 mt-1">{scheduleRules.length}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-full text-gray-600"><Clock size={24}/></div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-gray-200">
                <button 
                    onClick={() => setActiveTab('reservas')}
                    className={`px-6 py-3 font-medium text-sm transition-colors relative ${activeTab === 'reservas' ? 'text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <span className="flex items-center gap-2"><List size={16}/> Reservas</span>
                    {activeTab === 'reservas' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></div>}
                </button>
                <button 
                    onClick={() => setActiveTab('centros')}
                    className={`px-6 py-3 font-medium text-sm transition-colors relative ${activeTab === 'centros' ? 'text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <span className="flex items-center gap-2"><MapPin size={16}/> Centros</span>
                    {activeTab === 'centros' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></div>}
                </button>
                <button 
                    onClick={() => setActiveTab('entrenadores')}
                    className={`px-6 py-3 font-medium text-sm transition-colors relative ${activeTab === 'entrenadores' ? 'text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <span className="flex items-center gap-2"><Users size={16}/> Entrenadores</span>
                    {activeTab === 'entrenadores' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></div>}
                </button>
            </div>

            {/* Tab Content: RESERVAS */}
            {activeTab === 'reservas' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                        <h3 className="font-bold text-gray-700">Listado de Reservas</h3>
                        <button className="text-primary text-sm font-bold flex items-center gap-1"><Plus size={16}/> Nueva</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3">Fecha</th>
                                    <th className="px-6 py-3">Cliente</th>
                                    <th className="px-6 py-3">Centro</th>
                                    <th className="px-6 py-3">Entrenador</th>
                                    <th className="px-6 py-3">Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredReservations.map(r => {
                                    const trainer = trainers.find(t => t.id === r.trainerId);
                                    const center = centers.find(c => c.id === r.centerId);
                                    return (
                                        <tr key={r.id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-medium whitespace-nowrap">{r.date} <span className="text-gray-500 ml-1">{r.startTime}</span></td>
                                            <td className="px-6 py-4">Cliente Demo</td>
                                            <td className="px-6 py-4">{center?.name}</td>
                                            <td className="px-6 py-4">{trainer?.name || '-'}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${r.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {r.status === 'CONFIRMED' ? 'ACTIVA' : 'CANCELADA'}
                                                </span>
                                            </td>
                                        </tr>
                                    )
                                })}
                                {filteredReservations.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                            <Calendar className="mx-auto mb-2 opacity-20" size={32}/>
                                            No hay reservas que coincidan con el filtro.
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
                        <div key={center.id} className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all">
                            <div className="h-32 overflow-hidden relative">
                                <img src={center.image} alt={center.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                                <div className="absolute top-2 right-2">
                                     <span className={`px-2 py-1 rounded text-xs font-bold shadow-sm ${center.isActive ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                        {center.isActive ? 'ACTIVO' : 'INACTIVO'}
                                     </span>
                                </div>
                            </div>
                            <div className="p-5">
                                <h3 className="font-bold text-lg text-gray-800">{center.name}</h3>
                                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1"><MapPin size={14}/> {center.address}</p>
                                <p className="text-sm text-gray-600 mt-3 line-clamp-2">{center.description}</p>
                            </div>
                        </div>
                    ))}
                 </div>
            )}

            {/* Tab Content: ENTRENADORES */}
            {activeTab === 'entrenadores' && (
                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {trainers.map(trainer => (
                        <div key={trainer.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all text-center pb-4">
                            <div className="aspect-[4/5] relative overflow-hidden bg-gray-100">
                                <img src={trainer.avatar} alt={trainer.name} className="w-full h-full object-cover filter grayscale contrast-125"/>
                            </div>
                            <div className="mt-4 px-4">
                                <h3 className="font-bold text-gray-800">{trainer.name}</h3>
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
    const { login } = useApp();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            setError('Por favor completa todos los campos');
            return;
        }
        
        const success = login(email);
        if (!success) {
            setError('Credenciales inválidas');
        }
    };

    return (
        <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-primary/30">
                        <DumbbellIcon size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-1">MISPORT</h1>
                    <p className="text-gray-500 font-medium">Solution Training</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Correo electrónico</label>
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            placeholder="ej. cliente@misport.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Contraseña</label>
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            placeholder="••••••••"
                        />
                    </div>
                    
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <button 
                        type="submit"
                        className="w-full bg-primary hover:bg-orange-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                        INICIAR SESIÓN
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">Cuentas de prueba</p>
                    <div className="text-sm text-gray-600 space-y-1 bg-gray-50 p-3 rounded-lg">
                        <p><span className="font-bold">Admin:</span> direccion@misport.es</p>
                        <p><span className="font-bold">Usuario:</span> cliente@misport.com</p>
                        <p className="text-xs text-gray-400 mt-2">(Contraseña: cualquiera)</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

function DumbbellIcon({size}: {size: number}) {
    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width={size} 
            height={size} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
        >
            <path d="m6.5 6.5 11 11"/>
            <path d="m21 21-1-1"/>
            <path d="m3 3 1 1"/>
            <path d="m18 22 4-4"/>
            <path d="m2 6 4-4"/>
            <path d="m3 10 7.9-7.9a2.12 2.12 0 0 1 3 3L6 12.9a2.12 2.12 0 0 1-3-2.9Z"/>
            <path d="m12.9 6 7.9 7.9a2.12 2.12 0 1 1-3 3L10 9a2.12 2.12 0 0 1 2.9-3Z"/>
        </svg>
    )
}

// --- Layout & Main App ---
const Layout: React.FC = () => {
    const { user, logout, isAdmin } = useApp();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    if (!user) return <LoginScreen />;

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
            {/* Navbar */}
            <nav className="bg-white shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <Link to="/" className="flex items-center gap-2 group">
                                <div className="text-primary group-hover:rotate-12 transition-transform duration-300">
                                    <DumbbellIcon size={24} />
                                </div>
                                <span className="text-secondary font-bold text-2xl tracking-tighter">MISPORT</span>
                            </Link>
                        </div>
                        
                        {/* Desktop Menu */}
                        <div className="hidden md:flex items-center space-x-8">
                            <Link to="/" className="text-gray-600 hover:text-primary font-medium transition-colors">Inicio</Link>
                            {!isAdmin && <Link to="/book" className="text-gray-600 hover:text-primary font-medium transition-colors">Reservar</Link>}
                            {isAdmin && <Link to="/admin" className="text-primary font-bold transition-colors">Administración</Link>}
                            <div className="flex items-center gap-4 ml-4 pl-4 border-l border-gray-200">
                                <div className="text-right">
                                    <span className="block text-sm font-bold text-gray-800 leading-tight">{user.name}</span>
                                    <span className="block text-xs text-gray-500 uppercase tracking-wider">{user.role === 'ADMIN' ? 'Administrador' : 'Cliente'}</span>
                                </div>
                                <button onClick={logout} title="Salir" className="text-gray-400 hover:text-red-500 transition-colors bg-gray-50 p-2 rounded-full">
                                    <LogOut size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Mobile Button */}
                        <div className="md:hidden flex items-center">
                            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-600 p-2">
                                {mobileMenuOpen ? <X /> : <Menu />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-white border-t p-4 space-y-4 shadow-lg absolute w-full z-50">
                        <div className="pb-4 border-b border-gray-100 mb-4">
                             <p className="font-bold text-gray-800">{user.name}</p>
                             <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                        <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block text-gray-800 font-medium py-2">Inicio</Link>
                        {!isAdmin && <Link to="/book" onClick={() => setMobileMenuOpen(false)} className="block text-gray-800 font-medium py-2">Reservar</Link>}
                        {isAdmin && <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="block text-primary font-bold py-2">Administración</Link>}
                        <button onClick={logout} className="text-red-500 font-medium w-full text-left py-2 flex items-center gap-2"><LogOut size={16}/> Cerrar Sesión</button>
                    </div>
                )}
            </nav>

            <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
                <Routes>
                    <Route path="/" element={isAdmin ? <Navigate to="/admin" /> : <Dashboard />} />
                    <Route path="/book" element={<BookingWizard />} />
                    <Route path="/admin" element={isAdmin ? <AdminDashboard /> : <Navigate to="/" />} />
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