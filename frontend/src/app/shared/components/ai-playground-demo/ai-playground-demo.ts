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
      name: 'Adeel Profile Chatbot',
      description: 'Personalized interactive chat agent addressing expertise, background, portfolio systems, and contact availability.',
      placeholder: 'Ask me anything (e.g. "What is Adeel\'s stack?", "Show me his projects", "How to hire him?")...',
      mockOutputs: []
    },
    {
      id: 'lead',
      name: 'Lead Qualification',
      description: 'Parses inbound project descriptions, extract budget constraints, determines stack alignment, and tags business potential.',
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
      name: 'Support Automation',
      description: 'Analyzes user complaints, extracts emotional tone, drafts automated debugging answers, and updates ticketing systems.',
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

      // Attempt server-side API first, but gracefully fallback to local knowledge if unavailable
      try {
        const res = await this.http.post<{ reply: string; mode?: string }>('/api/chat', { message: query }).toPromise();
        if (res && res.reply) {
          // If response mode indicates local/fallback, do not claim it's AI-generated
          this.agentOutput.set(res.reply);
        } else {
          // If API returned empty or malformed response, fallback to local
          this.agentOutput.set(this.getLocalFallbackReply(queryLower, query));
        }
      } catch (err) {
        console.warn('Serverless AI API failed. Falling back to local responder.', err);
        const reply = this.getLocalFallbackReply(queryLower, query);
        this.agentOutput.set(reply);
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

  private getLocalFallbackReply(queryLower: string, originalQuery: string): string {
    // Enhanced local intent detection: normalized keyword groups
    if (this.matchesAny(queryLower, ['who is', 'adeel', 'profile', 'background', 'experience', 'about you', 'who are you', 'who am i', 'tell me about'])) {
      return `🤖 **Adeel Sattar Profile Summary**

Adeel Sattar is a seasoned Software Engineer and .NET Full-Stack Developer focused on engineering high-end business architectures and integrations.

**Technical Strengths:**
- **Enterprise Backends:** Custom C# APIs utilizing Clean Architecture, EF Core, and MediatR (CQRS).
- **Modern Frontends:** Fluid client-facing SPAs crafted in Angular 20 and styled with Tailwind CSS.
- **Workflow Automation:** Deploying background worker microservices, lead syncs, and custom OpenAI completions.
- **Conversion Optimization:** Custom WordPress development and campaign pixel tracking.`;
    }

    // If fallback cannot confidently answer, return helpful navigation guidance
    if (this.matchesAny(queryLower, ['how', 'what', 'why', 'help', 'suggest', 'recommend', 'which'])) {
      return `I don't have enough information in the public portfolio to answer that in detail. You can explore the Projects or Services pages, or contact Adeel directly via the Start a Project form or LinkedIn.`;
    }
    else if (this.matchesAny(queryLower, ['stack', 'tech', 'skills', 'framework', 'net', 'angular', 'database', 'tools', 'languages'])) {
      return `🛠️ **Engineering Technology Stack**

Adeel designs applications using a robust, decoupled enterprise ecosystem:

- **Backend Architecture:** .NET 10, ASP.NET Core Web API, Entity Framework Core, CQRS (MediatR), MS SQL Server, PostgreSQL, SQLite.
- **Client Interfaces:** Angular 20 (Standalone Components, Signals State), TypeScript, Tailwind CSS 4.0, Nginx.
- **Workflow / AI Engine:** OpenAI API orchestration, C# Background Task Queues.
- **DevOps Ecosystem:** Docker, Docker Compose, GitHub Actions, Linux VPS Deployment, SSL Certificate routers (Caddy).`;
    } 
    else if (this.matchesAny(queryLower, ['projects', 'built', 'portfolio', 'work', 'developed', 'systems', 'showcase'])) {
      return `📁 **Featured System Architectures**

Adeel has engineered these showcase systems from scratch:

1. **SocialMediaAgent:** AI publishing portal that leverages OpenAI API prompts to compile draft copy, queued inside background processing lists (.NET 10 & Angular 20).
2. **CoreERP Integration Engine:** High-throughput transactional data sync engine posting invoice ledgers to Oracle ERP under heavy concurrent load.
3. **GrowthHub Performance CRM:** Analytics management tool hooking into Meta Graph API endpoints to trace ads pixel conversions.`;
    } 
    else if (this.matchesAny(queryLower, ['contact', 'hire', 'email', 'linkedin', 'whatsapp', 'reach', 'social', 'phone', 'call', 'talk'])) {
      return `📞 **Direct Communication Options**

Let's discuss roles, partnerships, or scoping details:

- **LinkedIn Portfolio:** [pk.linkedin.com/in/adeelsattar-dotnet-angular-developer](https://pk.linkedin.com/in/adeelsattar-dotnet-angular-developer)
- **GitHub Codebase:** [github.com/createxdigital65](https://github.com/createxdigital65)
- **Direct WhatsApp:** [+92 317 6468708](https://wa.me/923176468708)
- **Instagram Handle:** [@adeelsattar.dev](https://instagram.com/adeelsattar.dev)

*You can also submit your details directly in the **Start a Project** contact form below!*`;
    } 
    return `👋 **Adeel's AI Assistant**

I parsed your inquiry: *"${originalQuery}"*

While the live serverless endpoint is offline, I can resolve local info about:
- **"Who is Adeel?"** (Overview of profile)
- **"What is his stack?"** (Detailed technical list)
- **"What projects did he build?"** (System breakdowns)
- **"How can I contact him?"** (Direct socials links)`;
  }

  private matchesAny(text: string, keywords: string[]): boolean {
    return keywords.some(k => text.includes(k));
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
