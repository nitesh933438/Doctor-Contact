import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, LayoutDashboard, Stethoscope } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 px-4 py-4">
      <div className="max-w-7xl mx-auto px-6 py-3 glass-morphism rounded-2xl shadow-sm flex justify-between items-center bg-white/80 backdrop-blur-md border border-white/20">
        <Link to="/" className="flex items-center gap-2 group text-slate-900 font-bold text-xl">
          <div className="bg-blue-600 p-2 rounded-xl text-white group-hover:scale-110 transition-transform">
            <Stethoscope size={22} strokeWidth={2.5} />
          </div>
          <span className="font-display tracking-tight">DocReserve</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-1">
          <Link to="/doctors" className="text-slate-600 hover:text-blue-600 px-4 py-2 text-sm font-medium transition-colors">Find Doctors</Link>
          {user && (
            <Link to="/dashboard" className="text-slate-600 hover:text-blue-600 px-4 py-2 text-sm font-medium flex items-center gap-2 transition-colors">
              <LayoutDashboard size={16} /> Dash
            </Link>
          )}
          <div className="w-px h-4 bg-slate-200 mx-2" />
          {user ? (
            <button 
              onClick={handleLogout}
              className="bg-slate-900 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-red-600 transition-all active:scale-95 flex items-center gap-2"
            >
              <LogOut size={16} /> Logout
            </button>
          ) : (
            <Link to="/login" className="bg-slate-900 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all active:scale-95 flex items-center gap-2">
              <User size={16} /> Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
