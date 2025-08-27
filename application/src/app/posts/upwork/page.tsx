'use client'
import Head from 'next/head'
import Script from 'next/script'
import React from 'react'
import Container from '@/components/container'

export default function Home() {
  return (
    <Container>
      {/* 1) Standard HTML head content */}
      <Head>
        <title>Unseen Opportunities: Upwork + GPT | Abay Bektursun</title>
        <meta name="description" content="How I used GPT-4 to analyze 100k+ Upwork job posts and discover startup opportunities in the freelance economy." />
      </Head>

      {/* 2) External libraries (load before interactive if needed by your bundle) */}
      <Script
        src="https://code.jquery.com/jquery-3.6.0.min.js"
        strategy="beforeInteractive"
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/chart.js"
        strategy="beforeInteractive"
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/nouislider/distribute/nouislider.min.js"
        strategy="beforeInteractive"
      />
      <Script
        src="https://unpkg.com/@sgratzl/chartjs-chart-boxplot"
        strategy="beforeInteractive"
      />
      <Script
        src="https://cdn.plot.ly/plotly-2.26.0.min.js"
        strategy="beforeInteractive"
      />

      {/* 3) Page content in JSX */}
      <article className="max-w-4xl mx-auto px-6 py-12 prose prose-lg prose-gray">
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8 rounded-r-lg">
          <p className="text-blue-800 font-medium mb-0 mt-0">
            <strong>Quick Navigation:</strong> If you're just interested in the data analysis and visualizations, <a href="#visualizations" className="text-blue-600 hover:text-blue-800 underline">skip to the charts</a>.
          </p>
        </div>

        <header className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
            Unseen Opportunities: Upwork + GPT
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            How I analyzed 100,000+ freelance job posts with AI to uncover hidden startup opportunities
          </p>
          <div className="flex items-center gap-4 mt-6 text-sm text-gray-500">
            <time>July 8, 2023</time>
            <span>•</span>
            <span>12 min read</span>
          </div>
        </header>
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-8 rounded-xl mb-8 border border-purple-100">
          <p className="text-lg leading-relaxed text-gray-800 mb-0 mt-0">
            Summer, 2022. I quit my lucrative AI job not out of dissatisfaction, but out of <em className="text-purple-700 font-medium">exhilaration</em>. My past couple of years were brimming with happiness, which sparked an awakening within me: if I did not leap into the unknown, doing so might eventually become difficult or even impossible. Within two hours of this epiphany, I sent my company 2-week notice.
          </p>
        </div>
        <p>
          Prior to my return to AI, I filled various roles - a mover, a
          photographer, a dating coach. While they were entertaining diversions,
          AI remained my true love, leading me to freelance and consult in the
          space. <span style={{ fontWeight: 400 }}>
            Despite exploring a variety of avenues, it was Upwork that stood out
          </span>
          , it consistently delivered quality clients and became the major
          source of my income. It allowed me to travel around South America and
          have incredible adventures. One day, I was jogging in Medellin, and I
          realized without a shadow of a doubt that I am ready to build a
          startup. I started reading books, building prototypes, and talking to
          a lot of people in entrepreneurship and tech. One theme kept coming
          up, and Naval Ravikant put it succinctly:{' '}
          <em>
            "You will get rich by giving society what it wants but does not yet
            know how to get. At scale."
          </em>
        </p>
        <p>
          I started looking for problems to be solved. Then, I remembered that
          there is a vast pool of real-life business problems I have been
          sitting on: Upwork. If a business does not have the capacity to solve
          a problem internally, they look for help externally. Unlike something
          like surveys, client will post their problem only if they are truly in
          need of a solution. Upwork is a goldmine of business opportunities,
          you just need little help form AI to extract them.
        </p>
        <h2 className="text-3xl font-bold text-gray-900 mt-16 mb-8 border-b-2 border-gray-200 pb-4">
          The Space of Startup Ideas
        </h2>
        <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-gray-400 mb-6">
          <p className="text-gray-800 mb-0 mt-0">
            Job posts are typically rich in textual data detailing candidate preferences, company profiles, and problem statements. Doing analytics with text has not been very practical, but with the advent of powerful GPTs, we can now extract substantial structured data.
          </p>
        </div>
        <div className="bg-green-50 p-6 rounded-lg mb-8">
          <h3 className="text-lg font-semibold text-green-800 mb-3 mt-0">Data Collection</h3>
          <p className="text-green-800 mb-0 mt-0">
            I started gathering posts in real time and amassed over <strong>100,000 job posts</strong> in just a few weeks. It took 2 days to prompt engineer something that could extract customer pain points accurately.
          </p>
        </div>

        <h3 className="text-xl font-semibold text-gray-900 mb-4">GPT Prompt Engineering</h3>
        <p className="mb-4">Here's the prompt I used to extract structured data from job posts (few-shot examples excluded):</p>

        <details className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6 overflow-hidden">
          <summary className="bg-gray-50 px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors font-medium text-gray-800">
            Click to view the GPT prompt
          </summary>
          <div className="p-6">
            <pre className="bg-gray-800 text-gray-300 p-4 rounded-lg text-sm overflow-x-auto font-mono leading-relaxed">
{`meta_prompt = """
    Job Post :
    \`\`\`
    {job_description}
    \`\`\`
    You are a product-market-fit expert that follows the 80/20 rule, has an engineering mindset, and understands customer problems very deeply. Give non-BS, non-corporate response. 
    Return a list of tags that apply to the job posting. Chose the tags that apply to the job post from below:
    * Talent: If the post is describing the skills, experiences, or any other attributes they are looking for, or describes the responsibilities/requirements for the talent, they will go to this field.
    * Client: if the post talks about the poster (client). Could be a company, org, or individual, put that information in this field.
    * Problem: If the post describes a specific pain point or problem the customer has that talent can address, explain it here. This is an important field. Problem is something to be solved by the talent, so "looking for" / "seeking" must NOT be in this field. Again, the problem is not finding talent or hiring, but a problem to be solved by the talent. Do not include "looking to hire", "needs to hire" etc. in this field, just the client's problem to be solved by someone they would hire.
    * Implied Problem: If the post does not explicitly specify the problem, you can imply the problem,  this might be some more deep-rooted problem that was not mentioned in the post. Seeking talent is not a Problem. 
    * Client Solution: If the client already knows the solution, explain it here. Again, the solution is not finding talent or hiring, but a solution to be implemented by the talent.
    * Outcome: What's the business outcome if the problem and implied problems are solved?

    Respond in JSON format, for example:
    \`\`\`
    {{ "Talent": "...", "Client": "...", Problem:"...", "Implied Problem": "..." }}
    \`\`\`
    Only add keys if the attribute applies. The values are strings with your explanation and reasoning for the chosen attribute, so the entire response is in JSON format. Only respond with the JSON.
...
    """`}
            </pre>
          </div>
        </details>

        <div className="bg-gray-50 p-6 rounded-lg mb-8 border border-gray-200">
          <p className="text-gray-700 mb-0 mt-0">
            <a href="https://openai.com/blog/function-calling-and-other-api-updates" className="text-gray-600 hover:text-gray-800 underline font-medium">
              OpenAI's API updates
            </a> came in perfectly! I was able to use their 16k context model to sample large chunks of client problems and start creating taxonomies.
          </p>
        </div>

        <h3 className="text-xl font-semibold text-gray-900 mb-4">Creating Problem Taxonomies</h3>

        <details className="bg-white border border-gray-200 rounded-lg shadow-sm mb-8 overflow-hidden">
          <summary className="bg-gray-50 px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors font-medium text-gray-800">
            Click to view the taxonomy creation code
          </summary>
          <div className="p-6">
            <pre className="bg-gray-800 text-gray-300 p-4 rounded-lg text-sm overflow-x-auto font-mono leading-relaxed">
{`system_message = SystemMessage(content="You are a successful serial entrepreneur.")
prompt_template = """
You are tasked with creating high level taxonomy.
These business problems are separated by |
\`\`\`
{descs}
\`\`\`

Create high-level categories for these problems. You must create as few categories as possible, every problem problems should fall into at least of the categories.
You are not classifying each job. You are summarizing the problems into high-level categories.
Respond with a JSON list of categories:
\`\`\`json
["...", "...", "...", ...]
\`\`\`
"""`}
            </pre>
          </div>
        </details>

        <div className="bg-gray-50 p-6 rounded-lg mb-8 border border-gray-200">
          <p className="text-gray-700 mb-0 mt-0">
            After sampling the majority of the dataset, I further distilled it and requested GPT-4 to provide the final categories. Now we can visualize the categories of problems in relation to volume, investment, and customer budget.
          </p>
        </div>

        <section id="visualizations" className="mt-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 border-b-2 border-gray-200 pb-4">
            Data Visualizations
          </h2>
          
          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-0">Problem Categories by Budget & Volume</h3>
            <p className="text-gray-700 mb-0 mt-0">
              The bubble size represents the count of job postings. X-axis shows average hourly pay, Y-axis shows average client spending on Upwork. This reveals how much people are willing to pay to solve problems in each category.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 mb-12" style={{ width: '1200px', maxWidth: 'none', overflowX: 'visible', marginLeft: '50%', transform: 'translateX(-50%)' }}>
          <svg
            className="spinner"
            width="65px"
            height="65px"
            viewBox="0 0 66 66"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              className="path"
              fill="none"
              strokeWidth="6"
              strokeLinecap="round"
              cx="33"
              cy="33"
              r="30"
            ></circle>
          </svg>
            <canvas id="bubbleChart" className="w-full h-96"></canvas>
          </div>

          <div className="bg-purple-50 p-6 rounded-lg mb-8">
            <h3 className="text-xl font-semibold text-purple-800 mb-3 mt-0">Semantic Problem Space</h3>
            <p className="text-purple-700 mb-0 mt-0">
              I created vector embeddings of all problems and reduced their dimensions using UMAP. Explore the semantic space below - hover over points to read the problem descriptions.
            </p>
          </div>

        <div style={{ width: '1200px', maxWidth: 'none', overflowX: 'visible', marginLeft: '50%', transform: 'translateX(-50%)' }}>
          <svg
            className="spinner"
            width="65px"
            height="65px"
            viewBox="0 0 66 66"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              className="path"
              fill="none"
              strokeWidth="6"
              strokeLinecap="round"
              cx="33"
              cy="33"
              r="30"
            ></circle>
          </svg>
            <div id="embedPlot" className="w-full" style={{ minHeight: '700px' }}></div>
          </div>

          <div className="bg-green-50 p-8 rounded-lg border border-green-200">
            <h3 className="text-2xl font-semibold text-green-800 mb-4 mt-0">Key Insight</h3>
            <p className="text-green-800 text-lg mb-0 mt-0">
              This market analysis helped me pinpoint the ideal sector for building my initial startup: <strong>financial technology</strong>.
            </p>
          </div>

          <div id="classificationChart" className="mt-8"></div>
        </section>
      </article>

      {/* 4) Global styles for the spinner */}
      <style jsx global>{`
        .spinner {
          -webkit-animation: rotator 1.4s linear infinite;
          animation: rotator 1.4s linear infinite;
        }

        @-webkit-keyframes rotator {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(270deg);
          }
        }

        @keyframes rotator {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(270deg);
          }
        }
        .path {
          stroke-dasharray: 187;
          stroke-dashoffset: 0;
          transform-origin: center;
          -webkit-animation: dash 1.4s ease-in-out infinite,
            colors 5.6s ease-in-out infinite;
          animation: dash 1.4s ease-in-out infinite, colors 5.6s ease-in-out
            infinite;
        }

        @-webkit-keyframes colors {
          0% {
            stroke: #4285f4;
          }
          25% {
            stroke: #de3e35;
          }
          50% {
            stroke: #f7c223;
          }
          75% {
            stroke: #1b9a59;
          }
          100% {
            stroke: #4285f4;
          }
        }

        @keyframes colors {
          0% {
            stroke: #4285f4;
          }
          25% {
            stroke: #de3e35;
          }
          50% {
            stroke: #f7c223;
          }
          75% {
            stroke: #1b9a59;
          }
          100% {
            stroke: #4285f4;
          }
        }
        @-webkit-keyframes dash {
          0% {
            stroke-dashoffset: 187;
          }
          50% {
            stroke-dashoffset: 46.75;
            transform: rotate(135deg);
          }
          100% {
            stroke-dashoffset: 187;
            transform: rotate(450deg);
          }
        }
        @keyframes dash {
          0% {
            stroke-dashoffset: 187;
          }
          50% {
            stroke-dashoffset: 46.75;
            transform: rotate(135deg);
          }
          100% {
            stroke-dashoffset: 187;
            transform: rotate(450deg);
          }
        }
      `}</style>

      {/* 5) Your custom script/bundle (runs after interactive) */}
      <Script
        src="/js/main.bundle.js"
        strategy="afterInteractive"
      />
    </Container>
  )
}
