---
theme: none
title: Abay Bektursun
drawings:
  persist: false
transition: fade
hideInToc: true
---

<style>
.slidev-layout {
  background: #171717 !important;
}
.slidev-page {
  background: #171717 !important;
}
</style>

<div class="h-full w-full p-8 flex flex-col font-sans">

<header class="mb-4">
  <span class="text-sm tracking-wide text-neutral-400">Abay Bektursun</span>
  <span class="text-sm text-neutral-500 ml-2">/ AI Engineer / Fractional CTO</span>
</header>

<main class="flex-1 grid grid-cols-2 gap-x-12 gap-y-3 text-xs text-neutral-400 items-start content-center">

<v-click>
<div>
  <div class="font-semibold text-sm text-white">HPE <span class="font-normal text-neutral-400">— ML Engineer</span></div>
  <ul class="mt-1 ml-4 list-disc"><li>Automated entire department</li><li>Saved company $2M</li></ul>
</div>
</v-click>

<v-click>
<div>
  <div class="font-semibold text-sm text-white">Apple <span class="font-normal text-neutral-400">— CV Engineer</span></div>
  <ul class="mt-1 ml-4 list-disc"><li>Mastered industry-leading engineering standards</li><li>Launched CV project → multi-million dollar budget, deployed globally</li></ul>
</div>
</v-click>

<v-click>
<div>
  <div class="font-semibold text-sm text-white">Eagle Eye Networks <span class="font-normal text-neutral-400">— CV Engineer</span></div>
  <ul class="mt-1 ml-4 list-disc"><li>Built edge computing surveillance CV</li><li>Pioneered SOTA computer vision for surveillance</li></ul>
</div>
</v-click>

<v-click>
<div>
  <div class="font-semibold text-sm text-white">Cambridge <span class="font-normal text-neutral-400">— AI Consultant</span></div>
  <ul class="mt-1 ml-4 list-disc"><li>Built SOTA on-device multimodal vision models</li><li>Extract vitals from selfie camera</li></ul>
</div>
</v-click>

<v-click>
<div>
  <div class="font-semibold text-sm text-white">Columbia <span class="font-normal text-neutral-400">— AI Consultant</span></div>
  <ul class="mt-1 ml-4 list-disc"><li>Optimized large-scale stock prediction models</li><li>Low-level GPU optimization for scientific computing</li></ul>
</div>
</v-click>

<v-click>
<div>
  <div class="font-semibold text-sm text-white"><a href="https://gridlines.app" target="_blank" class="hover:underline">Gridlines</a> <span class="font-normal text-neutral-400">— Fractional CTO</span></div>
  <ul class="mt-1 ml-4 list-disc"><li>Grew startup from prototype to production</li><li>Designed and trained large-scale SOTA multimodal document AI</li></ul>
</div>
</v-click>

<v-click>
<div>
  <div class="font-semibold text-sm text-white"><a href="https://copycopter.ai" target="_blank" class="hover:underline">Copycopter.ai</a> <span class="font-normal text-neutral-400">— AI Consultant</span></div>
  <ul class="mt-1 ml-4 list-disc"><li>Built entire infrastructure and cloud</li><li>Developed AI video generation</li></ul>
</div>
</v-click>

<v-click>
<div>
  <div class="font-semibold text-sm text-white"><a href="https://www.thrivepal.com" target="_blank" class="hover:underline">ThrivePal</a> <span class="font-normal text-neutral-400">— AI Consultant</span></div>
  <ul class="mt-1 ml-4 list-disc"><li>Merged self-development expertise with AI</li><li>Built mental health AI assistant (OpenAI-backed)</li></ul>
</div>
</v-click>

<v-click>
<div>
  <div class="font-semibold text-sm text-white"><a href="https://cropwatch.ai" target="_blank" class="hover:underline">CropWatch</a> <span class="font-normal text-neutral-400">— AI Consultant</span></div>
  <ul class="mt-1 ml-4 list-disc"><li>Deployed affordable CV surveillance for Japanese government</li></ul>
</div>
</v-click>

<v-click>
<div>
  <div class="font-semibold text-sm text-white"><a href="https://www.linkedin.com/posts/azer-karimov_im-deeply-honored-to-step-into-the-role-activity-7384232312877514752-oJcN" target="_blank" class="hover:underline">Elara</a> <span class="font-normal text-neutral-400">— Co-founder</span></div>
  <ul class="mt-1 ml-4 list-disc"><li>First startup → acquired by Wealthdoor</li><li>Full-stack founder: engineering, marketing, hiring, leadership</li></ul>
</div>
</v-click>

</main>

</div>

---

<div class="h-full w-full p-8 flex flex-col font-sans">

<header class="mb-6">
  <span class="text-sm tracking-wide text-neutral-400">Truths & Givens</span>
  <span class="text-sm text-neutral-500 ml-2">/ AI & Engineering</span>
</header>

<main class="flex-1 flex flex-col justify-center text-neutral-400 text-sm">

<v-click>
<div class="mb-8">
  <div class="font-semibold text-lg text-white mb-3">LLM context must be small</div>
  <ul class="ml-4 list-disc space-y-2">
    <li>Transformer compute scales quadratically with context length</li>
    <li>Flash attention gave us 2-4x gains, but that was low-hanging fruit — we're now approaching hardware limits</li>
    <li>Early implementations were hacky; we're only now doing proper hardware alignment</li>
    <li>Training data bottleneck: hard to generate tasks where AI meaningfully tracks long-range attention</li>
    <li>Most benchmarks are needle-in-haystack — if the haystack is all needles, transformers lose intelligence</li>
  </ul>
</div>
</v-click>

<v-click>
<div class="mb-8">
  <div class="font-semibold text-lg text-white mb-3">LLMs have not achieved agency</div>
  <ul class="ml-4 list-disc space-y-2">
    <li>Still a dataset limitation — LLMs are massive pattern-matching machines that generalize across abstraction levels</li>
    <li>More data improves abstractions, but it's still small-context, limited pattern matching</li>
    <li>All signals — talks, results, startups, stock market — indicate AI is not autonomous yet</li>
    <li>No true common sense; Salesforce publicly disappointed with AI agent output</li>
    <li>Research shows AI reduces productivity in well-established fields and production codebases</li>
  </ul>
</div>
</v-click>

</main>

</div>

---

<div class="h-full w-full p-8 flex flex-col font-sans">

<header class="mb-6">
  <span class="text-sm tracking-wide text-neutral-400">Implications & Design Choices</span>
</header>

<main class="flex-1 flex flex-col justify-center text-neutral-400 text-sm">

<v-click>
<div class="mb-8">
  <div class="font-semibold text-lg text-white mb-3">Minimize agent context</div>
  <ul class="ml-4 list-disc space-y-2">
    <li>Give agents only the most essential, highest-leverage data for the task</li>
    <li>Creating high-leverage data requires good intentional design</li>
    <li>High-leverage code = solid, small, compact, well-indexed, intentionally designed codebases (first-order)</li>
    <li>Second-order generated code is heavily conditioned by first-order code</li>
  </ul>
</div>
</v-click>

<v-click>
<div class="mb-8">
  <div class="font-semibold text-lg text-white mb-3">Build around the bridge developer</div>
  <ul class="ml-4 list-disc space-y-2">
    <li>Agents get some autonomy, but actual work is guided by the bridge developer</li>
    <li>Need good tools for the bridge developer to solve problems</li>
    <li>Given the truths above, we must build around human guidance</li>
    <li>Allows flexibility for different developers' styles and strengths</li>
  </ul>
</div>
</v-click>

</main>

</div>
