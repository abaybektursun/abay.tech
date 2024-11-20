// components/VoiceToText.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { variants, transition } from '@/lib/animations';
import { Mic } from 'lucide-react';

export default function VoiceToText() {
  const [isRecording, setIsRecording] = useState(false);
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (!('MediaRecorder' in window)) {
      setError('Your browser doesn\'t support voice recording.');
      return;
    }
  }, []);

  const startRecording = async () => {
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
            setText(prev => prev + (prev ? '\n\n' : '') + data.text);
          } else {
            throw new Error(data.error || 'Failed to transcribe audio');
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to transcribe audio');
        }

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start(1000);
      setIsRecording(true);
    } catch (err) {
      setError('Failed to access microphone. Please ensure you\'ve granted permission.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <motion.div 
      className="max-w-3xl mx-auto"
      initial="hidden"
      animate="visible"
      variants={variants.gentleScale}
    >
      <div className="relative">
        {/* Editor container */}
        <div className="bg-white rounded-xl shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
          {/* Title section */}
          <div className="border-b border-gray-100 p-5">
            <div
              className="outline-none text-xl font-medium text-gray-800 empty:before:content-[attr(placeholder)] empty:before:text-gray-400"
              contentEditable
              placeholder="Untitled"
              suppressContentEditableWarning
            />
          </div>

          {/* Content section */}
          <div className="p-5">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Start typing... or click the microphone to record"
              className="w-full min-h-[500px] outline-none resize-none text-gray-700 placeholder:text-gray-400"
              style={{ 
                fontSize: '16px',
                lineHeight: '1.7',
                fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif'
              }}
            />
          </div>
        </div>

        {/* Recording button - now centered and more visible */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
          <motion.button
            onClick={isRecording ? stopRecording : startRecording}
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
                  {/* Pulsing background */}
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

        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-red-50 text-red-500 px-4 py-2 rounded-lg text-sm shadow-lg whitespace-nowrap"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}