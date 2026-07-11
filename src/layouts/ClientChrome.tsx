import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { LogOut, Menu, X, Lock } from 'lucide-react';
import { useApp } from '../context/AppContext';

/** Top navbar + content wrapper for client-facing routes ("/", "/book"). */
export const ClientChrome: React.FC = () => {
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
