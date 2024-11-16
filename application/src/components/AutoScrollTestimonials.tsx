// /src/components/AutoScrollTestimonials.tsx
"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardMedia, Typography } from '@mui/material';
import { Quote, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { styled } from '@mui/material/styles';
import Link from 'next/link';

interface Testimonial {
  id: number;
  type: 'video' | 'text';
  content: string;
  name: string;
  role: string;
}

interface AutoScrollTestimonialsProps {
  testimonials: Testimonial[];
}

// More subtle card styling inspired by Hugging Face
// Modified StyledCard with no borders
const StyledCard = styled(Card)(({ theme }) => ({
  width: '14rem',
  minHeight: '10rem',
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.15s ease-in-out',
  border: 'none',
  boxShadow: 'none',
  borderRadius: '0.5rem',
  backgroundColor: '#FFFFFF',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
  }
}));


const CompactCardHeader = styled(CardHeader)({
  padding: '12px 16px',
  '& .MuiCardHeader-content': {
    overflow: 'hidden',
  },
  '& .MuiCardHeader-title': {
    fontSize: '0.875rem',
    fontWeight: 600,
    lineHeight: '1.25',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    color: '#111827',
  },
  '& .MuiCardHeader-subheader': {
    fontSize: '0.75rem',
    lineHeight: '1.25',
    marginTop: '1px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    color: '#6B7280',
  }
});

const CompactCardContent = styled(CardContent)({
  padding: '0 16px 16px 16px',
  flexGrow: 0.5,
  display: 'flex',
  flexDirection: 'column',
  '&:last-child': {
    paddingBottom: '16px',
  }
});

const ScrollContainer = styled('div')({
  overflowX: 'hidden',
  position: 'relative',
  maxWidth: '72rem',
  margin: '0 auto',
});

const ContentContainer = styled(motion.div)({
  display: 'flex',
  gap: '1rem',
  padding: '0.5rem 0',
  width: 'max-content',
});

// Modified text styling with custom font

const TruncatedText = styled(Typography)({
  display: '-webkit-box',
  WebkitLineClamp: 4,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  lineHeight: '1.6',
  fontSize: '0.875rem',
  fontFamily: 'Georgia, serif',
  fontStyle: 'italic',
  color: '#4B5563',
  marginTop: '4px',
});

const TestimonialCard = ({ testimonial }: { testimonial: Testimonial }) => (
  <Link href="/testimonials" style={{ textDecoration: 'none' }}>
    <StyledCard>
      <CompactCardHeader
        title={testimonial.name}
        subheader={testimonial.role}
      />
      <CompactCardContent>
        {testimonial.type === 'video' ? (
          <div className="relative w-full aspect-video rounded-md overflow-hidden"> 
            <CardMedia
              component="img"
              image={testimonial.content}
              alt={`${testimonial.name}'s testimonial`}
              sx={{ 
                objectFit: 'cover',
                width: '100%',
                height: '100%',
              }}
            />
            <motion.div 
              className="absolute inset-0 flex items-center justify-center"
              initial={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
              whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
              transition={{ duration: 0.15 }}
            >
              <Play className="w-7 h-7 text-white" />
            </motion.div>
          </div>
        ) : (
          <div className="relative">
            <TruncatedText 
              variant="body2"
              sx={{
                position: 'relative',
                '&::first-letter': {
                  marginLeft: '0.2em',
                }
              }}
            >
              {testimonial.content}
            </TruncatedText>
          </div>
        )}
      </CompactCardContent>
    </StyledCard>
  </Link>
);

// Rest of the component remains the same...
export function AutoScrollTestimonials({ testimonials }: AutoScrollTestimonialsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(true);
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startScrolling = useCallback(() => {
    if (scrollIntervalRef.current) return;
    
    setIsScrolling(true);
    scrollIntervalRef.current = setInterval(() => {
      const scrollContainer = scrollRef.current;
      const container = containerRef.current;
      if (!scrollContainer || !container) return;

      if (scrollContainer.scrollLeft >= (container.scrollWidth - scrollContainer.clientWidth)) {
        scrollContainer.scrollLeft = 0;
      } else {
        scrollContainer.scrollLeft += 1;
      }
    }, 50);
  }, []);

  const stopScrolling = useCallback(() => {
    setIsScrolling(false);
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    startScrolling();
    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
    };
  }, [startScrolling]);

  return (
    <ScrollContainer ref={scrollRef}>
      <ContentContainer
        ref={containerRef}
        drag="x"
        dragConstraints={scrollRef}
        onDragStart={stopScrolling}
        onDragEnd={startScrolling}
        dragElastic={0}
        dragTransition={{ power: 0.2, timeConstant: 200 }}
      >
        {[...testimonials, ...testimonials].map((testimonial, index) => (
          <motion.div
            key={`${testimonial.id}-${index}`}
            onHoverStart={stopScrolling}
            onHoverEnd={startScrolling}
          >
            <TestimonialCard testimonial={testimonial} />
          </motion.div>
        ))}
      </ContentContainer>
    </ScrollContainer>
  );
}