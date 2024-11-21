// app/journal/layout.tsx
import 'ai-chatbot/app/globals.css';
import RecordingButton from '@/components/RecordingButton';
import { SidebarProvider } from 'ai-chatbot/components/ui/sidebar';
import Container from '@/components/container';

export default function JournalLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 return (
  <Container>
  <SidebarProvider>
     {children}
    <div className="fixed top-8 right-8 z-50">
      <RecordingButton />
    </div>
  </SidebarProvider>
  </Container>
 );
}