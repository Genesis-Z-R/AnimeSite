import { ReactNode } from 'react';
import { cn } from '../lib/utils';

interface Props {
  children: ReactNode;
  className?: string;
  id?: string;
}

export default function GlassBox({ children, className, id }: Props) {
  return (
    <div 
      id={id}
      className={cn(
        "backdrop-blur-md bg-slate-900/40 border border-white/5 rounded-2xl shadow-xl overflow-hidden",
        className
      )}
    >
      {children}
    </div>
  );
}
