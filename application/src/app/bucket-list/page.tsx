// src/app/bucket-list/page.tsx
'use client'

import { useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import Container from "@/components/container";
import PixelatedImage from "@/components/progressive";

export default function Component() {
  const [openIndices, setOpenIndices] = useState<number[]>([1]) // Example default open index

  // Toggle which indices are "open"
  const toggleItem = (index: number) => {
    setOpenIndices(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  // No 'id' or 'hasSubItems' fields needed:
  const bucketList = [
    {
      text: "Learn conversational Chinese",
      completed: false
    },
    {
      text: "Endurance Sports",
      completed: false,
      subItems: [
        {
          text: (
            <a
              href="/IMG_FDB6FAC46E0A-1.jpeg"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              Complete a half marathon
            </a>
          ),
          completed: true
        },
        {
          text: (
            <a
              href="/ABCB5B44-D82E-46BC-8CAC-8584A829E4CB.jpg"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              Complete a marathon
            </a>
          ),
          completed: true
        },
        { text: "Complete a triathlon", completed: false }
      ]
    },
    { text: "Complete an Ironman", completed: false },
    { text: "Author a research paper", completed: false },
    { text: "Build a profitable tech product business", completed: false },
    { text: "Hug Richard Dawkins", completed: false },
    {
      text: "Thank Michael Dante DiMartino and Bryan Konietzko from the bottom of my heart for creating Avatar: The Last Airbender",
      completed: false
    },
    { text: "Go sulfur mining Indonesia and help the workers any way I can", completed: false },
    { text: "True Amazon jungle survival for a week without technology or food", completed: false },
    { text: "Meet my childhood friend Vika again", completed: false },
    { text: "Win a martial arts tournament", completed: false },
    { text: "National Freediving record", completed: true },
    { text: "Fight in an MMA match", completed: false },
    { text: "Work for the world's leading AI research lab", completed: false },
    { text: "Provide my parents a peaceful and comfortable end of life.", completed: false },
    {
      text: "Wildin' Activities",
      completed: false,
      subItems: [
        { text: "Camp in Amazon rainforest", completed: true },
        { text: "Freedive with whales", completed: false },
        { text: "See Rammstein Live", completed: false },
        { text: "Kiteboard", completed: false },
        { text: "Skydive", completed: true },
        { text: "Bungee jump", completed: true },
        {
          text: "Shoot from a machine gun aboard a flying helicopter",
          completed: false
        },
        { text: "Paraglide", completed: true },
        { text: "Shoot from a rocket launcher", completed: false },
        { text: "Wheelie a motorcycle", completed: true },
        { text: "Act in porn", completed: true },
      ]
    },
    {
      text: "Festivals",
      completed: false,
      subItems: [
        { text: "Electric Forest", completed: true },
        { text: "EDC Vegas", completed: true },
        { text: "Tomorrowland", completed: false },
        { text: "Burning Man", completed: false },
        { text: "Ultra Miami", completed: true },
      ]
    },
    {
      text: "Travel & Places to visit",
      completed: false,
      subItems: [
        { text: "Visit Zhangjiajie Glass Bridge", completed: false },
        { text: "Visit Angel Falls", completed: false },
        { text: "Watch the Northern Lights", completed: false },
        { text: "Dive at Western Australia's coral coast", completed: false },
      ]
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 0.2,
        maxHeight: { duration: 0.2 },
        opacity: { duration: 0.15, delay: 0.05 },
      }}
    >
      <Container>
        <ul className="space-y-2">
          {bucketList.map((item, index) => {
            // Check if this item has any subItems
            const hasSubItems = Array.isArray(item.subItems) && item.subItems.length > 0;
            return (
              <li key={index}>
                <div className="flex items-center space-x-4 group">
                  {/* Icon (circle or checkmark) */}
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ease-in-out ${
                      item.completed ? "bg-gray-800" : "border border-gray-300"
                    }`}
                  >
                    {item.completed && (
                      <Check className="w-3 h-3 text-white stroke-[3]" />
                    )}
                  </div>

                  {/* The main text */}
                  <span
                    className={`text-sm font-light transition-all duration-300 ${
                      item.completed ? "text-gray-400" : "text-gray-800"
                    }`}
                  >
                    {item.text}
                  </span>

                  {/* Toggle button (only if subItems exist) */}
                  {hasSubItems && (
                    <button
                      onClick={() => toggleItem(index)}
                      className="focus:outline-none ml-2"
                    >
                      <motion.div
                        animate={{ rotate: openIndices.includes(index) ? 180 : 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      >
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      </motion.div>
                    </button>
                  )}
                </div>

                {/* SubItems (expand / collapse) */}
                <AnimatePresence>
                  {hasSubItems && openIndices.includes(index) && (
                    <motion.ul
                      animate={{ opacity: 1, maxHeight: 1000 }}
                      initial={{ opacity: 0, maxHeight: 0 }}
                      exit={{ opacity: 0, maxHeight: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="mt-2 ml-9 space-y-2 overflow-hidden"
                    >
                      {item.subItems?.map((subItem, subIdx) => (
                        <li key={subIdx} className="flex items-center space-x-4">
                          <div
                            className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ease-in-out ${
                              subItem.completed
                                ? "bg-gray-400"
                                : "border border-gray-200"
                            }`}
                          >
                            {subItem.completed && (
                              <Check className="w-2 h-2 text-white stroke-[3]" />
                            )}
                          </div>
                          <span
                            className={`text-xs font-light transition-all duration-300 ${
                              subItem.completed ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            {subItem.text}
                          </span>
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>

        <div className="w-1/2 pt-10 mx-auto">
          <PixelatedImage
            src="/locked_in.jpg"
            lowResSrc={`/_next/image?url=${encodeURIComponent('/locked_in.jpg')}&w=64&q=75`}
            alt="Description"
            width={1310}
            height={1460}
            className="rounded-lg"
          />
        </div>
      </Container>
    </motion.div>
  )
}
