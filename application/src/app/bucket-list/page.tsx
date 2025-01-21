// src/app/bucket-list/page.tsx
'use client'

import Container from "@/components/container";

import { useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import PixelatedImage from "@/components/progressive"

export default function Component() {
    const [openItems, setOpenItems] = useState<number[]>([])
  
    const bucketList = [
        { id: 2,  text: "Learn conversational Chinese", completed: false },
        { id: 3,  text: "Run a marathon", completed: false},
        { id: 4,  text: "Author a research paper", completed: false },
        { id: 5,  text: "Build a profitable tech product business", completed: false },
        { id: 6,  text: "Hug Richard Dawkins", completed: false },
        { id: 7,  text: "Thank Michael Dante DiMartino and Bryan Konietzko from the bottom of my heart for creating Avatar: The Last Airbender", completed: false },
        { id: 8,  text: "Go sulfur mining Indonesia and help the workers any way I can", completed: false },
        { id: 15, text: "Meet my childhood friend Vika again", completed: false },
        { id: 16, text: "Win a martial arts tournament", completed: false },
        { id: 17, text: "National Freediving record", completed: true },
        { id: 18, text: "Complete an Ironman", completed: false },
        { id: 19, text: "Fight in an MMA match", completed: false },
        { id: 25, text: "Work for world's leading AI research lab", completed: false },
        { id: 26, text: "Provide my parents a peaceful and comfortable end of life.", completed: false },
        { id: 20, text: "Activities" , completed: false, hasSubItems: true, subItems: [
            { id: 10, text: "Freedive with whales", completed: false },
            { id: 9, text: "See Rammstein Live", completed: false },
            { id: 12, text: "Kiteboard", completed: false },
            { id: 20, text: "Skydive", completed: true },
            { id: 21, text: "Bungee jump", completed: true },
            { id: 22, text: "Shoot from a machine gun aboard a flying helicopter", completed: false },
            { id: 23, text: "Paraglide", completed: true },
            { id: 13, text: "Shoot from a rocket launcher", completed: false },
            { id: 11, text: "Wheelie a motorcycle", completed: true },
            { id: 14, text: "Act in porn", completed: true },
          ]
        },
        { id: 24, text: "Festivals", completed: false, hasSubItems: true, subItems: [
            { id: 24, text: "Electric Forest", completed: true },
            { id: 25, text: "EDC Vegas", completed: true },
            { id: 26, text: "Tomorrowland", completed: false },
            { id: 27, text: "Burning Man", completed: false },
            { id: 30, text: "Ultra Miami", completed: true },
        ]},
        {
          id: 1,
          text: "Travel",
          completed: false,
          hasSubItems: true,
          subItems: [
            { id: 'b', text: "Visit Zhangjiajie Glass Bridge", completed: false },
            { id: 'c', text: "Visit Angel Falls", completed: false },
            { id: 'd', text: "Watch the Northern Lights", completed: false },
            { id: 'e', text: "Dive at Western Australia's coral coast", completed: false },
          ]
        },
      ];
  
    const toggleItem = (id: number) => {
      setOpenItems(prevOpenItems =>
        prevOpenItems.includes(id)
          ? prevOpenItems.filter(item => item !== id)
          : [...prevOpenItems, id]
      )
    }
  
    return (
        <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ 
        duration: 0.2,
        maxHeight: { duration: 0.2 },
        opacity: { duration: 0.15, delay: 0.05 }
      }}
        >
        <Container>
          <ul className="space-y-2">
            {bucketList.map((item) => (
              <li key={item.id}>
                <div className="flex items-center space-x-4 group">
                  <div 
                    className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ease-in-out ${
                      item.completed ? 'bg-gray-800' : 'border border-gray-300'
                    }`}
                  >
                    {item.completed && (
                      <Check className="w-3 h-3 text-white stroke-[3]" />
                    )}
                  </div>
                  <span
                    className={`text-sm font-light transition-all duration-300 ${
                      item.completed ? 'text-gray-400' : 'text-gray-800'
                    }`}
                  >
                    {item.text}
                  </span>
                  {item.hasSubItems && (
                    <button 
                      onClick={() => toggleItem(item.id)} 
                      className="focus:outline-none ml-2"
                    >
                      <motion.div
                        animate={{ rotate: openItems.includes(item.id) ? 180 : 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      >
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      </motion.div>
                    </button>
                  )}
                </div>
                <AnimatePresence>
                  {item.hasSubItems && openItems.includes(item.id) && (
                    <motion.ul
                      animate={{ opacity: 1, maxHeight: 1000 }}
                    initial={{ opacity: 0, maxHeight: 0 }}
                    exit={{ opacity: 0, maxHeight: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="mt-2 ml-9 space-y-2 overflow-hidden"
                    >
                      {item.subItems?.map((subItem) => (
                        <li key={subItem.id} className="flex items-center space-x-4">
                          <div 
                            className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ease-in-out ${
                              subItem.completed ? 'bg-gray-400' : 'border border-gray-200'
                            }`}
                          >
                            {subItem.completed && (
                              <Check className="w-2 h-2 text-white stroke-[3]" />
                            )}
                          </div>
                          <span
                            className={`text-xs font-light transition-all duration-300 ${
                              subItem.completed ? 'text-gray-400' : 'text-gray-600'
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
            ))}
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

  