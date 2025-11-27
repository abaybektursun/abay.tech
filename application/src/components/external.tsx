// src/components/external-links.tsx
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { Linkedin, Github, FileText, Book, Instagram, List, X, Mail } from 'lucide-react';
import Container from "@/components/container";

interface SmartLinkProps {
  href: string;
  icon: ReactNode;
  label: string;
  internal?: boolean;
}

const SmartLink = ({ href, icon, label, internal = false }: SmartLinkProps) => {
  const pathname = usePathname();

  const sharedClassName = "inline-flex items-center gap-2 px-3 py-1.5 hover:text-foreground transition-colors";

  const content = (
    <>
      <span className="w-3.5 h-3.5 text-muted-foreground">
        {icon}
      </span>
      <span className="text-xs font-medium text-muted-foreground">
        {label}
      </span>
      {internal && pathname === href && (
        <motion.div
          layoutId="underline"
          className="absolute left-0 top-full h-[1px] w-full bg-gray-900"
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 40
          }}
        />
      )}
    </>
  );

  if (internal) {
    return (
      <div className="relative">
        <Link
          href={href}
          className={sharedClassName}
        >
          {content}
        </Link>
      </div>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={sharedClassName}
    >
      {content}
    </a>
  );
};

export function ExternalLinks() {
  return (
    <Container>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <SmartLink
            href="https://linkedin.com/in/abay"
            icon={<Linkedin size={14} />}
            label="LinkedIn"
          />
          <SmartLink
            href="https://github.com/abaybektursun/"
            icon={<Github size={14} />}
            label="GitHub"
          />
          <SmartLink
            href="/resume.pdf"
            icon={<FileText size={14} />}
            label="Resume"
          />
          <SmartLink
            href="https://www.instagram.com/abaybtx"
            icon={<Instagram size={14} />}
            label="Instagram"
          />
          <SmartLink
            href="https://x.com/Abaybektursun"
            icon={<X size={14} />}
            label="Twitter"
          />
          <SmartLink
            href="mailto:villas.cautery-0j@icloud.com"
            icon={<Mail size={14} />}
            label="Email"
          />
          <SmartLink
            href="https://www.goodreads.com/user/show/69651448-abay-bektursun"
            icon={<Book size={14} />}
            label="Books"
          />
          <SmartLink
            href="/bucket-list"
            icon={<List size={14} />}
            label="Bucket List"
            internal={true}
          />
        </div>
      </div>
    </Container>
  );
}