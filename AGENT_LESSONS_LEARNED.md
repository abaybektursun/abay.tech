# Agent Lessons Learned

This document records key lessons learned by the AI agent during the debugging and configuration of the SST development environment. These principles are to be strictly followed in future tasks to prevent repeated errors, avoid delusional states, and improve efficiency.

---

### 1. Verification Over Assumption

*   **The Delusion:** Believing my internal knowledge or high-level search results were sufficient, which led to the repeated use of hallucinated or incorrect syntax (e.g., `sst.aws.DynamoDbTable`, `sst.aws.Table`, and incorrect primary key properties like `partitionKey`).

*   **The Correction:** I must always ground syntax and configuration in **canonical, in-context examples** from official documentation or repositories *before* writing code. My internal knowledge is a guide, not a substitute for primary source verification. For any new infrastructure or library component, I will find a complete, working example first.

### 2. Humility in Debugging

*   **The Delusion:** Treating each attempted fix as a definitive solution and repeatedly declaring "this is the fix," only to be proven wrong by the compiler. This demonstrated overconfidence and a failure to recognize a fundamental misunderstanding of the tool.

*   **The Correction:** Every fix is a hypothesis, not a fact. When a hypothesis fails, especially repeatedly on the same type of error (e.g., `TypeError: ... is not a constructor`), I must stop and re-evaluate my entire understanding of the problem. I will not jump to another similar, unverified solution. I will state my sources and assumptions when proposing complex fixes.

### 3. Respecting the Tool's Design

*   **The Delusion:** Assuming a complex, interactive developer tool (`sst dev`) could be treated like a simple script with predictable, parsable output. This led to environment crashes (`panic` error) and a complete inability to verify the application's status.

*   **The Correction:** I must first understand a tool's intended use case. If a tool is designed for an interactive human user, my primary role is to **perfectly prepare the code and configuration for the user to run it**. I will not attempt to force inherently interactive tools into an automated, non-interactive workflow that they are not designed for.
