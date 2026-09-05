export interface Lead {
  id: number;
  company: string;
  contact: string;
  designation: string;
  email: string;
  phone: string;
  website: string;
  source: string;
  type: string;
  score: number;
  status: string;
}

export const leads: Lead[] = [
  {
    id: 1,
    company: "Google",
    contact: "Rahul Sharma",
    designation: "HR Manager",
    email: "rahul@google.com",
    phone: "+91 9876543210",
    website: "https://google.com",
    source: "LinkedIn",
    type: "Full Time",
    score: 92,
    status: "Contacted",
  },
  {
    id: 2,
    company: "Microsoft",
    contact: "Priya Patel",
    designation: "Talent Acquisition",
    email: "priya@microsoft.com",
    phone: "+91 9876501234",
    website: "https://microsoft.com",
    source: "Referral",
    type: "Internship",
    score: 88,
    status: "Replied",
  },
  {
    id: 3,
    company: "Amazon",
    contact: "Arjun Mehta",
    designation: "Recruiter",
    email: "arjun@amazon.com",
    phone: "+91 9123456789",
    website: "https://amazon.com",
    source: "Naukri",
    type: "Contract",
    score: 81,
    status: "Meeting",
  },
  {
    id: 4,
    company: "Adobe",
    contact: "Sneha Reddy",
    designation: "HR Executive",
    email: "sneha@adobe.com",
    phone: "+91 9001122334",
    website: "https://adobe.com",
    source: "LinkedIn",
    type: "Full Time",
    score: 76,
    status: "Proposal Sent",
  },
  {
    id: 5,
    company: "Infosys",
    contact: "Kiran Rao",
    designation: "Hiring Manager",
    email: "kiran@infosys.com",
    phone: "+91 9876512345",
    website: "https://infosys.com",
    source: "Indeed",
    type: "Internship",
    score: 95,
    status: "Client Won",
  },
];