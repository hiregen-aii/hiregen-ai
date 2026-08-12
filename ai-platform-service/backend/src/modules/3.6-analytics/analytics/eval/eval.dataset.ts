import type { GoldenCase } from "./eval.types";

export const goldenDataset: GoldenCase[] = [
  {
    id: "case-001",
    company: "Example Technologies",
    role: "Software Engineering Intern",
    hiringType: "intern",
    input: "Example Technologies is hiring Software Engineering Interns.",
    expectedAttributes: {
      hiringType: "intern",
      role: "Software Engineering Intern",
    },
  },
  {
    id: "case-002",
    company: "Example Analytics",
    role: "Backend Engineer",
    hiringType: "full-time",
    input: "Example Analytics is hiring Backend Engineers.",
    expectedAttributes: {
      hiringType: "full-time",
      role: "Backend Engineer",
    },
  },
];
