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
        <title>My Next.js Page</title>
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
      <main style={{ padding: '20px' }}>
        <p>
          <strong>If you are just interested in the data analysis, skip to the end of the article.</strong>
        </p>
        <p>
          Summer, 2022. I quit my lucrative AI job not out of dissatisfaction,
          but out of exhilaration. My past couple of years were brimming with
          happiness, which sparked an awakening within me: if I did not leap
          into the unknown, doing so might eventually become difficult or even
          impossible. Within two hours of this epiphany, I sent my company
          2-week notice.
        </p>
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
        <h2>Space of Startup Ideas</h2>
        <p>
          Job posts, are typically rich in textual data detailing candidate
          preferences, company profiles, and problem statements, etc. Doing
          analytics with text has not been very practical, but with the advent
          of powerful GPTs, we can now extract substantial structured data.
        </p>
        <p>
          I started gathering posts in real time and amassed over 100k job posts
          in few weeks. It took 2 days to prompt engineer something that could
          extract the customer pain points accurately. Prompt shown below (few
          shot examples excluded):
        </p>

        {/* Accordion item markup (WordPress style). Just keep as simple HTML */}
        <div
          className="c-accordion__item"
          data-initially-open="false"
          data-click-to-close="true"
          data-auto-close="true"
          data-scroll="false"
          data-scroll-offset="0"
          style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '10px' }}
        >
          <button
            style={{
              fontWeight: 'bold',
              display: 'block',
              cursor: 'pointer',
              marginBottom: '10px',
            }}
          >
            Click here to expand
          </button>
          <div>
            <pre
              style={{
                fontSize: '10px',
                backgroundColor: '#f4f4f4',
                padding: '10px',
                overflowX: 'auto',
              }}
            >
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
        </div>

        <p>
          <a href="https://openai.com/blog/function-calling-and-other-api-updates">
            OpenAI&apos;s API updates
          </a>{' '}
          came in perfectly, I was able to use their 16k context model to sample
          large chunks of the cleint problems and start creating taxonomies:
        </p>

        <div
          className="c-accordion__item"
          data-initially-open="false"
          data-click-to-close="true"
          data-auto-close="true"
          data-scroll="false"
          data-scroll-offset="0"
          style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '10px' }}
        >
          <button
            style={{
              fontWeight: 'bold',
              display: 'block',
              cursor: 'pointer',
              marginBottom: '10px',
            }}
          >
            Click here to expand
          </button>
          <div>
            <pre
              style={{
                fontSize: '10px',
                backgroundColor: '#f4f4f4',
                padding: '10px',
                overflowX: 'auto',
              }}
            >
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
        </div>

        <p>
          After sampling the majority of the dataset, I further distilled it and
          requested GPT-4 to provide the final categories. Now, we can utilize
          these to visualize the categories of problems in relation to volume,
          investment, and customer budget, as shown below. The size of the
          bubble corresponds to the count of job postings. The X-axis represents
          how much the client is willing to pay per hour on average, and the
          Y-axis represents how much the client spent on Upwork on average. This
          chart only contains a portion of the full data due to missing values
          and some filtering. You can approximately see how much people are
          willing to pay to solve problems in each category.
        </p>

        {/* Spinner styles + bubble chart container */}
        <div style={{ minWidth: '1000px', width: 'auto', overflow: 'auto' }}>
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
          <canvas id="bubbleChart"></canvas>
        </div>

        <div style={{ minWidth: '1000px', width: 'auto', overflow: 'auto' }}>
          <p>
            Next, I created vector embeddings of all the problems and reduced
            their dimensions using UMAP. The result is shown below. You can
            explore the semantic space of problems. Hover over the points to
            read the text:
          </p>
        </div>

        <div style={{ minWidth: '1000px', width: 'auto', overflow: 'auto' }}>
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
          <div id="embedPlot"></div>
        </div>

        <div style={{ minWidth: '1000px', width: 'auto', overflow: 'auto' }}>
          <p>
            This market analysis helped me pinpoint the ideal sector for
            building initial startup startup: financial technology.
          </p>
        </div>

        <div id="classificationChart"></div>
      </main>

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

      {/* 5) Custom JavaScript for interactive charts would go here */}
      {/* Note: main.bundle.js was removed as it doesn't exist and was causing JSON parse errors */}
    </Container>
  )
}
