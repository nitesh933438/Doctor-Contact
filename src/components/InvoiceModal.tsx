import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { X, Printer, Download, Receipt, MapPin, Phone, User, Calendar, CreditCard, CheckCircle2 } from 'lucide-react';

export default function InvoiceModal({ appointment, prescription, onClose }: any) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Medical Invoice - ${appointment.id}</title>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
          <style>
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body class="bg-white p-8">
          ${content.innerHTML}
          <script>
            window.onload = () => { window.print(); window.close(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const medsTotal = (prescription?.medicines || []).reduce((sum: number, med: any) => sum + (Number(med.price) || 0), 0);
  const consultationFee = Number(appointment.doctorFee) || 500;
  const testCharges = Number(prescription?.testCharges) || 0;
  const grandTotal = medsTotal + consultationFee + testCharges;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative w-full max-w-2xl bg-white rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] border border-slate-100"
      >
        {/* Actions Header */}
        <div className="p-6 border-b border-slate-50 flex items-center justify-between no-print">
           <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                 <Receipt size={20} />
              </div>
              <p className="font-bold text-slate-900">Hospital Receipt</p>
           </div>
           <div className="flex gap-2">
              <button 
                onClick={handlePrint}
                className="p-3 bg-slate-50 text-slate-600 rounded-2xl hover:bg-slate-100 transition-colors flex items-center gap-2 font-bold text-sm"
              >
                 <Printer size={18} /> Print
              </button>
              <button onClick={onClose} className="p-3 hover:bg-slate-50 rounded-2xl transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
           </div>
        </div>

        {/* Invoice Body */}
        <div className="flex-1 overflow-y-auto p-12 bg-white" ref={printRef}>
           {/* Header */}
           <div className="flex justify-between items-start mb-12">
              <div>
                 <h1 className="text-3xl font-display font-black text-blue-600 mb-1">DocReserve CLINIC</h1>
                 <p className="text-slate-400 text-sm font-bold flex items-center gap-1">
                    <MapPin size={12} /> 123 Healthcare Ave, Medical City, 110001
                 </p>
                 <p className="text-slate-400 text-sm font-bold flex items-center gap-1">
                    <Phone size={12} /> +91 99999 88888 | support@docreserve.com
                 </p>
              </div>
              <div className="text-right">
                 <h2 className="text-4xl font-display font-black text-slate-200 opacity-50 uppercase tracking-tighter">INVOICE</h2>
                 <p className="text-slate-900 font-bold text-sm">#INV-{appointment.id?.slice(-6).toUpperCase()}</p>
                 <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{appointment.date}</p>
              </div>
           </div>

           {/* Details Grid */}
           <div className="grid grid-cols-2 gap-12 mb-12 py-8 border-y border-slate-50">
              <div className="space-y-4">
                 <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] italic">Patient Details</p>
                 <div>
                    <p className="text-lg font-display font-black text-slate-900">{appointment.patientName}</p>
                    <p className="text-sm text-slate-500 font-medium">{appointment.patientEmail}</p>
                    <p className="text-xs text-slate-400 font-bold mt-1">ID: {appointment.patientId?.slice(0, 10)}</p>
                 </div>
              </div>
              <div className="space-y-4 text-right">
                 <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] italic">Physician Details</p>
                 <div>
                    <p className="text-lg font-display font-black text-slate-900">Dr. {appointment.doctorName}</p>
                    <p className="text-xs text-blue-500 font-black uppercase tracking-widest">General Specialist</p>
                    <p className="text-xs text-slate-400 font-bold mt-1">Consultation ID: {appointment.id}</p>
                 </div>
              </div>
           </div>

           {/* Diagnosis Section */}
           {prescription?.diagnosis && (
              <div className="mb-8 p-6 bg-slate-50 rounded-3xl border border-slate-100 italic font-medium text-slate-600 text-sm">
                 <span className="font-black text-slate-400 text-[10px] uppercase block mb-1 not-italic">Clinical Diagnosis:</span>
                 "{prescription.diagnosis}"
              </div>
           )}

           {/* Items Table */}
           <table className="w-full mb-12">
              <thead className="border-b-2 border-slate-900">
                 <tr>
                    <th className="py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Sr.no</th>
                    <th className="py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Description</th>
                    <th className="py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Qty/Days</th>
                    <th className="py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Price</th>
                    <th className="py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Total</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                 <tr>
                    <td className="py-4 text-xs font-bold text-slate-400">01</td>
                    <td className="py-4 font-bold text-slate-900">Consultation Fee</td>
                    <td className="py-4 text-right text-xs font-bold text-slate-400">1</td>
                    <td className="py-4 text-right font-bold text-slate-900">₹{consultationFee}</td>
                    <td className="py-4 text-right font-black text-slate-900">₹{consultationFee}</td>
                 </tr>
                 {(prescription?.medicines || []).map((med: any, i: number) => (
                    <tr key={i}>
                       <td className="py-4 text-xs font-bold text-slate-400">{(i + 2).toString().padStart(2, '0')}</td>
                       <td className="py-4">
                          <p className="font-bold text-slate-900">{med.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">{med.dosage}</p>
                       </td>
                       <td className="py-4 text-right text-xs font-bold text-slate-400">{med.duration}</td>
                       <td className="py-4 text-right font-bold text-slate-900">₹{med.price / med.duration || '-'}</td>
                       <td className="py-4 text-right font-black text-slate-900">₹{med.price || 0}</td>
                    </tr>
                 ))}
                 {testCharges > 0 && (
                    <tr>
                       <td className="py-4 text-xs font-bold text-slate-400">{(prescription?.medicines?.length + 2).toString().padStart(2, '0')}</td>
                       <td className="py-4 font-bold text-slate-900">Lab Tests & Reports</td>
                       <td className="py-4 text-right text-xs font-bold text-slate-400">1</td>
                       <td className="py-4 text-right font-bold text-slate-900">₹{testCharges}</td>
                       <td className="py-4 text-right font-black text-slate-900">₹{testCharges}</td>
                    </tr>
                 )}
              </tbody>
           </table>

           {/* Summary Grid */}
           <div className="flex justify-end mb-12">
              <div className="w-full max-w-xs space-y-4">
                 <div className="flex justify-between items-center text-sm font-bold text-slate-400">
                    <span>Subtotal</span>
                    <span>₹{grandTotal}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm font-bold text-green-500">
                    <span>Discount (0%)</span>
                    <span>₹0.00</span>
                 </div>
                 <div className="h-px bg-slate-100" />
                 <div className="flex justify-between items-center p-4 bg-slate-900 rounded-2xl text-white">
                    <span className="text-xs font-black uppercase tracking-widest">Total Amount</span>
                    <span className="text-2xl font-display font-black italic">₹{grandTotal}</span>
                 </div>
              </div>
           </div>

           {/* Footer */}
           <div className="flex justify-between items-end">
              <div className="space-y-4">
                 <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                       <CheckCircle2 size={16} />
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Payment Status</p>
                       <p className="font-black text-emerald-600 uppercase text-xs">PAID SUCCESSFULLY</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                       <CreditCard size={16} />
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Method</p>
                       <p className="font-bold text-blue-600 uppercase text-xs">UPI TRANSFERS</p>
                    </div>
                 </div>
              </div>
              <div className="text-center w-48 border-t-2 border-slate-100 pt-4">
                 <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1 italic">Issued By</p>
                 <p className="font-display font-black text-slate-900 text-sm">DocReserve Admin</p>
              </div>
           </div>
        </div>

        {/* Bottom Banner */}
        <div className="p-6 bg-slate-50 text-center no-print">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Thank you for trusting DocReserve</p>
        </div>
      </motion.div>
    </div>
  );
}
