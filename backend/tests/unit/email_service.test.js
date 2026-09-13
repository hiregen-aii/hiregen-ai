const test = require('node:test');
const assert = require('node:assert/strict');
const { sendOutreachEmail, getSmtpTransporter } = require('../../src/services/email.service');
const { createFallbackDraft, generateOutreachContent } = require('../../src/services/outreachDraft.service');

test('Email Service: fails if required fields are missing', async () => {
  await assert.rejects(
    async () => {
      await sendOutreachEmail({ to: '', subject: 'Test', body: 'Hello' });
    },
    { message: /Recipient email \(to\), subject, and body are required/ }
  );

  await assert.rejects(
    async () => {
      await sendOutreachEmail({ to: 'user@example.com', subject: '', body: 'Hello' });
    },
    { message: /Recipient email \(to\), subject, and body are required/ }
  );
});

test('Email Service: safe simulation mode sends without crashing', async () => {
  const result = await sendOutreachEmail({
    to: 'candidate@company.com',
    subject: 'Senior Full Stack Opportunity',
    body: 'Hi, we are impressed with your profile.',
  });

  assert.equal(result.success, true);
  assert.equal(result.simulated, true);
  assert.ok(result.messageId.startsWith('sim_'));
  assert.equal(result.provider, 'SIMULATION');
});

test('Outreach Draft Service: creates professional fallback email draft', () => {
  const draft = createFallbackDraft({
    companyName: 'Acme Corp',
    contactName: 'Sarah Connor',
    roleTitle: 'Lead DevOps Engineer',
    industry: 'Cloud Security',
  });

  assert.ok(draft.subject.includes('Lead DevOps Engineer'));
  assert.ok(draft.subject.includes('Acme Corp'));
  assert.ok(draft.body.includes('Sarah Connor'));
  assert.ok(draft.body.includes('Cloud Security'));
  assert.ok(draft.body.includes('HireGen AI'));
});

test('Outreach Content Generator: generates valid subject and body', async () => {
  const content = await generateOutreachContent({
    companyName: 'Tech Innovators',
    contactName: 'Alex Mercer',
    roleTitle: 'Backend Architect',
    industry: 'FinTech',
  });

  assert.ok(content.subject.length > 5);
  assert.ok(content.body.length > 20);
});
