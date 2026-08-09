// LEGACY Cloudflare Pages Function for /api/chat.
// NOTE: The production deployment routes /api/chat through worker/index.js
// (wrangler.toml: main = "worker/index.js"). This Pages function is retained
// only so any accidental Pages deploy behaves IDENTICALLY: same knowledge-first
// architecture, same matching rules, same fallback hierarchy.

interface Env {
  ASSETS?: {
    fetch(request: Request): Promise<Response>;
  };
  GEMINI_API_KEY?: string;
  OPENAI_API_KEY?: string;
}

const UNKNOWN_REPLY =
  "I don't have enough public information in this portfolio to answer that. " +
  "You can explore the Projects or Services pages, or contact Adeel directly " +
  "via the Start a Project form or LinkedIn.";

const SERVER_ERROR_REPLY =
  "Sorry, I'm temporarily unavailable. Please try again or contact Adeel directly.";

// Mirrors frontend/public/personal-knowledge.json (the Worker embeds the same copy).
const EMBEDDED_KNOWLEDGE: any = {
  profile: {
    name: "Adeel Sattar",
    role: ".NET Developer & Full-Stack Engineer",
    focus: "Building decoupled enterprise-grade backends, reactive Angular client interfaces, and workflow automations.",
    bio: "Adeel Sattar is a .NET Developer and Full-Stack Engineer focused on building high-performance software, AI-powered solutions, and business-driven digital platforms."
  },
  skills: [".NET 10", "ASP.NET Core", "Angular 20", "TypeScript", "Tailwind CSS", "Entity Framework Core", "PostgreSQL", "Docker", "GitHub Actions", "AI Integrations"],
  projects: [
    {
      title: "SocialMediaAgent",
      category: "AI & Automation",
      description: "An AI-powered social media automation platform designed for multi-channel publishing.",
      techs: [".NET 10", "Angular 20", "OpenAI API", "Entity Framework", "PostgreSQL", "Docker"]
    },
    {
      title: "CoreERP Integration Engine",
      category: "Enterprise Applications",
      description: "High-throughput enterprise pipeline synchronization API syncing inventory, processing invoices, and dispatching logistics data to Oracle ERP.",
      techs: [".NET 10", "ASP.NET Core", "SQL Server", "RabbitMQ"]
    },
    {
      title: "GrowthHub Performance CRM",
      category: "Web Platforms & Marketing",
      description: "Conversion-optimized CRM web portal integrating client tracking, automated email workflows, and Meta Ads attribution metrics.",
      techs: ["Angular 20", "Signals", "TypeScript", "Tailwind CSS"]
    }
  ],
  services: ["Custom Software Development", "Web Applications & APIs", "Business Automation & AI", "WordPress Solutions", "Meta Ads & Growth Systems"],
  contact: {
    email: "adeelsattar.dev@gmail.com",
    linkedin: "https://pk.linkedin.com/in/adeelsattar-dotnet-angular-developer",
    github: "https://github.com/createxdigital65",
    whatsapp: "https://wa.me/923176468708",
    instagram: "https://instagram.com/adeelsattar.dev"
  },
  faq: [
    { q: "Who is Adeel?", a: "Adeel Sattar is a .NET Developer and Full-Stack Engineer who builds enterprise backends and modern Angular frontends." },
    { q: "What technologies does Adeel use?", a: "He works with .NET 10, ASP.NET Core, Angular 20, TypeScript, Tailwind CSS, and common database and DevOps tooling like PostgreSQL and Docker." },
    { q: "What services does Adeel offer?", a: "Custom software development, web applications & APIs, AI integrations, WordPress solutions, and growth systems." },
    { q: "How can I contact Adeel?", a: "You can email adeelsattar.dev@gmail.com, message on LinkedIn or WhatsApp, or submit the Start a Project form on this site." }
  ]
};
function jsonResponse(obj: any, status: number): Response {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}

async function loadKnowledge(request: Request, env: Env): Promise<any> {
  const assets = env && env.ASSETS && typeof env.ASSETS.fetch === "function" ? env.ASSETS : null;
  if (assets) {
    try {
      const url = new URL("/personal-knowledge.json", request.url).toString();
      const res = await assets.fetch(new Request(url));
      if (res && res.ok) {
        const json = await res.json();
        if (json && typeof json === "object") return json;
      }
    } catch (err) {
      console.error("loadKnowledge asset error", err);
    }
  }
  try {
    const url = new URL("/personal-knowledge.json", request.url).toString();
    const res = await fetch(url);
    if (res && res.ok) {
      const json = await res.json();
      if (json && typeof json === "object") return json;
    }
  } catch (err) {
    console.error("loadKnowledge fetch error", err);
  }
  return EMBEDDED_KNOWLEDGE;
}

function sanitizeKnowledge(k: any): any {
  if (!k || typeof k !== "object") return EMBEDDED_KNOWLEDGE;
  return {
    profile: k.profile && typeof k.profile === "object" ? k.profile : EMBEDDED_KNOWLEDGE.profile,
    skills: Array.isArray(k.skills) ? k.skills : EMBEDDED_KNOWLEDGE.skills,
    projects: Array.isArray(k.projects) ? k.projects : EMBEDDED_KNOWLEDGE.projects,
    services: Array.isArray(k.services) ? k.services : EMBEDDED_KNOWLEDGE.services,
    contact: k.contact && typeof k.contact === "object" ? k.contact : EMBEDDED_KNOWLEDGE.contact,
    faq: Array.isArray(k.faq) ? k.faq : EMBEDDED_KNOWLEDGE.faq
  };
}
// Identical priority/order to worker/index.js answerFromKnowledge().
function answerFromKnowledge(knowledge: any, message: string): string | null {
  if (!knowledge) return null;
  const normalize = (s: any): string => {
    if (!s) return "";
    return String(s).toLowerCase()
      .replace(/[\u2018\u2019']/g, "")
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  };
  const q = normalize(message);
  if (!q) return null;
  const matchesAny = (arr: string[]): boolean =>
    arr.some((k) => {
      const nk = normalize(k);
      return nk !== "" && q.indexOf(nk) !== -1;
    });

  const profile = knowledge.profile || {};
  const skills: string[] = Array.isArray(knowledge.skills) ? knowledge.skills : [];
  const projects: any[] = Array.isArray(knowledge.projects) ? knowledge.projects : [];
  const services: string[] = Array.isArray(knowledge.services) ? knowledge.services : [];
  const contact = knowledge.contact || {};

  const asksAboutUse =
    /(^|\b)(does|uses|use|work with|works with|stack|technolog|languages|skills|frameworks|tools|experience|familiar)(\b|$)/.test(q) &&
    !/projects?\b|portfolio|built|showcase/.test(q);
  const askedSkill = asksAboutUse
    ? skills.find((s: string) => normalize(s).split(/\s+/).some((t: string) => t.length >= 2 && q.indexOf(t) !== -1))
    : undefined;
  if (askedSkill) return `Yes, Adeel works with ${askedSkill}. His full stack includes: ${skills.join(", ")}.`;
  if (/^does\b/.test(q)) return null;

  const faqAnswer = matchFaq(knowledge.faq, q, normalize);
  if (faqAnswer) return faqAnswer;

  for (const p of projects) {
    const titleKey = normalize(p.title || "");
    if (titleKey && (q.indexOf(titleKey) !== -1 || titleKey.indexOf(q) !== -1)) {
      const techs = Array.isArray(p.techs) && p.techs.length ? p.techs.join(", ") : "N/A";
      return `${p.title}: ${p.description || ""} (Category: ${p.category || "N/A"}). Built with: ${techs}.`;
    }
  }

  if (matchesAny(["tech stack", "technolog", "what stack", "stack", "languages", "skills", "frameworks", "tech does", "tools", "work with"])) {
    return `Adeel works with: ${skills.length ? skills.join(", ") : "N/A"}.`;
  }
  if (matchesAny(["services", "offer", "provide", "what can adeel", "what can he", "can adeel build", "can he build", "custom software", "solutions"])) {
    return `Services offered by Adeel: ${services.length ? services.join(", ") : "N/A"}.`;
  }
  if (matchesAny(["who is", "tell me about", "about adeel", "who the", "what does adeel", "background", "experience", "role", "occupation", "profession", "job title", "describe", "introduce", "who are you", "about you", "profile"])) {
    const focus = (profile.focus || "").replace(/\.$/, "");
    return `${profile.name || "Adeel Sattar"} is a ${profile.role || ""} focused on ${focus}. ${profile.bio || ""}`;
  }
  if (matchesAny(["contact", "email", "reach", "linkedin", "whatsapp", "hire", "freelance", "available", "availability", "social", "call"])) {
    return `You can contact Adeel at ${contact.email || ""}${contact.linkedin ? " or via LinkedIn: " + contact.linkedin : ""}${contact.whatsapp ? ". WhatsApp: " + contact.whatsapp : "."}`;
  }
  if (matchesAny(["project", "portfolio", "showcase", "built", "worked on", "developed", "systems"])) {
    const list = projects.map((p: any) => `${p.title} (${p.category || "N/A"}): ${p.description || ""}`).join("; ");
    return `Featured projects include: ${projects.length ? list : "N/A"}.`;
  }
  return null;
}

function matchFaq(faqItems: any[], q: string, normalize: (s: any) => string): string | null {
  if (!Array.isArray(faqItems)) return null;
  const STOP = new Set([
    "what", "is", "are", "the", "a", "an", "do", "does", "i", "you", "he",
    "his", "her", "how", "can", "me", "tell", "about", "of", "on", "in",
    "for", "to", "that", "who", "with", "and", "or", "am", "my"
  ]);
  const tokens = (s: string) => normalize(s).split(/\s+/).filter((w) => w && !STOP.has(w));
  let best: string | null = null;
  let bestSim = 0;
  for (const item of faqItems) {
    const qn = normalize(item.q || "");
    if (!qn || !item.a) continue;
    if (q === qn || q.indexOf(qn) !== -1 || qn.indexOf(q) !== -1) return item.a;
    const a = tokens(q);
    const b = tokens(qn);
    if (!a.length || !b.length) continue;
    const inter = a.filter((t) => b.indexOf(t) !== -1).length;
    if (inter < 2) continue;
    const sim = inter / Math.max(a.length, b.length);
    if (sim >= 0.5 && sim > bestSim) {
      best = item.a;
      bestSim = sim;
    }
  }
  return best;
}
export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const payload: any = await context.request.json();
    const message = payload && typeof payload.message !== "undefined" ? String(payload.message).trim() : "";
    if (!message || message.length > 1000) {
      return jsonResponse({ error: "Invalid message input size. Max 1000 characters." }, 400);
    }

    const knowledge = sanitizeKnowledge(await loadKnowledge(context.request, context.env));
    const localAnswer = answerFromKnowledge(knowledge, message);
    if (localAnswer) {
      return jsonResponse({ reply: localAnswer, mode: "local" }, 200);
    }

    const geminiKey = context.env.GEMINI_API_KEY;
    const openaiKey = context.env.OPENAI_API_KEY;
    if (geminiKey || openaiKey) {
      try {
        // Provider is optional; reuse the same knowledge-grounded facts.
        const facts = `${knowledge.profile.name || "Adeel Sattar"} - ${knowledge.profile.role || ""}. Skills: ${knowledge.skills.join(", ")}`;
        const prompt = `You are Adeel's portfolio assistant. Answer strictly from these facts only: ${facts}. If you cannot answer from these facts, say you do not have that information in the public portfolio.`;
        const url = geminiKey
          ? `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`
          : "https://api.openai.com/v1/chat/completions";
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (!geminiKey) headers["Authorization"] = `Bearer ${openaiKey}`;
        const body = geminiKey
          ? { contents: [{ role: "user", parts: [{ text: `${prompt}\n\nUser question: ${message}` }] }], generationConfig: { maxOutputTokens: 350, temperature: 0.2 } }
          : { model: "gpt-4o-mini", messages: [{ role: "system", content: prompt }, { role: "user", content: message }], max_tokens: 350, temperature: 0.2 };
        const resp = await fetch(url, { method: "POST", headers, body: JSON.stringify(body) });
        if (resp.ok) {
          const data: any = await resp.json();
          const text = geminiKey
            ? data?.candidates?.[0]?.content?.parts?.[0]?.text
            : data?.choices?.[0]?.message?.content;
          if (text && String(text).trim()) {
            return jsonResponse({ reply: String(text).trim(), mode: "ai" }, 200);
          }
        }
      } catch (err) {
        console.error("PROVIDER_ERROR", err);
      }
    }

    return jsonResponse({ reply: UNKNOWN_REPLY, mode: "fallback" }, 200);
  } catch (err) {
    console.error("CHAT_HANDLER_ERROR", err);
    return jsonResponse({ error: "internal_error", reply: SERVER_ERROR_REPLY }, 500);
  }
};

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "POST, OPTIONS"
    }
  });
};