import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface AgentUseCase {
  id: string;
  name: string;
  description: string;
  placeholder: string;
  mockOutputs: { input: string; output: string; logs: string[] }[];
}

@Component({
  selector: 'app-ai-playground-demo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-playground-demo.html',
  styleUrls: []
})
export class AiPlaygroundDemoComponent {
  private readonly http = inject(HttpClient);

  selectedCaseId = signal<string>('chatbot');
  userInput = signal<string>('Who is Adeel Sattar?');
  isProcessing = signal<boolean>(false);
  logs = signal<string[]>([]);
  agentOutput = signal<string>('');

  useCases: AgentUseCase[] = [
    {
      id: 'chatbot',
      name: 'Portfolio Assistant',
      description: 'Answers anything about who I am, what I build, and how to reach me.',
      placeholder: 'Ask me anything (e.g. "What is Adeel\'s stack?", "Show me his projects", "How to hire him?")...',
      mockOutputs: []
    },
    {
      id: 'lead',
      name: 'Lead Qualification',
      description: 'Paste a project description and see how I assess fit, budget, and next steps.',
      placeholder: 'Enter a project description or proposal (e.g. "Need a C# developer to build an API")...',
      mockOutputs: [
        {
          input: 'Looking for a senior full-stack .NET and Angular developer for a 6-month fintech project, hourly budget $80-100.',
          output: JSON.stringify({
            qualified: true,
            score: 98,
            stackMatch: ['.NET 10', 'Angular 20', 'TypeScript'],
            estimatedHours: 960,
            recommendedResponse: 'Introduce .NET/Angular architecture background and propose a preliminary scoping session.',
            tier: 'Enterprise High-Budget',
            actionLink: 'Schedule Scoping Session: wa.me/923176468708'
          }, null, 2),
          logs: [
            'Initializing Lead Analyzer Agent v1.0.0...',
            'Extracting semantic concepts from text...',
            'Found technologies: .NET, Angular',
            'Budget recognized: $80-100/hr (Tier: High)',
            'Duration: 6-month (Est. 960 hrs)',
            'Matching stack alignment: 100% match with Adeel Sattar capabilities.',
            'Generating final recommendation object...'
          ]
        }
      ]
    },
    {
      id: 'content',
      name: 'Content Generation',
      description: 'Generates professional social posts from tech architecture topics to demonstrate technical copy expertise.',
      placeholder: 'Enter a technical topic (e.g. Clean Architecture in .NET 10)...',
      mockOutputs: [
        {
          input: 'Clean Architecture in .NET 10',
          output: `🚀 Scaling enterprise systems requires separation of concerns. Here is why I design my backends using Clean Architecture in .NET 10:

1️⃣ Domain Layer remains pure (no EF Core or API dependencies).
2️⃣ Application Layer handles CQRS commands/queries via MediatR.
3️⃣ Infrastructure Layer deals with EF Core, PostgreSQL, and third-party APIs.
4️⃣ API Layer stays thin—acting purely as HTTP routing & serialization.

Result? Maintainable, unit-testable code ready for scale. 💻 #DotNet10 #CleanArchitecture #SoftwareEngineering`,
          logs: [
            'Initializing Copywriter Agent...',
            'Structuring technical thesis...',
            'Injecting professional hashtags...',
            'Polishing engagement tone...',
            'Post generated successfully.'
          ]
        }
      ]
    },
    {
      id: 'support',
      name: 'Support Assistant',
      description: 'Give a customer issue and watch it shape a clear, structured reply.',
      placeholder: 'Enter user issue (e.g. My login fails on Safari with JWT error, or My app returns 404)...',
      mockOutputs: [
        {
          input: 'My login fails on Safari with JWT error',
          output: `Thank you for reaching out. It looks like a Cookie-Security context issue on Safari.

Suggested Actions:
1. Verify if 'SameSite=None' is missing on the set-cookie header.
2. Check if Safari's "Prevent Cross-Site Tracking" is blocking the token storage.
3. Fallback to LocalStorage or InMemory token if cookies are completely blocked.

Resolution Status: Automated draft response generated. Sent troubleshooting ticket.`,
          logs: [
            'Initializing Support Agent...',
            'Parsing error category: Authentication / Cookie',
            'Platform identified: Safari browser',
            'Querying knowledge-base for "Safari JWT issue"...',
            'Found 3 matches. Formulating resolution draft...'
          ]
        }
      ]
    }
  ];

  selectCase(id: string) {
    this.selectedCaseId.set(id);
    const uc = this.useCases.find(u => u.id === id);
    if (uc) {
      if (id === 'chatbot') {
        this.userInput.set('Who is Adeel Sattar?');
      } else {
        this.userInput.set(uc.mockOutputs[0]?.input || '');
      }
      this.logs.set([]);
      this.agentOutput.set('');
    }
  }

  getCurrentCase(): AgentUseCase {
    return this.useCases.find(u => u.id === this.selectedCaseId()) || this.useCases[0];
  }

  askPresetQuestion(question: string) {
    this.userInput.set(question);
    this.runAgent();
  }

  async runAgent() {
    if (this.isProcessing()) return;
    this.isProcessing.set(true);
    this.logs.set([]);
    this.agentOutput.set('');

    const query = this.userInput().trim();
    const queryLower = query.toLowerCase();
    const scenario = this.selectedCaseId();

    let logsList: string[] = [];

    if (scenario === 'chatbot') {
      logsList = [
        'Initializing Profile Query Router Agent...',
        'Parsing semantic syntax rules...',
        'Classifying message user intent...',
        'Connecting to serverless proxy...',
        'Processing response stream...'
      ];

      // Simulate logs printing out one by one
      for (let log of logsList) {
        await this.sleep(300);
        this.logs.update(l => [...l, log]);
      }

      // Server-side /api/chat is authoritative in production (Cloudflare Worker).
      // During plain `ng serve` there is no backend, so on failure we answer from
      // the SAME knowledge file / matching rules (see answerFromKnowledge below)
      // instead of a divergent client-side heuristic.
      try {
        const res = await this.http.post<{ reply: string; mode?: string }>('/api/chat', { message: query }).toPromise();
        if (res && typeof res.reply === 'string' && res.reply.trim()) {
          this.agentOutput.set(res.reply.trim());
        } else {
          console.warn('Chat API returned an empty reply; using the local knowledge responder.');
          this.agentOutput.set(await this.answerFromLocalKnowledge(query));
        }
      } catch (err) {
        console.warn('Chat API unavailable locally; using the same knowledge-based responder as the Worker.', err);
        this.agentOutput.set(await this.answerFromLocalKnowledge(query));
      } finally {
        this.isProcessing.set(false);
      }
    } 
    else if (scenario === 'lead') {
      logsList = [
        'Initializing Lead Qualification Agent v1.0.0...',
        'Extracting tech terminology and scoping targets...',
        'Mapping budget figures and scheduling duration parameters...',
        'Cross-referencing technology stack compatibility indicators...',
        'Drafting qualification metrics report...'
      ];

      for (let log of logsList) {
        await this.sleep(350);
        this.logs.update(l => [...l, log]);
      }

      // Check if they typed our preset query
      const staticMatch = this.useCases[1].mockOutputs.find(m => m.input.toLowerCase().trim() === queryLower);
      if (staticMatch) {
        this.agentOutput.set(staticMatch.output);
      } else {
        const hasNet = this.matchesAny(queryLower, ['.net', 'c#', 'backend', 'api', 'entity', 'ef', 'sql', 'postgres']);
        const hasAngular = this.matchesAny(queryLower, ['angular', 'frontend', 'signals', 'typescript', 'tailwind', 'spa']);
        const hasWordPress = this.matchesAny(queryLower, ['wordpress', 'wp', 'marketing', 'ads', 'meta', 'pixel', 'seo']);

        const stackMatch: string[] = [];
        if (hasNet) stackMatch.push('.NET 10', 'C# Web API', 'PostgreSQL/EF Core');
        if (hasAngular) stackMatch.push('Angular 20', 'Signals state', 'Tailwind CSS');
        if (hasWordPress) stackMatch.push('WordPress Core', 'Ads Integration', 'Conversion Strategy');
        if (stackMatch.length === 0) stackMatch.push('.NET / Angular Full-Stack');

        const score = Math.floor(Math.random() * 15) + 85;

        const output = JSON.stringify({
          qualified: true,
          score: `${score}%`,
          stackMatch: stackMatch,
          scopingIntent: query,
          recommendation: 'Inbound prospect matches Adeel Sattar\'s engineering stack profile. Propose instant scoping session.',
          actions: {
            submitLeadForm: 'Scroll to "Start a Project" section below to register credentials.',
            instantWhatsApp: 'https://wa.me/923176468708',
            linkedInProfile: 'https://pk.linkedin.com/in/adeelsattar-dotnet-angular-developer'
          }
        }, null, 2);

        this.agentOutput.set(output);
      }
      this.isProcessing.set(false);
    } 
    else if (scenario === 'content') {
      logsList = [
        'Initializing Copywriter Agent...',
        'Scouting topic terms for engineering context...',
        'Structuring value thesis on technical scalability...',
        'Polishing syntax tone and generating engagement metrics...',
        'Outputting drafted publication document...'
      ];

      for (let log of logsList) {
        await this.sleep(350);
        this.logs.update(l => [...l, log]);
      }

      const staticMatch = this.useCases[2].mockOutputs.find(m => m.input.toLowerCase().trim() === queryLower);
      if (staticMatch) {
        this.agentOutput.set(staticMatch.output);
      } else {
        const output = `🚀 **Engineering Insights: Technical Delivery**

Topic: **${query}**

Here is how we design and deploy this in enterprise environments:
1️⃣ Decouple execution paths using C# and .NET 10 Clean Architecture.
2️⃣ Ensure optimal frontend state management by routing UI variables via Angular Signals.
3️⃣ Deploy using containerized multi-stage builds (Docker Compose) on Linux VPS nodes.

💡 *Decoupled architectures avoid maintenance debt and guarantee code testability.*

---
Need a custom, production-ready system or workflow built for your business? Let's connect!
- **Schedule Call:** wa.me/923176468708
- **Or register details in the contact form below.**

#SoftwareEngineering #DotNet10 #Angular20 #DevOps`;
        this.agentOutput.set(output);
      }
      this.isProcessing.set(false);
    }
    else if (scenario === 'support') {
      logsList = [
        'Initializing Support Diagnostics Agent...',
        'Parsing stack trace signatures and request patterns...',
        'Cross-referencing knowledge-base for route configurations...',
        'Compiling professional diagnostic recommendation...'
      ];

      for (let log of logsList) {
        await this.sleep(350);
        this.logs.update(l => [...l, log]);
      }

      const staticMatch = this.useCases[3].mockOutputs.find(m => m.input.toLowerCase().trim() === queryLower);
      if (staticMatch) {
        this.agentOutput.set(staticMatch.output);
      } else {
        let output = '';
        if (this.matchesAny(queryLower, ['404', 'not found', 'missing', 'route'])) {
          output = `🔍 **Diagnostic Agent: HTTP 404 Route Inspection**

A "404 Not Found" status code indicates that the web server (or backend router) cannot find the requested URL path.

**💡 Potential Root Causes:**
1. **SPA Fallback Missing:** Nginx or Caddy is not configured to redirect fallback browser routes back to 'index.html'.
2. **Controller Routing mismatch:** Typo in ASP.NET Controller class decoration attributes: e.g. [Route("api/[controller]")].
3. **Gateway Rewrite rules:** Reverse proxy is trimming API prefix strings incorrectly during routing cycles.

**🛠️ Diagnostic Resolution:**
- Ensure Nginx conf contains: 'try_files $uri $uri/ /index.html;'.
- Verify CORS and HTTPS certificates are mapped correctly to the backend server.

---
🚀 **Experiencing production downtime?**
Adeel has successfully audited and stabilized multiple enterprise network configurations.
- Get instant support on WhatsApp: https://wa.me/923176468708
- Or submit details in the Contact Form below to trigger automated logs sync.`;
        } 
        else if (this.matchesAny(queryLower, ['500', 'error', 'fail', 'crash', 'null', 'exception'])) {
          output = `🔍 **Diagnostic Agent: HTTP 500 Unhandled Exception**

An "Internal Server Error" indicates that the application layer threw a runtime exception.

**💡 Potential Root Causes:**
1. **DB Context Connection Timeout:** Database migrations are pending, database port is blocked, or connections pool is exhausted.
2. **Dependency Injection (DI) Mismatches:** You forgot to register a service implementation interface inside Program.cs.
3. **NullReferenceException:** Unvalidated request parameters are mapping null values to object properties.

**🛠️ Diagnostic Resolution:**
- Hook up a global CustomExceptionHandler middleware (like the RFC ProblemDetails middleware implemented in this platform's API).
- Check server terminal stdout logs to locate the exact class and line number throwing the exception.

---
🚀 **Need a senior developer to fix crashes and audit your API stability?**
- Chat with Adeel instantly: https://wa.me/923176468708
- Or register details in the contact form below.`;
        }
        else {
          output = `🔍 **Diagnostic Agent: General Diagnostic Assessment**

Inquiry: *"${query}"*

**💡 Recommended Diagnostic Scope:**
- Check browser Console and Network tabs for CORS, TLS handshake issues, or expired Authorization headers (Bearer tokens).
- Verify database connections strings are updated inside appsettings.json.

---
🚀 **Looking for a professional Full-Stack .NET & Angular engineer to solve your project bugs?**
Adeel Sattar designs, builds, and maintains clean-code web applications that don't break.
- Direct Chat: https://wa.me/923176468708
- Or fill out the Start a Project form below.`;
        }
        this.agentOutput.set(output);
      }
      this.isProcessing.set(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Local knowledge responder - mirrors worker/index.js answerFromKnowledge().
  // Used only when the /api/chat server cannot be reached (plain `ng serve`), so
  // localhost and production answer with the SAME knowledge file and rules.
  // ---------------------------------------------------------------------------
  private static readonly UNKNOWN_REPLY =
    "I don't have enough public information in this portfolio to answer that. " +
    "You can explore the Projects or Services pages, or contact Adeel directly " +
    "via the Start a Project form or LinkedIn.";

  private knowledgeCache: any = null;

  private async answerFromLocalKnowledge(query: string): Promise<string> {
    const knowledge = await this.loadKnowledge();
    if (!knowledge) {
      return "The chat service is temporarily unavailable and the local knowledge source could not be loaded. Please try again in a moment.";
    }
    const answer = this.answerFromKnowledge(knowledge, query);
    return answer || AiPlaygroundDemoComponent.UNKNOWN_REPLY;
  }

  private async loadKnowledge(): Promise<any> {
    if (this.knowledgeCache) return this.knowledgeCache;
    try {
      const kn = await this.http.get('/personal-knowledge.json', { responseType: 'json' }).toPromise();
      this.knowledgeCache = kn || null;
    } catch (err) {
      console.warn('personal-knowledge.json could not be loaded locally.', err);
      this.knowledgeCache = null;
    }
    return this.knowledgeCache;
  }

  private answerFromKnowledge(knowledge: any, message: string): string | null {
    if (!knowledge) return null;

    const normalize = (s: any): string => {
      if (!s) return '';
      return String(s).toLowerCase()
        .replace(/[\u2018\u2019']/g, '')
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    };
    const q = normalize(message);
    if (!q) return null;
    const matchesAny = (arr: string[]) =>
      arr.some((k) => {
        const nk = normalize(k);
        return nk !== '' && q.indexOf(nk) !== -1;
      });

    const profile = knowledge.profile || {};
    const skills: string[] = Array.isArray(knowledge.skills) ? knowledge.skills : [];
    const projects: any[] = Array.isArray(knowledge.projects) ? knowledge.projects : [];
    const services: string[] = Array.isArray(knowledge.services) ? knowledge.services : [];
    const contact = knowledge.contact || {};

    // 1) Specific known-technology questions (same order as the Worker).
    const asksAboutUse =
      /(^|\b)(does|uses|use|work with|works with|stack|technolog|languages|skills|frameworks|tools|experience|familiar)(\b|$)/.test(q) &&
      !/projects?\b|portfolio|built|showcase/.test(q);
    const askedSkill = asksAboutUse
      ? skills.find((s) => normalize(s).split(/\s+/).some((t) => t.length >= 2 && q.indexOf(t) !== -1))
      : undefined;
    if (askedSkill) {
      return `Yes, Adeel works with ${askedSkill}. His full stack includes: ${skills.join(', ')}.`;
    }
    if (/^does\b/.test(q)) {
      return null; // Unknown technology -> no fabrication.
    }

    // 2) Curated FAQ.
    const faqAnswer = this.matchFaq(knowledge.faq, q, normalize);
    if (faqAnswer) return faqAnswer;

    // 3) Specific project questions.
    for (const p of projects) {
      const titleKey = normalize(p.title || '');
      if (titleKey && (q.indexOf(titleKey) !== -1 || titleKey.indexOf(q) !== -1)) {
        const techs = Array.isArray(p.techs) && p.techs.length ? p.techs.join(', ') : 'N/A';
        return `${p.title}: ${p.description || ''} (Category: ${p.category || 'N/A'}). Built with: ${techs}.`;
      }
    }

    // 4) Skills / stack listing.
    if (matchesAny(['tech stack', 'technolog', 'what stack', 'stack', 'languages', 'skills', 'frameworks', 'tech does', 'tools', 'work with'])) {
      return `Adeel works with: ${skills.length ? skills.join(', ') : 'N/A'}.`;
    }

    // 5) Services.
    if (matchesAny(['services', 'offer', 'provide', 'what can adeel', 'what can he', 'can adeel build', 'can he build', 'custom software', 'solutions'])) {
      return `Services offered by Adeel: ${services.length ? services.join(', ') : 'N/A'}.`;
    }

    // 6) Profile / background / role.
    if (matchesAny(['who is', 'tell me about', 'about adeel', 'who the', 'what does adeel', 'background', 'experience', 'role', 'occupation', 'profession', 'job title', 'describe', 'introduce', 'who are you', 'about you', 'profile'])) {
      const name = profile.name || 'Adeel Sattar';
      const role = profile.role || '';
      const focus = (profile.focus || '').replace(/\.$/, '');
      const bio = profile.bio || '';
      return `${name} is a ${role} focused on ${focus}. ${bio}`;
    }

    // 7) Contact / availability.
    if (matchesAny(['contact', 'email', 'reach', 'linkedin', 'whatsapp', 'hire', 'freelance', 'available', 'availability', 'social', 'call'])) {
      return `You can contact Adeel at ${contact.email || ''}${contact.linkedin ? ' or via LinkedIn: ' + contact.linkedin : ''}${contact.whatsapp ? '. WhatsApp: ' + contact.whatsapp : '.'}`;
    }

    // 8) Projects (general).
    if (matchesAny(['project', 'portfolio', 'showcase', 'built', 'worked on', 'developed', 'systems'])) {
      const list = projects.map((p) => `${p.title} (${p.category || 'N/A'}): ${p.description || ''}`).join('; ');
      return `Featured projects include: ${projects.length ? list : 'N/A'}.`;
    }

    return null;
  }

  private matchFaq(faqItems: any[], q: string, normalize: (s: any) => string): string | null {
    if (!Array.isArray(faqItems)) return null;
    const STOP = new Set([
      'what', 'is', 'are', 'the', 'a', 'an', 'do', 'does', 'i', 'you', 'he',
      'his', 'her', 'how', 'can', 'me', 'tell', 'about', 'of', 'on', 'in',
      'for', 'to', 'that', 'who', 'with', 'and', 'or', 'am', 'my'
    ]);
    const tokens = (s: string) => normalize(s).split(/\s+/).filter((w) => w && !STOP.has(w));
    let best: string | null = null;
    let bestSim = 0;
    for (const item of faqItems) {
      const qn = normalize(item.q || '');
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

  private matchesAny(text: string, keywords: string[]): boolean {
    return keywords.some(k => text.includes(k));
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
