import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Calendar, Clock, Lock } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { collection, query, where, getDocs, addDoc, getDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';

type Props = { isOpen: boolean; onClose: () => void; doctorId: string; };

const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"
];

export default function AppointmentModal({ isOpen, onClose, doctorId }: Props) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [doctorInfo, setDoctorInfo] = useState<any>(null);
  
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [lockedSlots, setLockedSlots] = useState<Map<string, any>>(new Map());
  const [socket, setSocket] = useState<Socket | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
    
    // Fetch doctor info for redundant storage
    const fetchDocInfo = async () => {
      if (!doctorId) return;
      const ref = doc(db, 'doctors', doctorId);
      const snap = await getDoc(ref);
      if (snap.exists()) setDoctorInfo(snap.data());
    };
    fetchDocInfo();
  }, [doctorId]);

  // Fetch booked slots when date changes
  useEffect(() => {
    if (!date || !doctorId) return;
    const fetchBooked = async () => {
      try {
        const q = query(
          collection(db, 'appointments'), 
          where('doctorId', '==', doctorId),
          where('date', '==', date)
        );
        const snap = await getDocs(q);
        setBookedSlots(snap.docs
          .map(doc => doc.data())
          .filter(d => d.status !== 'cancelled')
          .map(d => d.time)
        );
      } catch (err) {
        console.error("Failed to fetch booked slots:", err);
      }
    };
    fetchBooked();
  }, [date, doctorId]);

  // Socket setup (optional/legacy for real-time locking)
  useEffect(() => {
    // @ts-ignore
    const newSocket = io(import.meta.env.VITE_APP_URL || '/'); 
    setSocket(newSocket);

    newSocket.on("sync_locked_slots", (slotsArray: any[]) => {
      setLockedSlots(new Map(slotsArray));
    });

    newSocket.on("slot_locked", ({ slotKey }) => {
      setLockedSlots(prev => new Map(prev).set(slotKey, { locked: true, socketId: newSocket.id }));
    });

    newSocket.on("slot_unlocked", ({ slotKey }) => {
      setLockedSlots(prev => {
        const next = new Map(prev);
        next.delete(slotKey);
        return next;
      });
    });

    newSocket.on("slot_booked", ({ slotKey }) => {
       const [docId, d, t] = slotKey.split('_');
       if (docId === doctorId && d === date) {
         setBookedSlots(prev => [...prev, t]);
       }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [doctorId, date]);

  // Handle slot selection
  const handleSlotSelection = (time: string) => {
    if (selectedTime === time) return; 
    if (selectedTime && socket) {
      socket.emit("unlock_slot", { doctorId, date, time: selectedTime });
    }
    setSelectedTime(time);
    if (socket) {
      socket.emit("lock_slot", { doctorId, date, time, userId: user?._id });
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!selectedTime) return alert("Please select a time slot");
    setLoading(true);
    try {
      if (!user) throw new Error('Please login first');
      
      // Save to Firestore
      await addDoc(collection(db, 'appointments'), {
        doctorId,
        doctorName: doctorInfo?.name || 'Doctor',
        doctorFee: doctorInfo?.fee || 500,
        patientId: user._id,
        patientName: user.name || 'Anonymous',
        patientEmail: user.email,
        date: date,
        time: selectedTime,
        status: 'pending',
        paymentStatus: 'unpaid',
        createdAt: serverTimestamp()
      });
      
      // Update socket
      if (socket) {
        socket.emit("unlock_slot", { doctorId, date, time: selectedTime });
      }

      // 4. Send Notifications
      try {
        await fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'booking',
            email: user.email,
            phone: user.phone || '', // Need to add phone field to schema eventually
            details: {
              doctorName: doctorInfo?.name || 'Specialist',
              date: date,
              time: selectedTime,
              patientName: user.name || 'Patient'
            }
          })
        });
      } catch (e) {
        console.error("Silent notification fail", e);
      }

      alert("Appointment Booked Successfully! Confirmation email sent.");
      onClose();
    } catch (err: any) {
      alert(err.message || "Failed to book appointment");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-white p-8 rounded-[2.5rem] shadow-2xl max-w-lg w-full relative overflow-hidden border border-slate-100 max-h-[90vh] overflow-y-auto"
      >
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 transition-colors">
          <X size={20} />
        </button>

        <div className="mb-6">
          <h2 className="font-display text-2xl font-bold text-slate-900 mb-2">Book Appointment</h2>
          <p className="text-slate-500 text-sm">Real-time availability system.</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Select Date</label>
            <div className="relative">
              <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                required 
                type="date" 
                value={date}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => {
                  setSelectedTime('');
                  setDate(e.target.value);
                }}
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all outline-none" 
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Available Slots</label>
              {selectedTime && <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest flex items-center gap-1"><Lock size={10} /> Slot Locked for 5m</span>}
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {TIME_SLOTS.map((t) => {
                const slotKey = `${doctorId}_${date}_${t}`;
                const isBooked = bookedSlots.includes(t);
                const isLocked = lockedSlots.has(slotKey) && lockedSlots.get(slotKey)!.socketId !== socket?.id;
                const isSelected = selectedTime === t;

                let btnClass = "py-2.5 rounded-xl text-sm font-bold border transition-all ";
                if (isSelected) {
                   btnClass += "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200";
                } else if (isBooked || isLocked) {
                   btnClass += "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed opacity-60";
                } else {
                   btnClass += "bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:text-blue-600";
                }

                return (
                  <button
                    key={t}
                    type="button"
                    disabled={isBooked || isLocked}
                    onClick={() => handleSlotSelection(t)}
                    className={btnClass}
                  >
                    {t}
                  </button>
                )
              })}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading || !selectedTime}
            className="w-full bg-slate-900 text-white py-4 mt-4 rounded-[1.25rem] font-bold text-lg hover:bg-blue-600 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Confirm Appointment'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
