export interface ApprovalDraft {
  id: number;

  company: string;
  industry: string;

  contact: string;
  email: string;

  jobTitle: string;

  aiScore: number;

  status:
    | "Pending"
    | "Approved"
    | "Rejected"
    | "Scheduled";

  generatedOn: string;

  subject: string;

  body: string;
}

export const approvalDrafts: ApprovalDraft[] = [
  {
    id: 1,

    company: "Google",
    industry: "Technology",

    contact: "John Smith",
    email: "john@google.com",

    jobTitle: "Senior Recruiter",

    aiScore: 98,

    status: "Approved",

    generatedOn: "21 Jul 2026",

    subject: "Helping Google Hire Top AI Talent",

    body: `Hi John,

I hope you're doing well.

I noticed Google is expanding its AI teams. Our AI-powered recruitment platform helps companies identify and engage top candidates while reducing hiring time significantly.

I'd love to schedule a short demo to show how HireGen AI can support your recruitment efforts.

Best regards,

HireGen AI Team`,
  },

  {
    id: 2,

    company: "Microsoft",
    industry: "Technology",

    contact: "Emily Watson",
    email: "emily@microsoft.com",

    jobTitle: "HR Manager",

    aiScore: 93,

    status: "Rejected",

    generatedOn: "20 Jul 2026",

    subject: "Hire Better Talent with HireGen AI",

    body: `Hi Emily,

Hope you're having a great day.

HireGen AI helps recruitment teams automate sourcing, ranking and outreach while improving response rates.

I'd love to show you how it works.

Regards,

HireGen AI Team`,
  },

  {
    id: 3,

    company: "Amazon",
    industry: "E-Commerce",

    contact: "David Miller",
    email: "david@amazon.com",

    jobTitle: "Talent Acquisition Lead",

    aiScore: 96,

    status: "Scheduled",

    generatedOn: "19 Jul 2026",

    subject: "Accelerate Hiring with AI",

    body: `Hi David,

Amazon continues hiring rapidly across multiple teams.

HireGen AI can automate outreach and improve candidate engagement.

Looking forward to connecting with you.

Regards,

HireGen AI Team`,
  },

  {
    id: 4,

    company: "Infosys",
    industry: "IT Services",

    contact: "Priya Sharma",
    email: "priya@infosys.com",

    jobTitle: "Recruitment Specialist",

    aiScore: 91,

    status: "Approved",

    generatedOn: "18 Jul 2026",

    subject: "Smarter Recruitment Starts Here",

    body: `Hi Priya,

HireGen AI enables recruitment teams to discover qualified candidates faster using AI-powered sourcing.

Would love to schedule a quick discussion.

Thanks,

HireGen AI Team`,
  },

  {
    id: 5,

    company: "IBM",
    industry: "Technology",

    contact: "Robert Wilson",
    email: "robert@ibm.com",

    jobTitle: "HR Director",

    aiScore: 95,

    status: "Approved",

    generatedOn: "17 Jul 2026",

    subject: "Modernize Recruitment with AI",

    body: `Hi Robert,

Hiring at scale becomes much easier with AI.

HireGen AI can help IBM improve outreach and candidate engagement.

Let's connect soon.

Regards,

HireGen AI Team`,
  },
];