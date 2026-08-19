import { ReactNode } from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Portal do Tutor | Petia',
  description: 'Acompanhe as vacinas e agendamentos do seu pet.',
};

export default function TutorLayout({ children }: { children: ReactNode }) {
  // We use this layout to encapsulate the tutor portal, avoiding any dashboard components
  return (
    <div className="min-h-screen bg-st-navy selection:bg-st-electric selection:text-white">
      {children}
    </div>
  );
}
