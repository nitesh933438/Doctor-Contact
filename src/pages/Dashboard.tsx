import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, Calendar, Search, CreditCard, Check, Clock, FileText, Download, AlertTriangle, Receipt } from 'lucide-react';
import { api } from '../services/api';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';
import { TableSkeleton, ErrorUI } from '../components/ui/Feedback';
import { generatePrescription } from '../lib/prescription';
import RecordViewModal from '../components/RecordViewModal';
import InvoiceModal from '../components/InvoiceModal';

export default function Dashboard() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [paymentLoadingId, setPaymentLoadingId] = useState<string | null>(null);

  // View Record Modal
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);

  // View Invoice Modal
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  const fetchAppointments = async (userData: any) => {
    setLoading(true);
    setError(null);
    try {
      const q = query(
        collection(db, 'appointments'), 
        where('patientId', '==', userData._id),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAppointments(data);

      // Fetch prescriptions
      const presQ = query(collection(db, 'prescriptions'), where('patientId', '==', userData._id));
      const presSnap = await getDocs(presQ);
      const presMap: Record<string, any> = {};
      presSnap.docs.forEach(doc => {
        presMap[doc.data().appointmentId] = doc.data();
      });
      setPrescriptions(presMap);
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError("We couldn't load your medical history. Please refresh to try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchAppointments(parsedUser);
    } else {
      setLoading(false);
    }
  }, []);

  const handleDownloadPrescription = (apt: any) => {
    try {
      const presData = prescriptions[apt.id];
      generatePrescription({ ...apt, prescription: presData });
    } catch (e) {
      alert("Failed to generate PDF. Error: " + (e as Error).message);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16 space-y-12">
        <div className="flex gap-4 items-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl animate-pulse" />
          <div className="space-y-2">
            <div className="w-48 h-10 bg-slate-100 rounded-lg animate-pulse" />
            <div className="w-64 h-4 bg-slate-50 rounded-lg animate-pulse" />
          </div>
        </div>
        <TableSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 flex justify-center">
        <ErrorUI message={error} onRetry={() => user && fetchAppointments(user)} />
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-slate-900 text-white rounded-[2rem] shadow-xl shadow-slate-200">
            <LayoutDashboard size={32} />
          </div>
          <div>
            <h2 className="font-display text-4xl font-bold text-slate-900 leading-tight">Patient Console</h2>
            <p className="text-slate-500 font-medium tracking-tight">Overview of your medical history</p>
          </div>
        </div>
        
        <div className="flex bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
           {[ 'Active', 'History', 'Documents' ].map((tab, i) => (
             <button key={tab} className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${i === 0 ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'text-slate-400 hover:text-slate-900'}`}>
                {tab}
             </button>
           ))}
        </div>
      </div>

      {appointments.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-20 bg-white border border-dashed border-slate-200 rounded-[3rem] group"
        >
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
            <Calendar className="text-slate-300" size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No Appointments Yet</h3>
          <p className="text-slate-400 max-w-xs mx-auto mb-8 text-sm leading-relaxed">
            Ready to take care of your health? Schedule your first visit with a specialist.
          </p>
          <button 
            onClick={() => window.location.href = '/doctors'}
            className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold hover:shadow-lg hover:shadow-slate-200 transition-all active:scale-95"
          >
            Find a Doctor <Search size={18} />
          </button>
        </motion.div>
      ) : (
        <div className="grid gap-6">
           {appointments.map((apt, idx) => (
             <motion.div 
               key={apt.id}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: idx * 0.1 }}
               className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-8 hover:shadow-xl hover:shadow-slate-200/50 transition-all group overflow-hidden relative"
             >
               <div className="flex items-center gap-6 relative z-10">
                 <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                   <Calendar size={28} />
                 </div>
                 <div>
                   <h4 className="font-display font-bold text-xl text-slate-900 group-hover:text-blue-600 transition-colors">Dr. {apt.doctorName || 'Specialist'}</h4>
                   <p className="text-sm text-slate-500 flex items-center gap-2 mt-1 font-medium bg-slate-50 px-3 py-1 rounded-full w-fit">
                     <Clock size={14} className="text-blue-500" /> {apt.date} at {apt.time}
                   </p>
                 </div>
               </div>

               {/* Prescription Quick View */}
               {prescriptions[apt.id] && (
                 <div className="flex-1 max-w-md hidden lg:block border-l border-slate-50 pl-8 ml-4">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">Prescribed Diagnosis</p>
                    <p className="text-sm font-bold text-slate-700 line-clamp-1">{prescriptions[apt.id].diagnosis}</p>
                    <div className="flex gap-2 mt-3 overflow-hidden">
                       {(prescriptions[apt.id].medicines || []).slice(0, 2).map((m: any, i: number) => (
                         <span key={i} className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded-md whitespace-nowrap">
                            {m.name} ({m.dosage})
                         </span>
                       ))}
                       {(prescriptions[apt.id].medicines || []).length > 2 && (
                         <span className="text-[10px] font-bold bg-slate-50 text-slate-400 px-2 py-1 rounded-md">
                           +{(prescriptions[apt.id].medicines || []).length - 2} more
                         </span>
                       )}
                    </div>
                 </div>
               )}

               <div className="flex items-center gap-4 flex-wrap md:flex-nowrap relative z-10">
                 <div className="flex gap-2">
                   {apt.status === 'confirmed' ? (
                     <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2">
                       <Check size={14} /> Confirmed
                     </span>
                   ) : apt.status === 'cancelled' ? (
                     <span className="px-4 py-1.5 bg-rose-50 text-rose-600 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2">
                        Cancelled
                     </span>
                   ) : (
                     <span className="px-4 py-1.5 bg-amber-50 text-amber-600 rounded-xl text-xs font-black uppercase tracking-widest">
                       {apt.status}
                     </span>
                   )}
                   
                   {apt.paymentStatus === 'paid' && (
                     <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2">
                        Paid
                     </span>
                   )}
                 </div>

                 {prescriptions[apt.id] && (
                   <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setSelectedRecord(apt);
                        setIsRecordModalOpen(true);
                      }}
                      className="p-4 bg-blue-600 text-white hover:bg-blue-700 rounded-2xl transition-all shadow-lg shadow-blue-100 flex items-center gap-3 font-bold text-xs"
                      title="View Medical Record"
                    >
                      <FileText size={18} /> 
                      <span className="hidden sm:inline">Record</span>
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedInvoice(apt);
                        setIsInvoiceModalOpen(true);
                       }}
                       className="p-4 bg-slate-900 text-white hover:bg-slate-800 rounded-2xl transition-all shadow-lg shadow-slate-200 flex items-center gap-3 font-bold text-xs"
                       title="View Official Invoice"
                    >
                       <Receipt size={18} />
                       <span className="hidden sm:inline">Bill</span>
                    </button>
                   </div>
                 )}

                 {apt.status === 'confirmed' && !prescriptions[apt.id] && (
                    <button 
                      onClick={() => handleDownloadPrescription(apt)}
                      className="p-4 bg-slate-50 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-all flex items-center gap-3 font-bold text-xs"
                      title="Download Prescription"
                    >
                      <FileText size={18} /> 
                      <span className="hidden sm:inline">Prescription</span>
                      <Download size={14} />
                    </button>
                 )}

                 {apt.paymentStatus === 'unpaid' && apt.status !== 'cancelled' && (
                   <button 
                     disabled={paymentLoadingId === apt.id}
                     className="bg-slate-900 text-white px-8 py-4 rounded-2xl text-sm font-bold hover:bg-blue-600 transition-all active:scale-95 flex items-center gap-3 disabled:opacity-75 whitespace-nowrap shadow-lg shadow-slate-200"
                   >
                     {paymentLoadingId === apt.id ? 'Processing...' : (
                       <>
                         <CreditCard size={18} /> Pay ₹500
                       </>
                     )}
                   </button>
                 )}
               </div>
               
               {/* Background Glow */}
               <div className="absolute top-0 right-0 w-32 h-64 bg-blue-50/20 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-blue-100/30 transition-colors" />
             </motion.div>
           ))}
        </div>
      )}

      {/* Record View Modal */}
      <AnimatePresence>
        {isRecordModalOpen && (
          <RecordViewModal 
            appointment={selectedRecord}
            prescription={prescriptions[selectedRecord.id]}
            onClose={() => setIsRecordModalOpen(false)}
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
