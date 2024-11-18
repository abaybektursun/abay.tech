---
title: "State-of-the-Art Financial Chart Extraction"
excerpt: "Building an AI system that automates financial chart and table extraction, saving analysts countless hours of manual work"
date: "2023-05-05"
image: "/charts_tables.jpg"
---
Starting this project I had no idea I'd end up building a large scale end-to-end AI model that could look at variety of financial charts or tables and reconstruct it, achieving state-of-the-art performance across multiple benchmarks. What began as a request for a simple stacked bar chart bounding box detection transformed into bleeding-edge approach that changed how my client approached visual data extraction - from handling one specific chart type to automatically understanding wide range of financial charts they encountered.

## Starting Small, Thinking Big

When the client approached me, they wanted a traditional object detection pipeline to extract data from stacked bar charts. Since the client’s goal was to create a solution that would save financial analyst's time of turning images into editable presentation elements I warned them about the limitations: this approach wouldn't generalize well across different chart types or even styles and font and wouldn't be robust to real-world variations. But we agreed to start there to get something working quickly.

## When Traditional Approaches Hit Their Limits

After I delivered the requested solution, as predicted, the pipeline approach - separate models for detection, OCR, and classification - showed its limitations almost immediately. While it worked for simple, clean stacked bar charts of specific design, it struggled with:

- Different chart types (line charts, pie plots, etc)
- Different formatting, styles, and colors patterns.
- Overlapping elements and other visual elements that could be in the chart.

## Research-Driven Approach

My experience with multi-modal transformers suggested a different path forward. After conducting [extensive research](https://github.com/Gridlines/chart2table/issues/20) on recent advances in vision-language models, I became convinced that a unified model using cross-attention mechanisms could handle this task more elegantly than traditional pipelines.

This wasn't just theoretical - benchmarks in most AI fields were showing this method’s dominance. By treating charts and tables as a structured visual language that could be "decoded" into data, we could leverage recent breakthroughs in transformer architectures. The approach proved more powerful than we expected - our model even achieved better OCR accuracy than specialized systems, despite that being a secondary task.

## The Data Generation Challenge

Once we settled on our cross-attention transformer approach, we faced a new challenge: training data. This became our biggest time investment. You might be surprised to learn that we spent more time generating training data than building the actual model.

We assembled a dedicated team to build chart and table synthesis. Libraries ranges from Python’s Plotly to custom HTML tables.

Each library had its quirks and strengths. We needed all of them to create the diversity of styles, formats, and edge cases our model would encounter in the real world. As a team we spent months building this pipeline, ensuring we could generate millions of unique, realistic examples in a click of a button.

## Scaling Up Systematically

We took a methodical approach to scaling:

1. Started with a focused model for stacked bar charts
2. Gradually expanded to other chart types and tables
3. Extracted not only underlying data but also the visual information
4. Finally unified everything into a single model that was trained in distributed fashion on dozens of GPUs.

In AI we call increasing level of difficulty of training a curriculum learning. And it was a curriculum not only for the AI, each step taught us something valuable about model architecture and training dynamics. By the end, we had a system that could handle any type of financial chart / table thrown at it. 

## Looking Back

What started as a specific solution for stacked bar charts evolved into something much more powerful: a system that can understand and extract data from wide range of financial documents. By leveraging recent advances in multi-modal transformers, we built something that was both more elegant and more capable than traditional approaches.

The most important lesson? While model architecture is crucial, data quality and quantity make the difference between a demo and a production system. Without our sophisticated data generation pipeline, even the best transformer architecture would have failed on real-world charts.

---

*Want to discuss your AI challenges? Let's talk.*