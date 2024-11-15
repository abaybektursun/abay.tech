// src/components/external-links.tsx
import { ReactNode } from 'react';
import { Linkedin, Github, FileText, Book, Instagram, List, X, Mail } from 'lucide-react';
import Container from "@/components/container";

interface ExternalLinkProps {
  href: string;
  icon: ReactNode; 
  label: string;
}

function ExternalLink({ href, icon, label }: ExternalLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary/50 hover:bg-secondary/80 transition-colors"
    >
      <span className="w-3.5 h-3.5 text-muted-foreground">
        {icon}
      </span>
      <span className="text-xs font-medium text-muted-foreground">
        {label}
      </span>
    </a>
  );
}

export function ExternalLinks() {
  return (
    <Container>
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <ExternalLink 
          href="https://linkedin.com/in/abay" 
          icon={<Linkedin size={14} />} 
          label="LinkedIn" 
        />
        <ExternalLink 
          href="https://github.com/abaybektursun/" 
          icon={<Github size={14} />} 
          label="GitHub" 
        />
        <ExternalLink 
          href="/resume.pdf" 
          icon={<FileText size={14} />} 
          label="Resume" 
        />
        <ExternalLink 
          href="https://www.instagram.com/yourusername" 
          icon={<Instagram size={14} />} 
          label="Instagram" 
        />
        <ExternalLink 
          href="https://instagram.com/abaybtx/" 
          icon={<X size={14} />} 
          label="Twitter" 
        />
        <ExternalLink 
          href="https://www.goodreads.com/user/show/69651448-abay-bektursun" 
          icon={<Book size={14} />} 
          label="Books" 
        />
        <ExternalLink 
          href="/bucket-list" 
          icon={<List size={14} />} 
          label="Bucket List" 
        />
        <ExternalLink 
          href="mailto:your.email@example.com" 
          icon={<Mail size={14} />} 
          label="Email" 
        />
      </div>
    </div>
    </Container>
  );
}