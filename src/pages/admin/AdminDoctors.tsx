import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Trash2, 
  Edit3, 
  UserRound,
  Mail,
  Stethoscope,
  X
} from 'lucide-react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { CardSkeleton, ErrorUI, Skeleton } from '../../components/ui/Feedback';

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', email: '', specialty: '', experience: '', fee: 500, about: '' });

  const fetchDoctors = async () => {
    setLoading(true);
    setError(null);
    try {
      const snap = await getDocs(collection(db, 'doctors'));
      setDoctors(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setError("Database sync failed. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDoctor) {
        await updateDoc(doc(db, 'doctors', editingDoctor.id), { ...formData, updatedAt: serverTimestamp() });
      } else {
        await addDoc(collection(db, 'doctors'), { 
          ...formData, 
          image: `https://picsum.photos/seed/${formData.name}/200/200`,
          createdAt: serverTimestamp() 
        });
      }
      setIsModalOpen(false);
      setEditingDoctor(null);
      setFormData({ name: '', email: '', specialty: '', experience: '', fee: 500, about: '' });
      fetchDoctors();
    } catch (err) {
      alert('Error saving doctor');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      try {
        await deleteDoc(doc(db, 'doctors', id));
        fetchDoctors();
      } catch (err) {
        alert('Error deleting doctor');
      }
    }
  };

  const filteredDoctors = doctors.filter(d => 
    d.name?.toLowerCase().includes(search.toLowerCase()) || 
    d.specialty?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-display font-bold text-slate-900 mb-2">Doctor Registry</h1>
          <p className="text-slate-500 font-medium">Manage medical specialists and their profiles</p>
        </div>
        <button 
          onClick={() => {
            setEditingDoctor(null);
            setFormData({ name: '', email: '', specialty: '', experience: '', fee: 500, about: '' });
            setIsModalOpen(true);
          }}
          className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold text-sm tracking-tight hover:shadow-xl hover:shadow-slate-200 transition-all flex items-center gap-3 active:scale-95"
        >
          <Plus size={20} /> Add New Specialist
        </button>
      </header>

      {/* Filters Bar */}
      <div className="flex gap-4 items-center bg-white p-3 rounded-[2rem] border border-slate-100 shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, specialty or clinic..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none font-medium transition-all"
          />
        </div>
        <button className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:text-slate-900 transition-colors">
          <Filter size={20} />
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => <CardSkeleton key={i} />)}
        </div>
      ) : error ? (
        <div className="py-20 flex justify-center">
          <ErrorUI message={error} onRetry={fetchDoctors} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doc, idx) => (
            <motion.div 
              key={doc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white p-1 pb-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all group overflow-hidden"
            >
              <div className="relative h-48 rounded-[2.2rem] overflow-hidden mb-6">
                <img 
                  referrerPolicy="no-referrer"
                  src={doc.image || `https://picsum.photos/seed/${doc.name}/400/300`} 
                  alt={doc.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-4 right-4 flex gap-2">
                   <button 
                    onClick={() => {
                      setEditingDoctor(doc);
                      setFormData({ ...doc });
                      setIsModalOpen(true);
                    }}
                    className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-xl flex items-center justify-center text-slate-900 hover:bg-slate-900 hover:text-white transition-all shadow-lg"
                   >
                     <Edit3 size={18} />
                   </button>
                   <button 
                    onClick={() => handleDelete(doc.id)}
                    className="w-10 h-10 bg-red-500/90 backdrop-blur-md rounded-xl flex items-center justify-center text-white hover:bg-red-600 transition-all shadow-lg"
                   >
                     <Trash2 size={18} />
                   </button>
                </div>
                <div className="absolute bottom-4 left-4">
                  <span className="px-4 py-1.5 bg-white/90 backdrop-blur-md text-slate-900 rounded-full text-xs font-black uppercase tracking-widest shadow-sm">
                    {doc.specialty}
                  </span>
                </div>
              </div>

              <div className="px-7">
                <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">Dr. {doc.name}</h3>
                <p className="text-sm text-slate-400 font-medium italic mb-4">{doc.experience} Years of Experience</p>
                <div className="flex justify-between items-center pt-5 border-t border-slate-50">
                  <div>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1 italic">Consultation</p>
                    <p className="font-bold text-slate-900">₹{doc.fee}</p>
                  </div>
                  <div className="flex -space-x-2">
                    {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">P</div>)}
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-900 flex items-center justify-center text-[10px] font-bold text-white">+12</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <div className="p-10 border-b border-slate-50 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{editingDoctor ? 'Edit Profile' : 'New Specialist Registration'}</h2>
                  <p className="text-sm text-slate-400 font-medium">Please provide accurate medical details</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-3 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-10 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Full Name</label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. John Doe"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none font-medium" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Email Address</label>
                    <input 
                      required
                      type="email" 
                      placeholder="e.g. name@clinic.com"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none font-medium" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Specialty</label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. Cardiology"
                      value={formData.specialty}
                      onChange={e => setFormData({...formData, specialty: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none font-medium" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Experience (Years)</label>
                    <input 
                      required
                      type="number" 
                      placeholder="e.g. 10"
                      value={formData.experience}
                      onChange={e => setFormData({...formData, experience: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none font-medium" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Consultation Fee (₹)</label>
                  <input 
                    required
                    type="number" 
                    placeholder="e.g. 500"
                    value={formData.fee}
                    onChange={e => setFormData({...formData, fee: parseInt(e.target.value)})}
                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none font-medium" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">About / Bio</label>
                  <textarea 
                    rows={4}
                    placeholder="Describe their expertise..."
                    value={formData.about}
                    onChange={e => setFormData({...formData, about: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none font-medium resize-none" 
                  />
                </div>

                <div className="pt-6 flex gap-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-5 rounded-2xl font-bold bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all">Cancel</button>
                  <button type="submit" className="flex-[2] py-5 rounded-2xl font-bold bg-slate-900 text-white shadow-xl shadow-slate-200 hover:shadow-2xl hover:bg-indigo-600 transition-all">Save Profile</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
