import React from 'react';
import { motion } from 'motion/react';

export const Skeleton = ({ className }: { className?: string }) => (
  <div className={`bg-slate-100 animate-pulse rounded-2xl ${className}`} />
);

export const CardSkeleton = () => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
    <div className="flex justify-between">
      <Skeleton className="w-12 h-12" />
      <Skeleton className="w-16 h-6" />
    </div>
    <div className="space-y-4">
      <Skeleton className="w-24 h-4" />
      <Skeleton className="w-48 h-10" />
    </div>
  </div>
);

export const TableSkeleton = () => (
  <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden p-8 space-y-4">
    <Skeleton className="w-full h-12" />
    <Skeleton className="w-full h-12 opacity-80" />
    <Skeleton className="w-full h-12 opacity-60" />
    <Skeleton className="w-full h-12 opacity-40" />
    <Skeleton className="w-full h-12 opacity-20" />
  </div>
);

export const ErrorUI = ({ message, onRetry }: { message?: string, onRetry?: () => void }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="flex flex-col items-center justify-center p-12 bg-rose-50 rounded-[3rem] border border-rose-100 text-center"
  >
    <div className="w-16 h-16 bg-rose-500 rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl shadow-rose-200">
      <span className="text-2xl font-bold">!</span>
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-2">Something went wrong</h3>
    <p className="text-slate-500 font-medium mb-8 max-w-xs">{message || 'We could not complete the operation. Please check your connection and try again.'}</p>
    {onRetry && (
      <button 
        onClick={onRetry}
        className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-rose-600 transition-all active:scale-95"
      >
        Try Again
      </button>
    )}
  </motion.div>
);
