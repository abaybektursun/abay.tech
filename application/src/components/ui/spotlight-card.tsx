'use client'

import { ReactNode, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface SpotlightCardProps {
  title: string
  description?: string
  children?: ReactNode
  className?: string
  glowColor?: string
  available?: boolean
}

export const SpotlightCard = ({
  title,
  description,
  children,
  className,
  glowColor = 'bg-sky-600/60 dark:bg-sky-400/60',
  available = true
}: SpotlightCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!available) return

    const handleMouseMove = (ev: MouseEvent) => {
      if (!cardRef.current) return

      const blob = cardRef.current.querySelector('.blob') as HTMLElement
      const fblob = cardRef.current.querySelector('.fake-blob') as HTMLElement

      if (!blob || !fblob) return

      const rec = fblob.getBoundingClientRect()

      blob.style.opacity = '1'

      blob.animate(
        [
          {
            transform: `translate(${
              ev.clientX - rec.left - rec.width / 2
            }px, ${ev.clientY - rec.top - rec.height / 2}px)`
          }
        ],
        {
          duration: 300,
          fill: 'forwards'
        }
      )
    }

    const handleMouseLeave = () => {
      if (!cardRef.current) return
      const blob = cardRef.current.querySelector('.blob') as HTMLElement
      if (blob) {
        blob.style.opacity = '0'
      }
    }

    window.addEventListener('mousemove', handleMouseMove)

    if (cardRef.current) {
      cardRef.current.addEventListener('mouseleave', handleMouseLeave)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      if (cardRef.current) {
        cardRef.current.removeEventListener('mouseleave', handleMouseLeave)
      }
    }
  }, [available])

  return (
    <div
      ref={cardRef}
      className={cn(
        'spotlight-card group bg-border relative overflow-hidden rounded-xl p-px transition-all duration-300 ease-in-out h-full',
        available && 'cursor-pointer hover:scale-[1.01]',
        !available && 'opacity-75',
        className
      )}
    >
      <Card className='group-hover:bg-card/90 h-full border-none transition-all duration-300 ease-in-out group-hover:backdrop-blur-[20px]'>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && (
            <CardDescription>{description}</CardDescription>
          )}
        </CardHeader>
        {children && (
          <CardContent>
            {children}
          </CardContent>
        )}
      </Card>
      {available && (
        <>
          <div className={cn('blob absolute top-0 left-0 h-32 w-32 rounded-full opacity-0 blur-3xl transition-all duration-300 ease-in-out', glowColor)} />
          <div className='fake-blob absolute top-0 left-0 h-20 w-20 rounded-full' />
        </>
      )}
    </div>
  )
}