import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface ProjectItem {
  title: string;
  category: string;
  description: string;
  techs: string[];
  features: string[];
  challenges: string;
  lessons: string;
  expanded?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private readonly projects: ProjectItem[] = [
    {
      title: 'Multi-Sig Cryptocurrency Custody Engine',
      category: 'Digital Assets & Cryptography',
      description:
        'A secure crypto custody platform designed to eliminate single-point-of-failure risks in digital asset holding through distributed threshold signing.',
      techs: ['ASP.NET Core', 'C#', 'Angular', 'TypeScript', 'Cryptographic KMS', 'Multi-Sig', 'WebSockets', 'SQL Server'],
      features: [
        'Distributed threshold approval pipeline requiring multiple authorized signers before any transaction touches the blockchain.',
        'Cryptographic isolation between signing keys and public web layers, removing single-operator vulnerability vectors.',
        'Sub-second multi-asset balance reconciliation over WebSockets, catching any ledger mismatch immediately.'
      ],
      challenges:
        'If a private key leaks or an internal actor goes rogue, funds are lost forever. Standard hot wallets simply do not offer the multi-party signing checks institutional clients require.',
      lessons:
        'Built a distributed multi-signature approval pipeline that isolates authorization keys from the operational application layer, backed by HSM key storage and real-time WebSocket reconciliation.'
    },
    {
      title: 'Real-Time AML & KYC Monitoring Platform',
      category: 'FinTech & Compliance',
      description:
        'An automated compliance platform that flags suspicious transactions, monitors cashflows, and automates customer verification in real time.',
      techs: ['ASP.NET Web API', 'Clean Architecture', 'Angular', 'TypeScript', 'Entity Framework Core', 'Identity Verification APIs', 'Sanction Watchlists'],
      features: [
        'Automated Customer Due Diligence (CDD) and Enhanced Due Diligence (EDD) pipelines, cutting onboarding wait times by 80%.',
        'Real-time cashflow heuristic checks that instantly flag structuring and anomalous transfer velocity.',
        'Tamper-evident, structured audit trails that make annual regulatory examinations fast and straightforward.'
      ],
      challenges:
        'Manual reviews do not scale when transaction volumes spike. Missed sanctions, structuring, or fraud patterns expose companies to heavy regulatory penalties and account freezes.',
      lessons:
        'Engineered an automated screening pipeline that checks international sanction watchlists and evaluates transaction velocity patterns on the fly.'
    },
    {
      title: 'CJIS-Compliant Law Enforcement Portal',
      category: 'GovTech & High Security',
      description:
        'A secure data portal allowing law enforcement personnel to search sensitive criminal records across state and federal databases (NCIC/NLETS).',
      techs: ['ASP.NET Core', 'Angular', 'TypeScript', 'RBAC', 'Cryptographic Audit Logging', 'WCAG 2.1 AA', 'JWT'],
      features: [
        'Granular role-based access control (RBAC) ensuring officers only see records authorized for their jurisdiction.',
        'Immutable query logging that makes credential escalation and data leakage virtually impossible.',
        'Full WCAG 2.1 AA compliant UI, allowing rapid cross-agency deployment without accessibility friction.'
      ],
      challenges:
        'Federal CJIS standards leave zero room for error: every query must be cryptographically audited, session tokens must be strictly isolated, and interfaces must pass federal accessibility rules.',
      lessons:
        'Implemented zero-trust role-based access control, cryptographic session handling, and accessible WCAG 2.1 AA UI components that field officers can use reliably on any device.'
    },
    {
      title: 'AI-Powered Publishing & Workflow Agent',
      category: 'Enterprise AI & Automation',
      description:
        'An autonomous content agent built on .NET background services and LLM function calling to draft, format, and schedule multi-channel distribution.',
      techs: ['.NET 10', 'ASP.NET Core', 'LLM Integration', 'Function Calling', 'Angular 20', 'Job Queues', 'Social Graph APIs'],
      features: [
        'Autonomous draft generation tailored to platform-specific constraints with an internal review and approval gate.',
        'Resilient .NET worker service with Polly retry policies and exponential backoff to handle rate limits cleanly.',
        'Cut manual publishing overhead by over 70% while keeping humans firmly in the loop for final sign-off.'
      ],
      challenges:
        'Marketing and ops teams spend hours reformatting copy across platforms, but naive AI scripts frequently hallucinate or fail when hitting third-party rate limits.',
      lessons:
        'Combined structured LLM function calling with resilient .NET background worker queues and Polly retry policies to ensure reliable, fail-safe distribution.'
    }
  ];

  getProjects(): Observable<ProjectItem[]> {
    return of(this.projects);
  }
}
