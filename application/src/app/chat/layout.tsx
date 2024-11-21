// app/journal/layout.tsx
import 'ai-chatbot/app/globals.css';
import { SidebarProvider } from 'ai-chatbot/components/ui/sidebar';

export default function JournalLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 return (
  <SidebarProvider>
   <div className="flex h-screen overflow-hidden dark:bg-zinc-950">
     {children}
   </div>
  </SidebarProvider>
 );
}