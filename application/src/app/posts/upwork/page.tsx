// src/app/posts/upwork-data-analysis/page.tsx
'use client'

import { useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'

// Styles for the spinner animation
const spinnerStyles = `
  .spinner {
    animation: rotator 1.4s linear infinite;
  }

  @keyframes rotator {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(270deg); }
  }

  .path {
    stroke-dasharray: 187;
    stroke-dashoffset: 0;
    transform-origin: center;
    animation: dash 1.4s ease-in-out infinite, colors 5.6s ease-in-out infinite;
  }

  @keyframes colors {
    0% { stroke: #4285F4; }
    25% { stroke: #DE3E35; }
    50% { stroke: #F7C223; }
    75% { stroke: #1B9A59; }
    100% { stroke: #4285F4; }
  }

  @keyframes dash {
    0% { stroke-dashoffset: 187; }
    50% {
      stroke-dashoffset: 46.75;
      transform: rotate(135deg);
    }
    100% {
      stroke-dashoffset: 187;
      transform: rotate(450deg);
    }
  }
`

export default function UpworkAnalysisPost() {
  const bubbleChartRef = useRef<HTMLCanvasElement>(null)
  const embedPlotRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load external scripts
    const loadScript = async (url: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script')
        script.src = url
        script.onload = () => resolve()
        script.onerror = () => reject()
        document.head.appendChild(script)
      })
    }

    const loadScripts = async () => {
      try {
        await loadScript('https://code.jquery.com/jquery-3.6.0.min.js')
        await loadScript('https://cdn.jsdelivr.net/npm/chart.js')
        await loadScript('https://cdn.jsdelivr.net/npm/nouislider/distribute/nouislider.min.js')
        await loadScript('https://unpkg.com/@sgratzl/chartjs-chart-boxplot')
        await loadScript('https://cdn.plot.ly/plotly-latest.min.js')
        await loadScript('https://abay.tech/js/main.bundle.js')
      } catch (error) {
        console.error('Failed to load scripts:', error)
      }
    }

    loadScripts()
  }, [])

  return (
    <article className="max-w-4xl mx-auto py-8 px-4 prose lg:prose-xl">
      <style>{spinnerStyles}</style>
      
      <p><strong>If you are just interested in the data analysis, skip to the end of the article.</strong></p>
      
      <p>Summer, 2022. I quit my lucrative AI job not out of dissatisfaction, but out of exhilaration. 
      My past couple of years were brimming with happiness, which sparked an awakening within me: 
      if I did not leap into the unknown, doing so might eventually become difficult or even impossible. 
      Within two hours of this epiphany, I sent my company 2-week notice.</p>
      
      <p>Prior to my return to AI, I filled various roles - a mover, a photographer, a dating coach. 
      While they were entertaining diversions, AI remained my true love, leading me to freelance and 
      consult in the space. <span>Despite exploring a variety of avenues, it was Upwork that stood out</span>, 
      it consistently delivered quality clients and became the major source of my income.</p>

      <h2>Space of Startup Ideas</h2>

      <div className="accordion">
        <button className="accordion-title">Click here to expand</button>
        <div className="accordion-content">
          <pre className="text-sm text-gray-400">
            {`meta_prompt = """
    Job Post :
    \`\`\`
    {job_description}
    \`\`\`
    You are a product-market-fit expert that follows the 80/20 rule...
    """
            `}
          </pre>
        </div>
      </div>

      <p>After sampling the majority of the dataset, I further distilled it and requested GPT-4 to 
      provide the final categories.</p>

      <div className="min-w-[1000px] w-auto overflow-auto">
        <svg className="spinner" width="65px" height="65px" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
          <circle className="path" fill="none" strokeWidth="6" strokeLinecap="round" cx="33" cy="33" r="30"></circle>
        </svg>
        <canvas ref={bubbleChartRef} id="bubbleChart"></canvas>
      </div>

      <div className="min-w-[1000px] w-auto overflow-auto">
        <p>Next, I created vector embeddings of all the problems and reduced their dimensions using UMAP. 
        The result is shown below. You can explore the semantic space of problems. 
        Hover over the points to read the text:</p>
      </div>

      <div className="min-w-[1000px] w-auto overflow-auto">
        <svg className="spinner" width="65px" height="65px" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
          <circle className="path" fill="none" strokeWidth="6" strokeLinecap="round" cx="33" cy="33" r="30"></circle>
        </svg>
        <div ref={embedPlotRef} id="embedPlot"></div>
      </div>

      <div className="min-w-[1000px] w-auto overflow-auto">
        <p>This market analysis helped me pinpoint the ideal sector for building initial startup startup: 
        financial technology.</p>
      </div>

      <div id="classificationChart"></div>
    </article>
  )
}