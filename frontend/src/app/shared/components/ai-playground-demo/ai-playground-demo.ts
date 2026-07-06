import { Component, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  selectedCaseId = signal<string>('lead');
  userInput = signal<string>('Looking for a senior full-stack .NET and Angular developer for a 6-month fintech project, hourly budget $80-100.');
  isProcessing = signal<boolean>(false);
  logs = signal<string[]>([]);
  agentOutput = signal<string>('');

  useCases: AgentUseCase[] = [
    {
      id: 'lead',
      name: 'Lead Qualification',
      description: 'Parses inbound project descriptions, extract budget constraints, determines stack alignment, and tags business potential.',
      placeholder: 'Enter a project description or proposal...',
      mockOutputs: [
        {
          input: 'Looking for a senior full-stack .NET and Angular developer for a 6-month fintech project, hourly budget $80-100.',
          output: JSON.stringify({
            qualified: true,
            score: 95,
            stackMatch: ['.NET 10', 'Angular 20', 'TypeScript'],
            estimatedHours: 960,
            recommendedResponse: 'Introduce .NET/Angular architecture background and propose a preliminary scoping session.',
            tier: 'Enterprise High-Budget'
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
      placeholder: 'Enter user issue (e.g. My login fails on Safari with JWT error)...',
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
      this.userInput.set(uc.mockOutputs[0]?.input || '');
      this.logs.set([]);
      this.agentOutput.set('');
    }
  }

  getCurrentCase(): AgentUseCase {
    return this.useCases.find(u => u.id === this.selectedCaseId()) || this.useCases[0];
  }

  async runAgent() {
    if (this.isProcessing()) return;
    this.isProcessing.set(true);
    this.logs.set([]);
    this.agentOutput.set('');

    const currentCase = this.getCurrentCase();
    const mockMatch = currentCase.mockOutputs.find(
      m => m.input.toLowerCase().trim() === this.userInput().toLowerCase().trim()
    ) || {
      output: `Processed Input: "${this.userInput()}"\n\nAgent analyzed input. Response structured successfully based on customized context template.`,
      logs: [
        'Initializing Custom Processing Agent...',
        'Parsing custom input...',
        'Evaluating intent...',
        'Compiling standard context responses...',
        'Completed run.'
      ]
    };

    // Simulate logs printing out one by one
    for (let log of mockMatch.logs) {
      await this.sleep(400);
      this.logs.update(l => [...l, `[${new Date().toLocaleTimeString()}] ${log}`]);
    }

    await this.sleep(600);
    this.agentOutput.set(mockMatch.output);
    this.isProcessing.set(false);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
