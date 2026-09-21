import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase payload limit for high-resolution homework/worksheet photos
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Lazy initializer for Gemini client
let geminiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("Warning: GEMINI_API_KEY environment variable is not set.");
    }
    geminiClient = new GoogleGenAI({
      apiKey: apiKey || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return geminiClient;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", app: "StudyAI", timestamp: new Date().toISOString() });
});

// System instructions tailored for StudyAI
const STUDY_AI_SYSTEM_INSTRUCTION = `You are StudyAI, an expert, patient, and highly engaging personal AI study assistant for students across all school grades and subjects (Mathematics, Physics, Chemistry, Biology, English, Literature, History, Social Studies, Computer Science, and general academics).

CORE PEDAGOGICAL BEHAVIOR:
1. Accuracy & Verification:
   - Carefully verify every calculation, formula, and step before writing.
   - Never invent values, missing diagrams, or obscured numbers.
   - If an uploaded image cannot be read clearly or is too blurry/cropped, respond immediately with:
     "I couldn't clearly read the question. Please upload a clearer image." and specifically mention which part was illegible.
   - If a question lacks critical given numbers or context needed to solve it, state:
     "This question appears to be incomplete. Please provide the missing information." and explain what is needed.

2. Mode-Specific Formatting:
   When the user requests "EASY ANSWER" mode:
   - Deliver the final answer right away at the very top under "**Answer: [Result]**".
   - Keep the entire response short, crisp, and direct.
   - Follow with a minimal 2-4 line direct derivation or brief explanation.
   - Avoid long textbook narrative. Make the final answer visually prominent.

   When the user requests "TEACH ME" mode:
   - Teach the student step-by-step with structured Markdown sections:
     ### What the question asks
     Explain the goal simply in 1-2 friendly sentences.
     ### Given
     Bulleted list of the key facts, variables, or information provided.
     ### Concept / Formula
     Explain the key concept, definition, rule, or mathematical formula.
     ### Step-by-step
     Number each step clearly with logical reasoning and calculations.
     ### Final Answer
     State the final answer clearly in a dedicated, prominent statement.
     ### Remember
     Provide one memorable learning tip, common pitfall to avoid, or mnemonic.

3. Follow-up & Continuous Chat:
   - If the student asks follow-up questions (e.g., "Why?", "Explain step 2", "Can you give another example?", "Make it easier", "Try another method"):
     - Understand the context of the previous question and answer.
     - Provide a direct, encouraging, student-friendly answer specifically targeting what they asked.

4. Math & Equations Notation:
   - Always format mathematical expressions, variables, and formulas using clean LaTeX:
     - Inline math: $x = 5$, $\\frac{a}{b}$, $\\sqrt{x}$
     - Block display math:
       $$2x + 5 = 15$$
       $$2x = 10$$
       $$x = 5$$
   - For chemical equations, use standard notation (e.g., $6\\text{CO}_2 + 6\\text{H}_2\\text{O} \\rightarrow \\text{C}_6\\text{H}_{12}\\text{O}_6 + 6\\text{O}_2$).
   - For code, use Markdown fenced code blocks with the language specified.
`;

// Helper to build system instruction with dynamic tone adaptation and language selection
function getSystemInstruction(tone: string = "balanced", language: string = "english"): string {
  let toneGuideline = "";
  if (tone === "formal") {
    toneGuideline = `
TONE DIRECTIVE [FORMAL]:
- Adopt a scholarly, articulate, and formal academic tone.
- Use refined prose, precise vocabulary suitable for academic study, essays, and literary analysis.
- Provide objective, analytical depth and avoid casual slang, conversational colloquialisms, or emojis.`;
  } else if (tone === "concise") {
    toneGuideline = `
TONE DIRECTIVE [CONCISE]:
- Adopt a laser-focused, concise, and ultra-direct tone.
- Zero conversational filler, greetings, or narrative fluff.
- Deliver steps, calculations, equations, and solutions in crisp, compact form.
- Prioritize rapid comprehension and mathematical efficiency.`;
  } else if (tone === "engaging") {
    toneGuideline = `
TONE DIRECTIVE [ENGAGING]:
- Adopt an energetic, captivating, and engaging storytelling tone.
- Use vivid real-world analogies, historical or scientific intrigue, and relatable examples.
- Foster curiosity with enthusiastic explanations that make the subject matter exciting.`;
  } else {
    toneGuideline = `
TONE DIRECTIVE [BALANCED]:
- Adopt a warm, encouraging, approachable peer-tutor tone that is clear, friendly, and accessible.`;
  }

  let languageGuideline = "";
  if (language === "nepali") {
    languageGuideline = `
CRITICAL LANGUAGE DIRECTIVE [NEPALI / नेपाली भाषा]:
- The user has chosen Nepali language (नेपाली भाषा). You MUST deliver your complete answer, explanations, concepts, and teacher notes in natural, polite, and grammatically correct Nepali using Devanagari script (नेपाली भाषामा व्याख्या र समाधान लेख्नुहोस्).
- Keep mathematical variables, symbols, formulas, and units in standard LaTeX (e.g. $F = ma$, $x^2 + 5x + 6 = 0$, $\\text{m/s}^2$, $\\text{cm}$, $\\text{kg}$) alongside clear Nepali explanations so students studying in Nepal (SEE, NEB, Class 8-12, or University) can follow effortlessly.
- When in "EASY ANSWER" mode:
  - Deliver the main answer prominently at the very top: "**उत्तर: [नतिजा / Result]**"
  - Follow with a concise 2-4 sentence explanation or key calculation in Nepali.
- When in "TEACH ME" mode, structure your response using these exact Nepali Markdown headings:
  ### प्रश्नले के सोधेको छ? (What the question asks)
  ### दिइएका मानहरू (Given)
  ### अवधारणा वा सूत्र (Concept / Formula)
  ### चरणबद्ध समाधान (Step-by-step Solution)
  ### अन्तिम उत्तर (Final Answer)
  ### याद राख्नुपर्ने कुरा (Remember / Study Tip)
- If the question or input is in English or Nepali, always answer in Nepali as requested.`;
  } else {
    languageGuideline = `
LANGUAGE DIRECTIVE [ENGLISH]:
- Provide answers and explanations in clear, high-quality English. (If the student writes in Nepali or asks for Nepali translation, you may naturally assist them in Nepali as well).`;
  }

  return `${STUDY_AI_SYSTEM_INSTRUCTION}\n${toneGuideline}\n${languageGuideline}`;
}
function cleanBase64(dataUrl: string): { base64: string; mimeType: string } {
  if (dataUrl.startsWith("data:")) {
    const matches = dataUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      return { mimeType: matches[1], base64: matches[2] };
    }
  }
  return { mimeType: "image/jpeg", base64: dataUrl };
}

function extractFriendlyErrorMessage(err: any): string {
  if (!err) return "An unexpected error occurred while consulting StudyAI.";
  const rawMsg = typeof err === "string" ? err : err?.message || String(err);

  try {
    if (rawMsg.includes("{")) {
      const start = rawMsg.indexOf("{");
      const end = rawMsg.lastIndexOf("}");
      if (start !== -1 && end > start) {
        const parsed = JSON.parse(rawMsg.slice(start, end + 1));
        let candidate = parsed?.error?.message || parsed?.message;
        if (typeof candidate === "string") {
          if (candidate.includes("{")) {
            try {
              const inner = JSON.parse(candidate);
              candidate = inner?.error?.message || inner?.message || candidate;
            } catch {}
          }
          return candidate;
        }
      }
    }
  } catch {}

  if (rawMsg.includes("503") || rawMsg.includes("high demand") || rawMsg.includes("UNAVAILABLE")) {
    return "This AI model is currently experiencing high demand. Please try again in a few moments.";
  }
  if (rawMsg.includes("429") || rawMsg.includes("RESOURCE_EXHAUSTED")) {
    return "Rate limit reached. Please wait a few seconds and try again.";
  }

  return rawMsg;
}

const CANDIDATE_MODELS = [
  "gemini-3.8-flash",
  "gemini-3.1-flash-lite",
  "gemini-flash-latest",
];

// POST /api/chat/stream - SSE streaming for responsive generation
app.post("/api/chat/stream", async (req, res) => {
  try {
    const {
      history = [],
      mode = "easy",
      question = "",
      image = null,
      tone = "balanced",
      language = "english",
    } = req.body;

    if (!question && !image && (!history || history.length === 0)) {
      res.status(400).json({ error: "Please type a question or attach an image." });
      return;
    }

    const ai = getGemini();

    // Prepare contents array for Gemini
    const contents: any[] = [];

    // Add prior conversation turns
    for (const msg of history) {
      const role = msg.role === "user" ? "user" : "model";
      const parts: any[] = [];

      if (msg.image && msg.role === "user") {
        const { base64, mimeType } = cleanBase64(msg.image);
        parts.push({
          inlineData: {
            mimeType: mimeType || "image/jpeg",
            data: base64,
          },
        });
      }

      if (msg.content) {
        parts.push({ text: msg.content });
      }

      if (parts.length > 0) {
        contents.push({ role, parts });
      }
    }

    // Prepare current turn parts
    const currentParts: any[] = [];
    if (image) {
      const { base64, mimeType } = cleanBase64(image);
      currentParts.push({
        inlineData: {
          mimeType: mimeType || "image/jpeg",
          data: base64,
        },
      });
    }

    let promptDirective = question;
    const isNepali = language === "nepali";

    if (mode === "easy") {
      if (isNepali) {
        promptDirective = `${question ? `प्रश्न (Question): ${question}\n\n` : ""}कृपया [EASY ANSWER MODE] मा उत्तर दिनुहोस्। मुख्य उत्तरलाई माथि '**उत्तर: [नतिजा]**' लेखी त्यसपछि छोटो २-३ वाक्यमा नेपालीमा स्पष्ट पार्नुहोस्।`;
      } else {
        promptDirective = `${question ? `Question: ${question}\n\n` : ""}Please answer in [EASY ANSWER MODE]. Give the answer first, keep it short and direct, with a brief derivation if helpful, and make the final answer stand out.`;
      }
    } else if (mode === "teach") {
      if (isNepali) {
        promptDirective = `${question ? `प्रश्न (Question): ${question}\n\n` : ""}कृपया [TEACH ME MODE] मा सम्पूर्ण व्याख्या, सूत्र र चरणहरू नेपाली भाषामा सिकाउनुहोस्। यी शीर्षकहरू अनिवार्य प्रयोग गर्नुहोस्:
### प्रश्नले के सोधेको छ? (What the question asks)
### दिइएका मानहरू (Given)
### अवधारणा वा सूत्र (Concept / Formula)
### चरणबद्ध समाधान (Step-by-step Solution)
### अन्तिम उत्तर (Final Answer)
### याद राख्नुपर्ने कुरा (Remember / Study Tip)`;
      } else {
        promptDirective = `${question ? `Question: ${question}\n\n` : ""}Please answer in [TEACH ME MODE]. Walk me through step-by-step using the requested sections: What the question asks, Given, Concept / Formula, Step-by-step, Final Answer, and Remember.`;
      }
    } else if (isNepali) {
      promptDirective = `${question ? `प्रश्न / जिज्ञासा: ${question}\n\n` : ""}कृपया नेपाली भाषामा विद्यार्थीमैत्री, स्पष्ट र विस्तृत रूपमा सम्झाउनुहोस्।`;
    }

    currentParts.push({ text: promptDirective });
    contents.push({ role: "user", parts: currentParts });

    // Set headers for Server-Sent Events
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const systemInstruction = getSystemInstruction(tone, language);
    let hasSentChunk = false;
    let successfulModel = "";
    let lastError: any = null;

    // Helper sleep
    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    // Try candidate models with automatic retry and fallback on 503 / 429
    for (const modelName of CANDIDATE_MODELS) {
      let modelSucceeded = false;

      // Try up to 2 attempts for this model if experiencing temporary 503 / 429 demand spikes
      for (let attempt = 0; attempt < 2; attempt++) {
        if (attempt > 0) {
          await sleep(600 * attempt);
        }

        try {
          const responseStream = await ai.models.generateContentStream({
            model: modelName,
            contents,
            config: {
              systemInstruction,
              temperature: 0.2,
            },
          });

          for await (const chunk of responseStream) {
            const chunkText = chunk.text || "";
            if (chunkText) {
              if (!hasSentChunk) {
                hasSentChunk = true;
              }
              res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
            }
          }

          modelSucceeded = true;
          successfulModel = modelName;
          break; // Successfully finished stream for this model
        } catch (err: any) {
          lastError = err;
          const errMsg = String(err?.message || err);
          const isDemandSpike =
            err?.status === 503 ||
            err?.code === 503 ||
            errMsg.includes("503") ||
            errMsg.includes("UNAVAILABLE") ||
            errMsg.includes("high demand") ||
            errMsg.includes("429") ||
            errMsg.includes("RESOURCE_EXHAUSTED");

          console.warn(`Model ${modelName} (attempt ${attempt + 1}) encountered issue:`, errMsg);

          // If text was already streamed to the client, cannot silently switch models
          if (hasSentChunk) {
            throw err;
          }

          if (isDemandSpike && attempt < 1) {
            continue; // retry this model after brief delay
          }

          // Otherwise move to next candidate model
          break;
        }
      }

      if (modelSucceeded) {
        break; // Successfully handled by model
      }
    }

    if (!successfulModel && !hasSentChunk) {
      throw lastError || new Error("All AI study models are currently experiencing high demand. Please try again in a moment.");
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err: any) {
    console.error("Gemini API Error in /api/chat/stream:", err);
    const friendlyMessage = extractFriendlyErrorMessage(err);
    if (!res.headersSent) {
      res.status(500).json({ error: friendlyMessage });
    } else {
      res.write(`data: ${JSON.stringify({ error: friendlyMessage })}\n\n`);
      res.end();
    }
  }
});

// Start server and mount Vite
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`StudyAI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
