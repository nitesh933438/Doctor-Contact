import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  UserRound, 
  CalendarCheck, 
  LogOut, 
  Settings, 
  ChevronRight 
} from 'lucide-react';
import { auth } from '../../services/firebase';
import { signOut } from 'firebase/auth';

const navItems = [
  { name: 'Overview', path: '/admin', icon: BarChart3 },
  { name: 'Doctors', path: '/admin/doctors', icon: UserRound },
  { name: 'Appointments', path: '/admin/appointments', icon: CalendarCheck },
  { name: 'Users', path: '/admin/users', icon: Users },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans selection:bg-slate-900 selection:text-white">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 overflow-y-auto">
        <div className="p-8 pb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
              <Settings className="text-white" size={20} />
            </div>
            <h1 className="font-display text-xl font-bold text-slate-900 tracking-tight">
              DocReserve <span className="text-slate-400 font-medium">Admin</span>
            </h1>
          </div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Management Portal</p>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) => `
                flex items-center justify-between p-4 rounded-2xl transition-all group
                ${isActive 
                  ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }
              `}
            >
              <div className="flex items-center gap-4">
                <item.icon size={20} className={({ isActive }: any) => isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-900'} />
                <span className="font-bold text-[15px]">{item.name}</span>
              </div>
              <ChevronRight size={16} className={`opacity-0 group-hover:opacity-100 transition-opacity`} />
            </NavLink>
          ))}
        </nav>

        <div className="p-6 mt-auto">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 p-4 text-slate-500 font-bold text-[15px] hover:bg-red-50 hover:text-red-600 rounded-2xl transition-all group"
          >
            <LogOut size={20} className="text-slate-400 group-hover:text-red-600" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 max-w-[1600px] mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
