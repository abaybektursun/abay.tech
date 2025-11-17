import { ReactNode } from "react";
import { ArrowRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
  background,
}: {
  name: string;
  className?: string;
  Icon?: any;
  description: string;
  href?: string;
  cta?: string;
  available?: boolean;
  background?: ReactNode;
}) => (
  <div
    className={cn(
      "group relative flex flex-col justify-between overflow-hidden rounded-xl",
      // Beautiful shadows and borders
      "[box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]",
      "transform-gpu dark:bg-black dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]",
      // Hover effects
      available && "cursor-pointer transition-all duration-300 hover:scale-[1.01]",
      !available && "opacity-75",
      className
    )}
  >
    {/* Background gradient or pattern */}
    {background && (
      <div className="absolute inset-0 opacity-50">
        {background}
      </div>
    )}

    {/* Content */}
    <div className="pointer-events-none z-10 flex transform-gpu flex-col gap-1 p-6 transition-all duration-300 group-hover:-translate-y-2">
      {Icon && (
        <Icon className="h-10 w-10 origin-left transform-gpu text-muted-foreground transition-all duration-300 ease-in-out group-hover:scale-75" />
      )}
      <h3 className="text-xl font-semibold text-foreground">
        {name}
      </h3>
      <p className="text-muted-foreground">{description}</p>
    </div>

    {/* CTA Button */}
    {available && href && cta && (
      <div
        className={cn(
          "pointer-events-none absolute bottom-0 flex w-full translate-y-10 transform-gpu flex-row items-center p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
        )}
      >
        <Button variant="ghost" asChild size="sm" className="pointer-events-auto">
          <a href={href}>
            {cta}
            <ArrowRightIcon className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </div>
    )}

    {/* Coming Soon Badge */}
    {!available && (
      <div className="absolute top-4 right-4 z-10">
        <span className="px-3 py-1 text-xs font-medium bg-secondary/80 backdrop-blur-sm rounded-full text-muted-foreground">
          Coming Soon
        </span>
      </div>
    )}

    {/* Hover overlay */}
    <div className="pointer-events-none absolute inset-0 transform-gpu transition-all duration-300 group-hover:bg-black/[.03] group-hover:dark:bg-neutral-800/10" />
  </div>
);

export { BentoCard, BentoGrid };