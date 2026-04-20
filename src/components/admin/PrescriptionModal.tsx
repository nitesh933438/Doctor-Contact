import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Trash2, Save, FileText, Pill, Stethoscope, ClipboardList } from 'lucide-react';
import { db } from '../../services/firebase';
import { setDoc, doc, serverTimestamp, getDoc } from 'firebase/firestore';

interface Medicine {
  name: string;
  dosage: string;
  duration: number;
  price: number;
}

export default function PrescriptionModal({ appointment, onClose, onSave }: any) {
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [testCharges, setTestCharges] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // New medicine local state
  const [newMed, setNewMed] = useState<Medicine>({ name: '', dosage: '', duration: 1, price: 0 });

  useEffect(() => {
    const fetchExisting = async () => {
      try {
        const docRef = doc(db, 'prescriptions', `pres_${appointment.id}`);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          setDiagnosis(data.diagnosis || '');
          setMedicines(data.medicines || []);
          setNotes(data.notes || '');
          setTestCharges(data.testCharges || 0);
        }
      } catch (err) {
        console.error("Error fetching existing prescription:", err);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchExisting();
  }, [appointment.id]);

  const addMedicine = () => {
    if (newMed.name && newMed.dosage) {
      setMedicines([...medicines, newMed]);
      setNewMed({ name: '', dosage: '', duration: 1, price: 0 });
    }
  };

  const removeMedicine = (index: number) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const totalCost = medicines.reduce((sum, med) => sum + (Number(med.price) || 0), 0) + (Number(testCharges) || 0) + (Number(appointment.doctorFee) || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!diagnosis) return alert('Diagnosis is required');
    
    setLoading(true);
    try {
      const presId = `pres_${appointment.id}`;
      const prescriptionData = {
        appointmentId: appointment.id,
        patientId: appointment.patientId,
        patientName: appointment.patientName,
        doctorId: appointment.doctorId,
        doctorName: appointment.doctorName,
        date: appointment.date,
        diagnosis,
        medicines,
        notes,
        testCharges,
        totalCost,
        createdAt: serverTimestamp()
      };

      await setDoc(doc(db, 'prescriptions', presId), prescriptionData);
      onSave();
      onClose();
    } catch (err) {
      console.error('Error saving prescription:', err);
      alert('Failed to save prescription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-4xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200">
               <FileText size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold text-slate-900">Medical Prescription</h2>
              <p className="text-sm text-slate-500 font-medium tracking-tight">For Patient: {appointment.patientName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={24} className="text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          <form id="presForm" onSubmit={handleSubmit} className="space-y-8">
            {/* Diagnosis */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-400">
                <Stethoscope size={16} className="text-blue-500" /> Diagnosis / Symptoms
              </label>
              <textarea 
                value={diagnosis}
                onChange={e => setDiagnosis(e.target.value)}
                placeholder="What is the patient suffering from?"
                className="w-full p-6 bg-slate-50 rounded-3xl border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none transition-all min-h-[100px] font-medium"
                required
              />
            </div>

            {/* Medicines List */}
            <div className="space-y-6">
              <label className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-400">
                <Pill size={16} className="text-emerald-500" /> Medicines & Dosage
              </label>

              <div className="bg-slate-50 rounded-[2rem] p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <input 
                    placeholder="Medicine Name" 
                    value={newMed.name}
                    onChange={e => setNewMed({...newMed, name: e.target.value})}
                    className="p-4 rounded-xl bg-white border border-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="space-y-2">
                    <input 
                      placeholder="Dosage (e.g. 1-0-1)" 
                      value={newMed.dosage}
                      onChange={e => setNewMed({...newMed, dosage: e.target.value})}
                      className="w-full p-4 rounded-xl bg-white border border-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex gap-1">
                       {['1-0-1', '1-1-1', '0-0-1', '1-0-0'].map(d => (
                         <button 
                           key={d}
                           type="button"
                           onClick={() => setNewMed({...newMed, dosage: d})}
                           className="text-[10px] font-bold bg-white border border-slate-100 rounded-md px-2 py-1 hover:bg-slate-50"
                         >
                           {d}
                         </button>
                       ))}
                    </div>
                  </div>
                  <input 
                    type="number" 
                    placeholder="Days" 
                    value={newMed.duration}
                    onChange={e => setNewMed({...newMed, duration: Number(e.target.value)})}
                    className="p-4 rounded-xl bg-white border border-slate-100 outline-none focus:ring-2 focus:ring-blue-500 max-h-14"
                  />
                  <button 
                    type="button"
                    onClick={addMedicine}
                    className="bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 max-h-14"
                  >
                    <Plus size={20} /> Add
                  </button>
                </div>

                <AnimatePresence>
                  {medicines.map((med, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100"
                    >
                      <div className="flex-1 grid grid-cols-3 gap-4">
                        <span className="font-bold text-slate-900">{med.name}</span>
                        <span className="text-slate-500 text-sm">{med.dosage}</span>
                        <span className="text-blue-600 font-bold text-sm">{med.duration} Days</span>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => removeMedicine(i)}
                        className="text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-400">
                <ClipboardList size={16} className="text-amber-500" /> Advice & Notes
              </label>
              <textarea 
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Additional instructions or tests required..."
                className="w-full p-6 bg-slate-50 rounded-3xl border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none transition-all min-h-[100px] font-medium"
              />
            </div>

            {/* Billing Section */}
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white space-y-6">
               <h3 className="text-lg font-display font-bold flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs">₹</span>
                  Billing Details
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Consultation Fee</p>
                     <p className="text-2xl font-display font-bold text-white">₹ {appointment.doctorFee || 500}</p>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Additional Test Charges (₹)</label>
                     <input 
                        type="number"
                        value={testCharges}
                        onChange={e => setTestCharges(Number(e.target.value))}
                        className="w-full bg-slate-800 border-none rounded-xl p-4 focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                        placeholder="e.g. 1500"
                     />
                  </div>
               </div>
            </div>
          </form>
        </div>

        <div className="p-8 border-t border-slate-50 flex items-center justify-between bg-slate-50/30">
          <div>
             <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Total Items</p>
             <p className="text-xl font-display font-bold text-slate-900">{medicines.length} Medicines</p>
          </div>
          <button 
            type="submit" 
            form="presForm"
            disabled={loading}
            className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Saving...' : <><Save size={20} /> Save Prescription</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
