import React from 'react';
import { motion } from 'motion/react';
import { X, FileText, Pill, Stethoscope, ClipboardList, Download, Calendar, User, UserRound } from 'lucide-react';
import { generatePrescription } from '../lib/prescription';

export default function RecordViewModal({ appointment, prescription, onClose }: any) {
  if (!prescription) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, rotate: -1 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        exit={{ opacity: 0, scale: 0.9, rotate: 1 }}
        className="relative w-full max-w-2xl bg-[#FCFCFB] rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-white"
      >
        {/* Abstract Header */}
        <div className="p-10 pb-6">
           <div className="flex justify-between items-start mb-8">
              <div className="flex gap-4 items-center">
                 <div className="p-4 bg-slate-900 text-white rounded-3xl">
                    <FileText size={24} />
                 </div>
                 <div>
                    <h2 className="text-3xl font-display font-bold text-slate-900">Medical Record</h2>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">Patient Case File</p>
                 </div>
              </div>
              <button onClick={onClose} className="p-3 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white border border-slate-100 rounded-2xl">
                 <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1 flex items-center gap-1">
                    <UserRound size={12} /> Patient
                 </p>
                 <p className="font-bold text-slate-900">{appointment.patientName}</p>
              </div>
              <div className="p-4 bg-white border border-slate-100 rounded-2xl">
                 <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1 flex items-center gap-1">
                    <Stethoscope size={12} /> Physician
                 </p>
                 <p className="font-bold text-slate-900">Dr. {appointment.doctorName}</p>
              </div>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto px-10 pb-10 space-y-8">
           {/* Diagnosis Section */}
           <section className="space-y-4">
              <div className="flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-[0.2em]">
                 <div className="w-6 h-[2px] bg-blue-600" /> Diagnosis
              </div>
              <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100/50">
                 <p className="text-slate-900 font-medium leading-relaxed">{prescription.diagnosis}</p>
              </div>
           </section>

           {/* Medicine Table */}
           <section className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-[0.2em]">
                 <div className="w-6 h-[2px] bg-emerald-600" /> Prescribed Medication
              </div>
              <div className="space-y-2">
                 {(prescription.medicines || []).map((med: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl group hover:border-emerald-200 transition-colors">
                       <div className="flex items-center gap-4">
                          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-all">
                             <Pill size={18} />
                          </div>
                          <div>
                             <p className="font-bold text-slate-900">{med.name}</p>
                             <p className="text-xs text-slate-400 font-medium">{med.duration} Days Course</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-xs font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full">{med.dosage}</p>
                       </div>
                    </div>
                 ))}
              </div>
           </section>

           {/* Advice Section */}
           {prescription.notes && (
             <section className="space-y-4">
                <div className="flex items-center gap-2 text-amber-600 font-black text-[10px] uppercase tracking-[0.2em]">
                   <div className="w-6 h-[2px] bg-amber-600" /> Physician's Advice
                </div>
                <div className="p-6 bg-amber-50/30 rounded-3xl border border-amber-100/30">
                   <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap italic">"{prescription.notes}"</p>
                </div>
             </section>
           )}
        </div>

        {/* Action Footer */}
        <div className="p-8 bg-slate-900 flex items-center justify-between">
           <div className="flex items-center gap-2 text-slate-400">
              <Calendar size={16} />
              <span className="text-xs font-bold">{appointment.date}</span>
           </div>
           <button 
             onClick={() => generatePrescription({ ...appointment, prescription })}
             className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-500 hover:text-white transition-all active:scale-95"
           >
              <Download size={18} /> Get Digital Copy
           </button>
        </div>
      </motion.div>
    </div>
  );
}
