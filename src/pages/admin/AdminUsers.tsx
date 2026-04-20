import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Trash2, 
  User, 
  ShieldCheck, 
  Mail,
  Calendar,
  MoreVertical
} from 'lucide-react';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { motion } from 'motion/react';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'users'));
      setUsers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this user? This action is irreversible.')) {
      try {
        await deleteDoc(doc(db, 'users', id));
        fetchUsers();
      } catch (err) {
        alert('Error deleting user');
      }
    }
  };

  const handleToggleRole = async (user: any) => {
    const newRole = user.role === 'admin' ? 'patient' : 'admin';
    try {
      await updateDoc(doc(db, 'users', user.id), { role: newRole });
      fetchUsers();
    } catch (err) {
      alert('Error updating role');
    }
  };

  const filtered = users.filter(u => 
    u.name?.toLowerCase().includes(search.toLowerCase()) || 
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-display font-bold text-slate-900 mb-2">User Directory</h1>
        <p className="text-slate-500 font-medium tracking-tight">System members and authorization management</p>
      </header>

      <div className="bg-white p-4 rounded-[2.5rem] border border-slate-100 shadow-sm flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Filter by name, email or UID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none font-medium transition-all"
          />
        </div>
        <button className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:text-slate-900 transition-colors">
          <Filter size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="h-44 bg-slate-100 rounded-[2.5rem] animate-pulse" />)
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-400">No users found.</div>
        ) : (
          filtered.map((user, idx) => (
            <motion.div 
              key={user.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200 transition-all flex flex-col justify-between group"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-white text-xl font-bold">
                    {user.name?.[0] || 'U'}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 truncate max-w-[150px]">{user.name || 'Anonymous'}</h3>
                    <div className={`mt-1 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${user.role === 'admin' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                       {user.role === 'admin' && <ShieldCheck size={10} />} {user.role || 'patient'}
                    </div>
                  </div>
                </div>
                <div className="relative group/menu">
                   <button className="p-2 text-slate-300 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all">
                      <MoreVertical size={20} />
                   </button>
                   <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-10">
                      <button 
                        onClick={() => handleToggleRole(user)}
                        className="w-full text-left px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-3"
                      >
                        <ShieldCheck size={16} /> {user.role === 'admin' ? 'Demote to Patient' : 'Promote to Admin'}
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id)}
                        className="w-full text-left px-5 py-3 text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-3"
                      >
                        <Trash2 size={16} /> Delete User
                      </button>
                   </div>
                </div>
              </div>

              <div className="space-y-3 pt-6 border-t border-slate-50">
                <div className="flex items-center gap-3 text-slate-400">
                  <Mail size={16} />
                  <span className="text-xs font-medium truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-400">
                  <Calendar size={16} />
                  <span className="text-xs font-medium">Joined {user.createdAt ? new Date(user.createdAt.seconds * 1000).toLocaleDateString() : 'Long ago'}</span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
