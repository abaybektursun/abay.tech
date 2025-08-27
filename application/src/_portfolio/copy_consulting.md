---
title: "Lessons From a Consulting Call: Mastering AI for Persuasive Copy"
excerpt: "In a recent consulting session, a client needed to generate 10–12-page Video Sales Letter (VSL) scripts with AI. These scripts can be notoriously difficult to handle—lengthy, high-stakes, and packed with emotion-driven persuasion. Below, you’ll find the most critical lessons we uncovered, refined with a more technical focus."
date: "2025-01-17"
image: "/images/Writing_img.webp"
---

### **1. Context Is Key: Keep It Relevant—and Positive**

One major insight from our session is that **context conditions** the model’s direction. Think of each user or system message as nudging the model through a high-dimensional **mathematical embedding space**, where each new token is a “step” shaped by prior input. 

- **Why It Matters**  
  If irrelevant or contradictory messages accumulate in the conversation, you can push the AI down the wrong “path” in this embedding space. Cleaning up those missteps later is difficult because the model carries that context forward.

- **Practical Tip**  
  - **In ChatGPT or Claude**: Use the “edit” feature on earlier messages to remove mistakes or irrelevant details. This effectively rewrites the conversation’s history, ensuring each new step in the embedding space follows a better trajectory.  
  - **In an API Workflow**: Start fresh calls whenever the model drifts. Feed only successful instructions or relevant data into the new prompt. The goal is to **preserve a positive momentum** by including **only** the best previous messages and discarding errors.

---

### **2. Divide and Conquer with a Master Plan**

Instead of generating the entire VSL in one shot, **use a “divide and conquer” approach**. The key is to have the LLM itself generate a **master plan** outlining sections or tasks, which you can then pass on to downstream LLM calls.

1. **Ask the LLM for a Master Outline**  
   - The model proposes how best to break your VSL (or any large text) into sections like Intro, Pain Points, Objections, Proof, Close, etc.

2. **Assign Tasks to “Downstream” LLM Calls**  
   - In separate prompts or new chats, provide only the relevant portion of the master outline and the existing partial copy. This localizes the context, letting the downstream AI focus on writing or refining that specific section.

3. **Consolidate and Review**  
   - Once each section is done, stitch them together to form the final document. If a section is still off-track, you can edit its context and re-run it without polluting everything else.

---

### **3. The LLM’s Walk in Embedding Space—Why Direction Matters**

Behind the scenes, each token is a vector in a massive embedding space. The model “walks” from one vector to the nexgeneratinged by the **probability distribution** of what it thinks should come next. This walk is sensitive to:

1. **The Immediate Prompt**: The final user message exerts a strong pull on the model’s next token choice.  
2. **The Conversation’s History**: Earlier prompts push or pull the “walk” in subtle ways, especially if they introduced confusion or contradictory instructions.  
3. **System or Hidden Instructions**: The model always has some guardrails, but your explicit system prompts can override or refine these.

**Key Point**  
- **Once the model’s trajectory veers off**, it often doubles down on that path. By trimming out irrelevant or damaging instructions (i.e., editing prior messages), you effectively tilt the walk back in the right direction.

---

### **4. Match the Model to the Task**

During our call, we found that **O1 Pro** excels at persuasive writing—every, it generates more nuanced language and emotional resonance. For less critical work, **Claude** may suffice. 

---

### **5. Keep It Simple Unless You Truly Need More**

We briefly touched on “agentic” systems—where an AI autonomously chooses tools, breaks down tasks, and iterates until it hits a goal. While powerful, these systems can be **overkill** for standard marketing copy.

- **Most VSLs Only Need**  
  - **Master Plan**: Outline from the LLM.  
  - **Downstream Tasks**: Individual calls for each section, focusing on clarity and persuasion.  
  - **Context Edits**: Pruning or refreshing the conversation if it drifts.  

---

### **Final Thoughts**

This consulting call highlighted how **context** steers the AI’s path in embedding space—and how crucial it is to keep that path clear and focused. By having the LLM devise a master plan, delegating sections to downstream calls, and editing out any misfires, you ensure each “step” in the model’s walk remains aligned with your end goal.

If you’re confronting similarly hefty marketing content, consider applying one or two of these strategies. You might be surprised by how quickly you can harness the mathematical underpinnings of LLMs to produce persuasive, polished copy—**without** sacrificing time or clarity.