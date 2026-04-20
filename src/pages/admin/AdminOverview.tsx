import React, { useEffect, useState } from 'react';
import { 
  Users, 
  UserRound, 
  CalendarCheck, 
  TrendingUp, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { CardSkeleton, TableSkeleton, Skeleton } from '../../components/ui/Feedback';

const data = [
  { name: 'Mon', appointments: 400 },
  { name: 'Tue', appointments: 300 },
  { name: 'Wed', appointments: 600 },
  { name: 'Thu', appointments: 800 },
  { name: 'Fri', appointments: 500 },
  { name: 'Sat', appointments: 200 },
  { name: 'Sun', appointments: 100 },
];

const COLORS = ['#0F172A', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

export default function AdminOverview() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    revenue: 0,
  });
  const [recentAppointments, setRecentAppointments] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        const doctorsSnap = await getDocs(collection(db, 'doctors'));
        const appointmentsSnap = await getDocs(collection(db, 'appointments'));
        
        let totalRevenue = 0;
        appointmentsSnap.docs.forEach(doc => {
          if (doc.data().paymentStatus === 'paid') {
            totalRevenue += 500; // Assuming 500 per appointment
          }
        });

        setStats({
          totalUsers: usersSnap.size,
          totalDoctors: doctorsSnap.size,
          totalAppointments: appointmentsSnap.size,
          revenue: totalRevenue,
        });

        const recentQ = query(collection(db, 'appointments'), orderBy('createdAt', 'desc'), limit(5));
        const recentSnap = await getDocs(recentQ);
        setRecentAppointments(recentSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error('Error fetching admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const StatCard = ({ title, value, icon: Icon, trend, color }: any) => (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
      <div className="flex justify-between items-start mb-6">
        <div className={`p-4 rounded-2xl ${color} bg-opacity-10 group-hover:scale-110 transition-transform duration-500`}>
          <Icon className={color.replace('bg-', 'text-')} size={24} />
        </div>
        <div className={`flex items-center gap-1 text-sm font-bold ${trend > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
          {trend > 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
          {Math.abs(trend)}%
        </div>
      </div>
      <div>
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-4xl font-display font-bold text-slate-900 tracking-tight">
          {typeof value === 'number' && title.includes('Revenue') ? `₹${value.toLocaleString()}` : value}
        </h3>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-10">
        <Skeleton className="w-1/3 h-12" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <CardSkeleton key={i} />)}
        </div>
        <TableSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-4xl font-display font-bold text-slate-900 mb-2">Dashboard Overview</h1>
        <p className="text-slate-500 font-medium">Welcome back, Administrator. Here's what's happening today.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Users" value={stats.totalUsers} icon={Users} trend={12} color="bg-blue-600" />
        <StatCard title="Total Doctors" value={stats.totalDoctors} icon={UserRound} trend={5} color="bg-indigo-600" />
        <StatCard title="Total Appointments" value={stats.totalAppointments} icon={CalendarCheck} trend={-2} color="bg-emerald-600" />
        <StatCard title="Projected Revenue" value={stats.revenue} icon={DollarSign} trend={24} color="bg-amber-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Appointment Trends</h3>
              <p className="text-sm text-slate-400 font-medium">Daily visualization of booking patterns</p>
            </div>
            <div className="flex bg-slate-50 p-1.5 rounded-xl border border-slate-100">
               <button className="px-5 py-2 rounded-lg text-xs font-bold bg-white text-slate-900 shadow-sm">Week</button>
               <button className="px-5 py-2 rounded-lg text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors">Month</button>
            </div>
          </div>
          
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAppt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0F172A" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#0F172A" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 600 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                    padding: '12px 20px'
                  }}
                  itemStyle={{ 
                    fontSize: '14px', 
                    fontWeight: 'bold',
                    color: '#0F172A'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="appointments" 
                  stroke="#0F172A" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorAppt)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col">
          <div className="mb-8">
            <h3 className="text-xl font-bold text-slate-900">Recent Appointments</h3>
            <p className="text-sm text-slate-400 font-medium tracking-tight">Last 5 confirmed bookings</p>
          </div>

          <div className="space-y-6 flex-1">
            {recentAppointments.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-300">
                <CalendarCheck size={48} className="mb-4 opacity-20" />
                <p className="text-sm font-bold uppercase tracking-widest italic opacity-50">No Data Available</p>
              </div>
            ) : (
              recentAppointments.map((appt, i) => (
                <div key={appt.id} className="flex items-center gap-4 group cursor-pointer">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center font-bold text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-all duration-300">
                    {appt.patientName?.[0] || appt.patientEmail?.[0] || 'P'}
                  </div>
                  <div className="flex-1 border-b border-slate-50 pb-4 group-last:border-none">
                    <div className="flex justify-between items-start mb-0.5">
                      <h4 className="font-bold text-slate-900 text-sm">{appt.patientName || appt.patientEmail}</h4>
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">{appt.time}</span>
                    </div>
                    <p className="text-xs text-slate-400 font-medium italic">With Dr. {appt.doctorName || 'Specialist'}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <button className="w-full py-4 mt-6 border-2 border-slate-50 rounded-2xl text-xs font-black text-slate-400 uppercase tracking-widest hover:border-slate-900 hover:text-slate-900 transition-all">
            See all Activity
          </button>
        </div>
      </div>
    </div>
  );
}
