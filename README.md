# Data Guardian

DataGuardian is a simple but strict system that helps people make safer decisions using data.

In many companies, people take decisions just by looking at numbers or dashboards.
But sometimes the data is old, too small, biased, or the wrong metric is used.
This leads to wrong decisions with full confidence.

DataGuardian tries to stop this problem.

# why I built this project

Most data tools focus on:
-showing charts
-showing KPIs
-making dashboards look good

But very few tools ask an important question first:

“Is this data actually safe to use for this decision?”

I built DataGuardian to:

-stop decisions made on bad or misleading data
-force people to think before trusting numbers
-keep a clear record of what decision was made and why
-This project is about decision discipline, not visualization.

# What DataGuardian does 

Before any metric is used for a decision, DataGuardian checks:

-   Is the data fresh or too old?
-   Is there enough data to trust this result?
-   Is one customer or segment dominating the result?
-   Is the metric correct for this type of decision?
-   Is this a vanity metric that looks good but hides real problems?

After checking, the system gives one clear result:

-   ALLOW → Data is safe to use
-   WARN → Data is risky, be careful
-   BLOCK → Data is unsafe, decision should not be made
-   Warning and Override (important part)

If a decision is marked WARN:

-   The user can continue only by overriding
-   A reason must be written (cannot skip)
-   Confidence score is reduced
-   The override is saved permanently in audit logs

If a decision is BLOCK:

-   It cannot be overridden
-   The system stops the decision completely
-   This ensures that risky decisions are never silent.

# Confidence score

DataGuardian shows a confidence score for every decision.

# This score means:

“How much can we trust this data for this decision?”

It is not a prediction.
It is only a trust level, based on rule checks.

Confidence can only go down, never up.

Audit and Decision History

Every decision creates a permanent audit record.

The audit log stores:

Input details (time range, sample size, data freshness)

Which rules passed or failed

Original decision status and confidence

Final status after override (if used)

Override reason (if any)

Outcome (Positive / Neutral / Negative / Unknown)

This creates full traceability:

Data → Rules → Decision → Override → Outcome

Nothing is hidden or deleted.

# What this project is NOT

-Not a dashboard tool
-Not an AI decision maker
-Not a prediction system
-Not focused on UI or visuals

# This project focuses only on correct decisions and accountability.

Tech stack

-   Vite
-   TypeScript
-   React
-   shadcn-ui
-   Tailwind CSS
-   Rule-based logic (no machine learning)
-   Deployed using Vercel.

# Live demo

===========link here===========

# Project status

Core logic is complete:

Decision guard rules

Override with justification

Confidence penalty

Full audit lineage

Future improvements can add database storage or authentication,
but the decision logic itself is complete.
