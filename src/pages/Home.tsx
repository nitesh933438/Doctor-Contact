import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShieldCheck, Clock, Star, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 lg:py-28">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
            <Star size={14} fill="currentColor" /> Trust score: 4.9/5
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-bold text-slate-900 leading-[1.1] mb-6">
            Healthcare <span className="text-blue-600">Simplified.</span>
          </h1>
          <p className="text-lg text-slate-600 mb-10 max-w-lg leading-relaxed">
            Connect with verified specialists, manage your health history, and book appointments in seconds. All in one place.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Link to="/doctors" className="bg-blue-600 text-white px-8 py-4 rounded-2xl text-lg font-bold hover:bg-blue-700 transition-all hover:shadow-lg hover:shadow-blue-200 active:scale-95 flex items-center justify-center gap-2">
              Book Now <ArrowRight size={20} />
            </Link>
            <Link to="/login" className="bg-white border-2 border-slate-100 text-slate-900 px-8 py-4 rounded-2xl text-lg font-bold hover:bg-slate-50 transition-all flex items-center justify-center">
              Create Account
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 text-green-600 rounded-lg"><ShieldCheck size={20}/></div>
              <span className="text-sm font-medium text-slate-600">Fully Verified Doctors</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Clock size={20}/></div>
              <span className="text-sm font-medium text-slate-600">24/7 Priority Support</span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          <div className="absolute -inset-4 bg-blue-100 rounded-[3rem] blur-2xl opacity-30 -z-10" />
          <img
            src="https://picsum.photos/seed/doctor-hero/800/1000"
            alt="Medical Professional"
            className="rounded-[2.5rem] shadow-2xl w-full object-cover aspect-[4/5] lg:aspect-auto"
            referrerPolicy="no-referrer"
          />
        </motion.div>
      </div>
    </div>
  );
}
