// app/journal/layout.tsx
import 'ai-chatbot/app/globals.css';

export default function JournalLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 return (
   <div className="flex h-screen overflow-hidden dark:bg-zinc-950">
     {children}
   </div>
 );
}