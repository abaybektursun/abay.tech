// src/components/header.tsx
'use client';

import Link from "next/link";
import Container from "@/components/container";
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  
  return (
    <header className="py-6">
      <Container>
        <nav className="flex justify-between items-center">
          <div className="flex space-x-4">
            {[
              { href: '/', label: 'About' },
              { href: '/posts', label: 'Posts' }
            ].map((link) => (
              <div key={link.href}>
                <Link 
                  href={link.href}
                  className={`relative ${pathname === link.href ? 'text-gray-900' : 'text-gray-600 hover:text-gray-900 transition-colors duration-200'}`}
                >
                  {link.label}
                  {pathname === link.href && (
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
                </Link>
              </div>
            ))}
          </div>
        </nav>
      </Container>
    </header>
  );
}