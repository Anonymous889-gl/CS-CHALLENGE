export const runtime = "nodejs";

import { NextRequest } from "next/server";

interface TipResponse {
  tip: string;
}

// Simple static fallback tips if Gemini not configured
const STATIC_TIPS: string[] = [
  "Focus on quantifying your achievements (e.g., ‘increased sales by 15%’).",
  "Keep your LinkedIn profile up to date with your latest projects.",
  "Tailor your resume keywords to match each job description.",
  "Practice explaining complex projects in simple, non-technical language.",
  "Use the STAR method (Situation-Task-Action-Result) for interview answers."
];

export async function POST(req: NextRequest) {
  try {
    const { skills = [] } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    // If Gemini key missing, return random static tip
    if (!apiKey) {
      const tip = STATIC_TIPS[Math.floor(Math.random() * STATIC_TIPS.length)];
      return Response.json({ tip } satisfies TipResponse, { status: 200 });
    }

    // Build prompt based on skills (limit to five skills for brevity)
    const promptSkills = Array.isArray(skills) && skills.length > 0 ? skills.slice(0, 5).join(', ') : 'general job seekers';
    const prompt = `You are a career coach. Provide one concise, actionable career tip (max 25 words) tailored for ${promptSkills}.`;

    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1/models/${process.env.GEMINI_MODEL || 'gemini-1.5-pro'}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 60 }
      })
    });

    if (!geminiRes.ok) {
      console.error('Gemini API error', await geminiRes.text());
      // fallback to static tip
      const tip = STATIC_TIPS[Math.floor(Math.random() * STATIC_TIPS.length)];
      return Response.json({ tip } satisfies TipResponse, { status: 200 });
    }

    const json = await geminiRes.json();
    const tip = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? STATIC_TIPS[0];
    return Response.json({ tip } satisfies TipResponse, { status: 200 });
  } catch (err) {
    console.error('Career tip route error', err);
    const tip = STATIC_TIPS[Math.floor(Math.random() * STATIC_TIPS.length)];
    return Response.json({ tip } satisfies TipResponse, { status: 200 });
  }
}
