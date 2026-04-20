import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  User,
  ArrowUpDown,
  ExternalLink,
  FileText,
  Receipt
} from 'lucide-react';
import { collection, getDocs, query, orderBy, updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { TableSkeleton, ErrorUI } from '../../components/ui/Feedback';
import PrescriptionModal from '../../components/admin/PrescriptionModal';
import InvoiceModal from '../../components/InvoiceModal';

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Prescription Logic
  const [selectedApt, setSelectedApt] = useState<any>(null);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [prescriptions, setPrescriptions] = useState<Record<string, any>>({});

  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const q = query(collection(db, 'appointments'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAppointments(data);

      // Check which appointments have prescriptions
      const presSnap = await getDocs(collection(db, 'prescriptions'));
      const presMap: Record<string, any> = {};
      presSnap.docs.forEach(doc => {
        presMap[doc.data().appointmentId] = doc.data();
      });
      setPrescriptions(presMap);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError("Medical records could not be synchronized.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'appointments', id), { status: newStatus });
      fetchAppointments();
    } catch (err) {
      alert('Error updating status');
    }
  };

  const filtered = appointments.filter(apt => {
    const matchesSearch = apt.patientName?.toLowerCase().includes(search.toLowerCase()) || 
                          apt.doctorName?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-display font-bold text-slate-900 mb-2">Booking Log</h1>
          <p className="text-slate-500 font-medium tracking-tight">Real-time status of all patient visits</p>
        </div>
      </header>

      {/* Control Bar */}
      <div className="bg-white p-4 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1 relative w-full">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by patient or doctor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none font-medium transition-all"
          />
        </div>
        
        <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
           {['all', 'confirmed', 'pending', 'cancelled'].map((status) => (
             <button 
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-6 py-3 rounded-xl text-xs font-bold capitalize transition-all ${statusFilter === status ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'text-slate-400 hover:text-slate-900'}`}
             >
               {status}
             </button>
           ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50">
                <th className="px-10 py-6 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] italic">Patient</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] italic">Doctor</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] italic">Schedule</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] italic">Status</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] italic">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8">
                    <TableSkeleton />
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="py-20 flex justify-center">
                    <ErrorUI message={error} onRetry={fetchAppointments} />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-slate-400 font-medium italic">
                    No matching appointments found.
                  </td>
                </tr>
              ) : (
                filtered.map((apt, idx) => (
                  <motion.tr 
                    key={apt.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.02 }}
                    className="group hover:bg-slate-50/50 transition-colors cursor-default"
                  >
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-900 font-bold text-xs uppercase">
                          {apt.patientName?.[0] || 'P'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{apt.patientName || 'Anonymous'}</p>
                          <p className="text-xs text-slate-400 font-medium">{apt.patientEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg border-2 border-white shadow-sm overflow-hidden flex-shrink-0">
                           <img referrerPolicy="no-referrer" src={`https://picsum.photos/seed/${apt.doctorId}/50/50`} alt="" className="w-full h-full object-cover" />
                        </div>
                        <p className="font-bold text-slate-900 text-sm">Dr. {apt.doctorName || 'Specialist'}</p>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <div className="space-y-1">
                        <p className="font-bold text-slate-900 text-sm flex items-center gap-2">
                          <Calendar size={12} className="text-blue-500" /> {apt.date}
                        </p>
                        <p className="text-xs text-slate-400 font-medium flex items-center gap-2 italic">
                          <Clock size={12} className="text-slate-300" /> {apt.time}
                        </p>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <span className={`
                        px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1.5
                        ${apt.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600' : 
                          apt.status === 'cancelled' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}
                      `}>
                         {apt.status === 'confirmed' ? <CheckCircle2 size={12} /> : 
                          apt.status === 'cancelled' ? <XCircle size={12} /> : <Clock size={12} />}
                         {apt.status}
                      </span>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-2">
                        {apt.status === 'confirmed' && (
                          <div className="flex gap-2">
                            <button 
                              onClick={() => {
                                setSelectedApt(apt);
                                setIsPrescriptionModalOpen(true);
                              }}
                              className={`p-3 rounded-xl transition-all ${prescriptions[apt.id] ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:text-blue-500 hover:bg-blue-50'}`}
                              title={prescriptions[apt.id] ? "View/Edit Prescription" : "Write Prescription"}
                            >
                              <FileText size={20} />
                            </button>
                            {prescriptions[apt.id] && (
                               <button 
                                  onClick={() => {
                                    setSelectedInvoice(apt);
                                    setIsInvoiceModalOpen(true);
                                  }}
                                  className="p-3 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
                                  title="View Invoice"
                               >
                                  <Receipt size={20} />
                               </button>
                            )}
                          </div>
                        )}
                        {apt.status !== 'confirmed' && (
                          <button 
                            onClick={() => handleStatusUpdate(apt.id, 'confirmed')}
                            className="p-3 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all"
                            title="Confirm Appointment"
                          >
                            <CheckCircle2 size={20} />
                          </button>
                        )}
                        {apt.status !== 'cancelled' && (
                          <button 
                            onClick={() => handleStatusUpdate(apt.id, 'cancelled')}
                            className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                            title="Cancel Appointment"
                          >
                            <XCircle size={20} />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-8 border-t border-slate-50 flex justify-between items-center bg-slate-50/30">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">Showing {filtered.length} entries</p>
          <div className="flex gap-2">
             <button className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-100 bg-white text-slate-400 cursor-not-allowed">Previous</button>
             <button className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-100 bg-white text-slate-900 hover:bg-slate-50 transition-colors">Next</button>
          </div>
        </div>
      </div>

      {/* Prescription Modal */}
      <AnimatePresence>
        {isPrescriptionModalOpen && (
          <PrescriptionModal 
            appointment={selectedApt} 
            onClose={() => setIsPrescriptionModalOpen(false)}
            onSave={fetchAppointments}
          />
        )}
      </AnimatePresence>
      {/* Invoice View Modal */}
      <AnimatePresence>
        {isInvoiceModalOpen && (
          <InvoiceModal 
            appointment={selectedInvoice}
            prescription={prescriptions[selectedInvoice.id]}
            onClose={() => setIsInvoiceModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
