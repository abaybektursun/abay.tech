'use client'

import { ReactNode } from "react";
import { ArrowRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import Link from "next/link";

const BentoGrid = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "grid w-full auto-rows-[20rem] grid-cols-1 md:grid-cols-3 gap-4",
        className
      )}
    >
      {children}
    </div>
  );
};

const BentoCard = ({
  name,
  className,
  Icon,
  description,
  href,
  cta,
  available = true,
  glowColor,
  layoutId,
}: {
  name: string;
  className?: string;
  Icon?: any;
  description: string;
  href?: string;
  cta?: string;
  available?: boolean;
  glowColor?: string;
  layoutId?: string;
}) => {
  const content = (
    <SpotlightCard
      title={name}
      description={description}
      available={available}
      glowColor={glowColor}
      layoutId={layoutId}
    >
      {/* Coming Soon Badge */}
      {!available && (
        <div className="flex justify-center">
          <span className="px-3 py-1 text-xs font-medium bg-secondary/80 backdrop-blur-sm rounded-full text-muted-foreground">
            Coming Soon
          </span>
        </div>
      )}
    </SpotlightCard>
  );

  return (
    <div className={cn("h-full", className)}>
      {available && href ? (
        <Link href={href} className="block h-full">
          {content}
        </Link>
      ) : (
        content
      )}
    </div>
  );
};

export { BentoCard, BentoGrid };