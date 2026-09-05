const fs = require('node:fs');
const path = require('node:path');
const { Client } = require('pg');

async function seed() {
  const envPath = path.resolve(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is required to seed database');
  }

  const client = new Client({ connectionString });
  await client.connect();

  try {
    console.log('[SEED] Starting mock data insertion...');

    // 1. Team Users for RBAC demonstration
    // Password hash for 'Admin@123'
    const passwordHash = '$2b$10$Zn53fSm2yS/Jm.s5Txp.POBqMpI9nTU70a/97a.N2ckfOQDW5vLda';

    const usersToUpsert = [
      {
        email: 'priya.sharma@hiregen.ai',
        fullName: 'Priya Sharma',
        role: 'MANAGER',
        designation: 'Engineering Recruitment Manager',
        department: 'Talent Acquisition'
      },
      {
        email: 'rahul.verma@hiregen.ai',
        fullName: 'Rahul Verma',
        role: 'SALES_REP',
        designation: 'Senior Outreach Specialist',
        department: 'Business Development'
      },
      {
        email: 'sneha.kapoor@hiregen.ai',
        fullName: 'Sneha Kapoor',
        role: 'RECRUITER',
        designation: 'Technical Talent Sourcer',
        department: 'Human Resources'
      },
      {
        email: 'vikram.singh@hiregen.ai',
        fullName: 'Vikram Singh',
        role: 'VIEWER',
        designation: 'Strategy & Compliance Auditor',
        department: 'Operations'
      }
    ];

    for (const u of usersToUpsert) {
      await client.query(`
        INSERT INTO users (email, password_hash, full_name, role, is_active, designation, department)
        VALUES ($1, $2, $3, $4, true, $5, $6)
        ON CONFLICT (normalized_email) DO UPDATE
        SET full_name = EXCLUDED.full_name,
            role = EXCLUDED.role,
            designation = EXCLUDED.designation,
            department = EXCLUDED.department;
      `, [u.email, passwordHash, u.fullName, u.role, u.designation, u.department]);
    }
    console.log('[SEED] RBAC users seeded.');

    // Fetch primary admin user id for owner reference
    const adminRes = await client.query(`SELECT id FROM users WHERE email = 'admin@hiregen.ai' LIMIT 1;`);
    const adminId = adminRes.rows[0]?.id;

    // 2. Companies
    const companies = [
      {
        name: 'Google LLC',
        domain: 'google.com',
        industry: 'Technology / AI',
        size_range: '10000+',
        linkedin_url: 'https://www.linkedin.com/company/google'
      },
      {
        name: 'Stripe Inc.',
        domain: 'stripe.com',
        industry: 'FinTech / Payments',
        size_range: '5001-10000',
        linkedin_url: 'https://www.linkedin.com/company/stripe'
      },
      {
        name: 'Razorpay Software',
        domain: 'razorpay.com',
        industry: 'FinTech / Banking',
        size_range: '1001-5000',
        linkedin_url: 'https://www.linkedin.com/company/razorpay'
      },
      {
        name: 'Swiggy',
        domain: 'swiggy.com',
        industry: 'Consumer Tech / Logistics',
        size_range: '5001-10000',
        linkedin_url: 'https://www.linkedin.com/company/swiggy'
      },
      {
        name: 'Zomato Limited',
        domain: 'zomato.com',
        industry: 'Internet / Food Delivery',
        size_range: '5001-10000',
        linkedin_url: 'https://www.linkedin.com/company/zomato'
      }
    ];

    const companyMap = {};
    for (const c of companies) {
      const res = await client.query(`
        INSERT INTO companies (name, domain, industry, size_range, linkedin_url)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (domain) DO UPDATE
        SET name = EXCLUDED.name,
            industry = EXCLUDED.industry,
            size_range = EXCLUDED.size_range,
            linkedin_url = EXCLUDED.linkedin_url
        RETURNING id, domain;
      `, [c.name, c.domain, c.industry, c.size_range, c.linkedin_url]);
      companyMap[c.domain] = res.rows[0].id;
    }
    console.log('[SEED] 5 Companies seeded.');

    // 3. Contacts
    const contacts = [
      {
        domain: 'google.com',
        fullName: 'Neha Sharma',
        title: 'VP of Engineering',
        email: 'neha.sharma@google.com',
        linkedinUrl: 'https://linkedin.com/in/neha-sharma-tech'
      },
      {
        domain: 'stripe.com',
        fullName: 'Rohan Mehta',
        title: 'Head of Global Talent Acquisition',
        email: 'rohan.mehta@stripe.com',
        linkedinUrl: 'https://linkedin.com/in/rohan-mehta-recruiting'
      },
      {
        domain: 'razorpay.com',
        fullName: 'Pooja Verma',
        title: 'Director of Technical Recruiting',
        email: 'pooja.verma@razorpay.com',
        linkedinUrl: 'https://linkedin.com/in/pooja-verma-razorpay'
      },
      {
        domain: 'swiggy.com',
        fullName: 'Amit Patel',
        title: 'Lead AI & Platform Recruiter',
        email: 'amit.patel@swiggy.com',
        linkedinUrl: 'https://linkedin.com/in/amit-patel-swiggy'
      },
      {
        domain: 'zomato.com',
        fullName: 'Sneha Rao',
        title: 'VP of People & Culture',
        email: 'sneha.rao@zomato.com',
        linkedinUrl: 'https://linkedin.com/in/sneha-rao-zomato'
      }
    ];

    const contactMap = {};
    for (const c of contacts) {
      const companyId = companyMap[c.domain];
      const res = await client.query(`
        INSERT INTO contacts (company_id, full_name, title, email, linkedin_url, verified)
        VALUES ($1, $2, $3, $4, $5, true)
        ON CONFLICT (normalized_email) DO UPDATE
        SET full_name = EXCLUDED.full_name,
            title = EXCLUDED.title,
            company_id = EXCLUDED.company_id,
            verified = true
        RETURNING id, email;
      `, [companyId, c.fullName, c.title, c.email, c.linkedinUrl]);
      contactMap[c.domain] = res.rows[0].id;
    }
    console.log('[SEED] 5 Contacts seeded.');

    // 4. Hiring Signals
    const signals = [
      {
        domain: 'google.com',
        source: 'linkedin',
        sourceUrl: 'https://www.linkedin.com/jobs/view/google-staff-ai-systems-engineer',
        roleTitle: 'Staff AI Systems Engineer',
        hiringType: 'FULL_TIME',
        dedupeKey: 'google-staff-ai-systems-engineer-linkedin',
        rawPayload: { openings: 3, experience: '8+ years', tech: ['PyTorch', 'Distributed Systems', 'C++'] }
      },
      {
        domain: 'stripe.com',
        source: 'career_page',
        sourceUrl: 'https://stripe.com/jobs/senior-frontend-architect',
        roleTitle: 'Senior Frontend Architect',
        hiringType: 'FULL_TIME',
        dedupeKey: 'stripe-senior-frontend-architect-careers',
        rawPayload: { openings: 2, experience: '6+ years', tech: ['React', 'TypeScript', 'Design Systems'] }
      },
      {
        domain: 'razorpay.com',
        source: 'naukri',
        sourceUrl: 'https://naukri.com/job/razorpay-lead-backend-developer',
        roleTitle: 'Lead Backend Developer (Distributed Payments)',
        hiringType: 'CONTRACT',
        dedupeKey: 'razorpay-lead-backend-developer-naukri',
        rawPayload: { openings: 5, experience: '7+ years', tech: ['Go', 'Kafka', 'PostgreSQL'] }
      },
      {
        domain: 'swiggy.com',
        source: 'linkedin',
        sourceUrl: 'https://linkedin.com/jobs/view/swiggy-devops-platform-lead',
        roleTitle: 'DevOps & Platform Engineering Lead',
        hiringType: 'BULK_HIRING',
        dedupeKey: 'swiggy-devops-platform-lead-linkedin',
        rawPayload: { openings: 8, experience: '5+ years', tech: ['Kubernetes', 'AWS', 'Terraform'] }
      },
      {
        domain: 'zomato.com',
        source: 'wellfound',
        sourceUrl: 'https://wellfound.com/jobs/zomato-principal-pm-genai',
        roleTitle: 'Principal Product Manager - Generative AI',
        hiringType: 'FULL_TIME',
        dedupeKey: 'zomato-principal-pm-wellfound',
        rawPayload: { openings: 1, experience: '7+ years', tech: ['LLM Product', 'Strategy', 'Analytics'] }
      }
    ];

    const signalMap = {};
    for (const s of signals) {
      const companyId = companyMap[s.domain];
      const res = await client.query(`
        INSERT INTO hiring_signals (company_id, source, source_url, role_title, hiring_type, dedupe_key, status, raw_payload)
        VALUES ($1, $2, $3, $4, $5, $6, 'QUALIFIED', $7)
        ON CONFLICT (dedupe_key) DO UPDATE
        SET role_title = EXCLUDED.role_title,
            hiring_type = EXCLUDED.hiring_type,
            status = 'QUALIFIED'
        RETURNING id, dedupe_key;
      `, [companyId, s.source, s.sourceUrl, s.roleTitle, s.hiringType, s.dedupeKey, JSON.stringify(s.rawPayload)]);
      signalMap[s.domain] = res.rows[0].id;
    }
    console.log('[SEED] 5 Hiring Signals seeded.');

    // 5. Leads (Each in a different stage to populate all 5 KPI cards)
    const leads = [
      {
        domain: 'google.com',
        stage: 'NEW',
        fitScore: 96.50,
        hiringType: 'FULL_TIME',
        urgency: 'HIGH'
      },
      {
        domain: 'stripe.com',
        stage: 'SENT', // "Contacted" in UI
        fitScore: 92.00,
        hiringType: 'FULL_TIME',
        urgency: 'HIGH'
      },
      {
        domain: 'razorpay.com',
        stage: 'REPLIED', // "Replied" in UI
        fitScore: 88.50,
        hiringType: 'CONTRACT',
        urgency: 'MEDIUM'
      },
      {
        domain: 'swiggy.com',
        stage: 'MEETING_BOOKED', // "Meeting" in UI
        fitScore: 94.00,
        hiringType: 'BULK_HIRING',
        urgency: 'HIGH'
      },
      {
        domain: 'zomato.com',
        stage: 'WON', // "Client Won" in UI
        fitScore: 91.00,
        hiringType: 'FULL_TIME',
        urgency: 'HIGH'
      }
    ];

    const leadMap = {};
    for (const l of leads) {
      const signalId = signalMap[l.domain];
      const companyId = companyMap[l.domain];
      const contactId = contactMap[l.domain];

      const res = await client.query(`
        INSERT INTO leads (hiring_signal_id, company_id, primary_contact_id, owner_id, stage, hiring_type, fit_score, urgency)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (hiring_signal_id) DO UPDATE
        SET stage = EXCLUDED.stage,
            fit_score = EXCLUDED.fit_score,
            urgency = EXCLUDED.urgency,
            primary_contact_id = EXCLUDED.primary_contact_id
        RETURNING id;
      `, [signalId, companyId, contactId, adminId, l.stage, l.hiringType, l.fitScore, l.urgency]);
      leadMap[l.domain] = res.rows[0].id;
    }
    console.log('[SEED] 5 Leads seeded with varied stages.');

    // 6. Company Research
    for (const domain of Object.keys(companyMap)) {
      const companyId = companyMap[domain];
      await client.query(`
        INSERT INTO company_research (company_id, summary, source_urls, model_used, completed_at)
        VALUES ($1, $2, $3, 'gemini-1.5-pro', NOW())
        ON CONFLICT (company_id) DO UPDATE
        SET summary = EXCLUDED.summary,
            completed_at = NOW();
      `, [
        companyId,
        `High-growth technology leader actively investing in top-tier engineering talent and AI infrastructure. Recent quarterly initiatives indicate rapid team expansion across cloud platforms and distributed systems.`,
        JSON.stringify([`https://${domain}/careers`, `https://${domain}/about`])
      ]);
    }
    console.log('[SEED] Company research seeded.');

    // 7. Approval Queue (Outreach drafts)
    const approvals = [
      {
        domain: 'google.com',
        status: 'PENDING',
        subject: 'Accelerating AI Systems Talent Acquisition for Google',
        body: 'Hi Neha,\n\nI noticed Google is expanding its Staff AI Systems team in distributed training infrastructure. At HireGen AI, we specialize in surfacing top 1% ML systems architects with verified production experience. Would love to share 3 pre-vetted profiles.',
        step: 1
      },
      {
        domain: 'stripe.com',
        status: 'APPROVED',
        subject: 'Senior Frontend Architecture Sourcing for Stripe',
        body: 'Hi Rohan,\n\nSaw Stripe\'s active search for Senior Frontend Architects. Our pipeline includes senior design systems engineers from tier-1 fintech firms. Looking forward to discussing your specific team requirements.',
        step: 1
      },
      {
        domain: 'razorpay.com',
        status: 'REJECTED',
        subject: 'Contract Engineering Capacity for Razorpay Core Platform',
        body: 'Hi Pooja,\n\nReaching out regarding distributed systems contract hires for high-throughput payment gateways. Let us know if you have immediate contractor band openings.',
        step: 1
      }
    ];

    for (const a of approvals) {
      const leadId = leadMap[a.domain];
      await client.query(`
        INSERT INTO approval_queue (lead_id, draft_subject, draft_body, status, step_number, reviewed_by)
        VALUES ($1, $2, $3, $4, $5, $6);
      `, [leadId, a.subject, a.body, a.status, a.step, a.status === 'APPROVED' ? adminId : null]);
    }
    console.log('[SEED] Approval Queue drafts seeded.');

    // 8. Campaigns
    const campaigns = [
      {
        name: 'Q3 Enterprise AI & Systems Outreach',
        hiringType: 'FULL_TIME',
        status: 'ACTIVE',
        templateReference: 'enterprise_first_touch_v1'
      },
      {
        name: 'FinTech Platform Growth Sprint',
        hiringType: 'CONTRACT',
        status: 'ACTIVE',
        templateReference: 'fintech_specialist_v2'
      },
      {
        name: 'Campus Tech Leadership 2026',
        hiringType: 'CAMPUS_DRIVE',
        status: 'DRAFT',
        templateReference: 'campus_drive_outreach'
      }
    ];

    for (const c of campaigns) {
      await client.query(`
        INSERT INTO campaigns (name, hiring_type, status, is_active, template_reference)
        VALUES ($1, $2, $3, true, $4);
      `, [c.name, c.hiringType, c.status, c.templateReference]);
    }
    console.log('[SEED] 3 Campaigns seeded.');

    // 9. Meeting for Swiggy lead
    const swiggyLeadId = leadMap['swiggy.com'];
    if (swiggyLeadId) {
      await client.query(`
        INSERT INTO meetings (lead_id, meeting_time, meeting_link, notes)
        VALUES ($1, NOW() + INTERVAL '2 days', 'https://meet.google.com/hgr-tech-eval', 'Introductory hiring alignment meeting with Amit Patel regarding Platform & DevOps lead openings.');
      `, [swiggyLeadId]);
    }
    console.log('[SEED] Meetings seeded.');

    // 10. Notifications
    const notifications = [
      {
        userId: adminId,
        type: 'MEETING_BOOKED',
        title: 'Meeting Scheduled',
        message: 'Meeting booked with Amit Patel from Swiggy for Platform Engineering Lead.',
        relatedType: 'leads',
        relatedId: swiggyLeadId
      },
      {
        userId: adminId,
        type: 'APPROVAL_PENDING',
        title: 'Draft Awaiting Approval',
        message: 'New outreach email draft generated for Neha Sharma at Google LLC.',
        relatedType: 'approval_queue',
        relatedId: leadMap['google.com']
      },
      {
        userId: adminId,
        type: 'LEAD_STAGE_CHANGED',
        title: 'Client Won!',
        message: 'Zomato Limited has progressed to Client Won stage.',
        relatedType: 'leads',
        relatedId: leadMap['zomato.com']
      }
    ];

    for (const n of notifications) {
      await client.query(`
        INSERT INTO notifications (user_id, type, title, message, related_entity_type, related_entity_id, is_read)
        VALUES ($1, $2, $3, $4, $5, $6, false);
      `, [n.userId, n.type, n.title, n.message, n.relatedType, n.relatedId]);
    }
    console.log('[SEED] Notifications seeded.');

    console.log('[SEED] ALL MOCK DATA INSERTED SUCCESSFULLY!');
  } finally {
    await client.end();
  }
}

seed().catch((err) => {
  console.error('[SEED ERROR]', err);
  process.exit(1);
});
