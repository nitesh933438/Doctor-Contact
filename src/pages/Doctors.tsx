import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import AppointmentModal from '../components/AppointmentModal';
import { Award, DollarSign, Star, Users } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';

export default function Doctors() {
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const snap = await getDocs(collection(db, 'doctors'));
        const data = snap.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
        
        setDoctors(data.length > 0 ? data : [
          { _id: '1', name: 'John Doe', specialty: 'Cardiology', experience: '12', fee: 500, rating: '4.9', patients: '1.2k+' },
          { _id: '2', name: 'Jane Smith', specialty: 'Pediatrics', experience: '8', fee: 800, rating: '4.8', patients: '800+' },
        ]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div></div>;
  
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h2 className="font-display text-4xl font-bold text-slate-900 mb-3">Our Specialists</h2>
          <p className="text-slate-500 max-w-md">Browse through our highly qualified doctors and book a slot that works for you.</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {doctors.map((doc, idx) => (
          <motion.div 
            key={doc._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="group bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all"
          >
            <div className="relative mb-6 overflow-hidden rounded-2xl aspect-[4/3]">
              <img 
                src={doc.image || `https://picsum.photos/seed/doc-${doc._id}/600/450`} 
                alt={doc.name} 
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" 
                referrerPolicy="no-referrer" 
              />
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                <span className="text-xs font-bold text-slate-900">{doc.rating || '4.5'} ★</span>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-display text-xl font-bold text-slate-900 mb-1 leading-tight">Dr. {doc.name}</h3>
              <p className="text-blue-600 font-semibold text-sm mb-4">{doc.specialty}</p>
              
              <div className="grid grid-cols-2 gap-y-3 py-4 border-t border-slate-50">
                <div className="flex items-center gap-2 text-slate-500">
                  <Award size={14} className="text-blue-500" />
                  <span className="text-xs font-medium">{doc.experience} Years</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <DollarSign size={14} className="text-green-500" />
                  <span className="text-xs font-medium">₹{doc.fee}/visit</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <Users size={14} className="text-amber-500" />
                  <span className="text-xs font-medium">{doc.patients || '100+'} Patients</span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setSelectedDoctorId(doc._id)} 
              className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-blue-600 transition-all active:scale-95"
            >
              Check Availability
            </button>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedDoctorId && (
          <AppointmentModal 
            isOpen={!!selectedDoctorId} 
            onClose={() => setSelectedDoctorId(null)} 
            doctorId={selectedDoctorId}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
