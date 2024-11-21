'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic } from 'lucide-react';

interface RecordingButtonProps {
  className?: string;
  onError?: (error: string) => void;
}

export default function RecordingButton({
  className = '',
  onError
}: RecordingButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Add focus event listeners to track the last focused input
  useEffect(() => {
    const handleFocus = (e: FocusEvent) => {
      const element = e.target as HTMLElement;
      if (
        element instanceof HTMLTextAreaElement ||
        element instanceof HTMLInputElement ||
        element.getAttribute('contenteditable') === 'true'
      ) {
        setTargetElement(element);
      }
    };

    // Track blur events to handle cases where user clicks away from input
    const handleBlur = (e: FocusEvent) => {
      const relatedTarget = e.relatedTarget as HTMLElement;
      // Only clear target if focus isn't moving to another valid input
      if (!(
        relatedTarget instanceof HTMLTextAreaElement ||
        relatedTarget instanceof HTMLInputElement ||
        relatedTarget?.getAttribute('contenteditable') === 'true'
      )) {
        // Small delay to handle focus transitions
        setTimeout(() => {
          if (!document.activeElement || document.activeElement === document.body) {
            setTargetElement(null);
          }
        }, 0);
      }
    };

    document.addEventListener('focus', handleFocus, true);
    document.addEventListener('blur', handleBlur, true);

    // Check for MediaRecorder support
    if (!('MediaRecorder' in window)) {
      setError('Your browser doesn\'t support voice recording.');
      onError?.('Your browser doesn\'t support voice recording.');
    }

    return () => {
      document.removeEventListener('focus', handleFocus, true);
      document.removeEventListener('blur', handleBlur, true);
    };
  }, [onError]);

  const insertTextAtCursor = (text: string) => {
    if (!targetElement) return;

    if (targetElement instanceof HTMLTextAreaElement || targetElement instanceof HTMLInputElement) {
      const start = targetElement.selectionStart || 0;
      const end = targetElement.selectionEnd || 0;
      const textBefore = targetElement.value.substring(0, start);
      const textAfter = targetElement.value.substring(end);
      const newText = textBefore + (textBefore ? '\n' : '') + text + textAfter;
      
      targetElement.value = newText;
      
      // Trigger input event for React controlled components
      const inputEvent = new Event('input', { bubbles: true });
      targetElement.dispatchEvent(inputEvent);
      
      // Set cursor position after inserted text
      const newCursorPosition = start + text.length + (textBefore ? 1 : 0);
      targetElement.setSelectionRange(newCursorPosition, newCursorPosition);
    } else if (targetElement.getAttribute('contenteditable') === 'true') {
      const selection = window.getSelection();
      const range = selection?.getRangeAt(0);
      
      if (range) {
        // Create a new text node with line break if needed
        const textNode = document.createTextNode(text);
        range.deleteContents();
        range.insertNode(textNode);
        
        // Move cursor to end of inserted text
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }
  };

  const startRecording = async (event: React.MouseEvent) => {
    event.preventDefault();
    
    if (!targetElement) {
      const errorMessage = 'Please select a text input before starting recording.';
      setError(errorMessage);
      onError?.(errorMessage);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: { ideal: 16000 },
          echoCancellation: true,
          noiseSuppression: true,
        }
      });

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });
      
      chunksRef.current = [];
      setError(null);

      mediaRecorderRef.current.ondataavailable = async (event) => {
        chunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('file', audioBlob, 'recording.webm');

        try {
          const response = await fetch('/api/transcribe', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Transcription failed');
          }

          const data = await response.json();
          if (data.success) {
            targetElement?.focus();
            insertTextAtCursor(data.text);
          } else {
            throw new Error(data.error || 'Failed to transcribe audio');
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to transcribe audio';
          setError(errorMessage);
          onError?.(errorMessage);
        }

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start(1000);
      setIsRecording(true);
    } catch (err) {
      const errorMessage = 'Failed to access microphone. Please ensure you\'ve granted permission.';
      setError(errorMessage);
      onError?.(errorMessage);
    }
  };

  const stopRecording = (event: React.MouseEvent) => {
    event.preventDefault();
    
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="relative">
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 bg-red-50 text-red-500 px-4 py-2 rounded-lg text-sm shadow-lg whitespace-nowrap"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        ref={buttonRef}
        onMouseDown={isRecording ? stopRecording : startRecording}
        className={`
          relative w-14 h-14 rounded-full 
          ${isRecording 
            ? 'bg-red-50 border-2 border-red-500' 
            : 'bg-white border border-gray-200'
          } 
          shadow-[0_4px_12px_rgba(0,0,0,0.1)] 
          hover:shadow-[0_6px_16px_rgba(0,0,0,0.12)] 
          flex items-center justify-center 
          transition-all duration-200
          ${className}
        `}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          {isRecording ? (
            <motion.div 
              key="recording"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="relative"
            >
              <motion.div
                className="absolute -inset-1 rounded-full bg-red-500 opacity-20"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <Mic className="w-6 h-6 text-red-500" />
            </motion.div>
          ) : (
            <motion.div 
              key="idle"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Mic className="w-6 h-6 text-gray-600" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}