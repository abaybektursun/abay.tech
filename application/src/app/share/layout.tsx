// Standalone layout for shared chats - no site navigation
export default function ShareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 bg-background">
      {children}
    </div>
  );
}
