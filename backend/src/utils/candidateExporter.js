const ExcelJS = require("exceljs");
const { sanitizeFormula } = require("./dedupe");

/**
 * Serializes candidates into UTF-8 CSV with Byte Order Mark (BOM),
 * sorted by Fit Score descending, and shields against CSV formula injection attacks.
 */
function serializeCandidatesToCsv(candidates = []) {
  const sorted = [...candidates].sort(
    (a, b) => Number(b.fit_score || 0) - Number(a.fit_score || 0)
  );

  const headers = [
    "Candidate Name",
    "Preferred Role",
    "Fit Match (%)",
    "Status",
    "Notice Period",
    "Experience (Years)",
    "Expected Salary",
    "Location",
    "Key Skills",
    "Email",
    "Phone",
    "Current Company",
    "Work Type",
    "Verified",
    "Source",
    "LinkedIn URL",
    "GitHub URL",
    "Portfolio URL",
    "Candidate Summary / Bio",
    "Added Date",
  ];

  const escapeField = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val);
    const sanitized = sanitizeFormula(str);
    return `"${sanitized.replace(/"/g, '""')}"`;
  };

  const rows = sorted.map((c) => {
    const skillsStr = Array.isArray(c.skills)
      ? c.skills.join(", ")
      : String(c.skills || "");
    const addedDate = c.created_at
      ? new Date(c.created_at).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0];

    const fitFormatted = `${Number(c.fit_score || 85).toFixed(1)}%`;

    return [
      escapeField(c.full_name || "Candidate"),
      escapeField(c.preferred_role || c.headline || "Software Engineer"),
      escapeField(fitFormatted),
      escapeField(c.status || "AVAILABLE"),
      escapeField(c.notice_period || "Immediate (Serving Notice)"),
      escapeField(c.hiring_type === "INTERN" || c.experience_years === 0 ? "Intern / Student" : c.experience_years === 1 ? "1 Year (Fresher)" : `${c.experience_years ?? 3} Years`),
      escapeField(c.expected_salary || "₹24 - 36 LPA"),
      escapeField(c.location || "Bangalore, India"),
      escapeField(skillsStr),
      escapeField(c.email || ""),
      escapeField(c.phone || "-"),
      escapeField(c.current_company || "Independent Specialist"),
      escapeField(c.hiring_type || "FULL_TIME"),
      escapeField(c.verified ? "Verified Active" : "Unverified"),
      escapeField(c.source || "India Tech Talent Radar"),
      escapeField(c.linkedin_url || ""),
      escapeField(c.github_url || ""),
      escapeField(c.portfolio_url || ""),
      escapeField(c.bio || ""),
      escapeField(addedDate),
    ].join(",");
  });

  const BOM = "\uFEFF";
  return BOM + [headers.map((h) => `"${h}"`).join(","), ...rows].join("\r\n");
}

/**
 * Builds a styled, enterprise-grade Excel (.xlsx) workbook for Candidates.
 * Sorted by Fit Score descending, auto-adjusted columns with padding,
 * wrapText enabled, and elegant executive dark slate header theme.
 */
async function buildCandidatesExcelWorkbook(candidates = []) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "HireGen AI Recruitment Intelligence";
  workbook.lastModifiedBy = "HireGen AI Platform";
  workbook.created = new Date();
  workbook.modified = new Date();

  const worksheet = workbook.addWorksheet("India Tech Talent Pool", {
    views: [{ state: "frozen", ySplit: 1, activeCell: "A2" }],
    properties: { tabColor: { argb: "FF4F46E5" } }, // Indigo tab
  });

  // Sort candidates by Fit Score descending (highest match on top)
  const sorted = [...candidates].sort(
    (a, b) => Number(b.fit_score || 0) - Number(a.fit_score || 0)
  );

  worksheet.columns = [
    { header: "Candidate Name", key: "full_name", width: 26 },
    { header: "Preferred Role", key: "preferred_role", width: 32 },
    { header: "Fit Match", key: "fit_score", width: 14 },
    { header: "Status", key: "status", width: 16 },
    { header: "Notice Period", key: "notice_period", width: 22 },
    { header: "Experience", key: "experience_years", width: 15 },
    { header: "Expected CTC", key: "expected_salary", width: 18 },
    { header: "Location (India)", key: "location", width: 25 },
    { header: "Core Skills", key: "skills", width: 40 },
    { header: "Email Address", key: "email", width: 32 },
    { header: "Phone", key: "phone", width: 18 },
    { header: "Current Company", key: "current_company", width: 26 },
    { header: "Work Type", key: "hiring_type", width: 16 },
    { header: "Verified", key: "verified", width: 16 },
    { header: "Source", key: "source", width: 25 },
    { header: "LinkedIn Profile", key: "linkedin_url", width: 35 },
    { header: "GitHub Profile", key: "github_url", width: 35 },
    { header: "Portfolio / Website", key: "portfolio_url", width: 30 },
    { header: "Candidate Summary", key: "bio", width: 50 },
    { header: "Ingested Date", key: "created_at", width: 16 },
  ];

  // Executive Dark Slate Header #0F172A
  const headerRow = worksheet.getRow(1);
  headerRow.height = 32;
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0F172A" },
    };
    cell.font = {
      name: "Segoe UI",
      size: 11,
      bold: true,
      color: { argb: "FFFFFFFF" },
    };
    cell.alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: false,
    };
    cell.border = {
      bottom: { style: "medium", color: { argb: "FF4F46E5" } },
    };
  });

  // Enable Excel Auto-Filter across all columns
  worksheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: 20 },
  };

  sorted.forEach((cand, index) => {
    const rowNumber = index + 2;
    const skillsStr = Array.isArray(cand.skills)
      ? cand.skills.join(", ")
      : String(cand.skills || "");

    const fitNum = Number(cand.fit_score || 85);
    const fitStr = `${fitNum.toFixed(1)}%`;

    const rowData = {
      full_name: sanitizeFormula(cand.full_name || "Candidate"),
      preferred_role: sanitizeFormula(cand.preferred_role || cand.headline || "Software Engineer"),
      fit_score: fitStr,
      status: sanitizeFormula(cand.status || "AVAILABLE"),
      notice_period: sanitizeFormula(cand.notice_period || "Immediate (Serving Notice)"),
      experience_years: cand.hiring_type === "INTERN" || cand.experience_years === 0 ? "Intern / Student" : cand.experience_years === 1 ? "1 Year (Fresher)" : `${cand.experience_years ?? 3} Years`,
      expected_salary: sanitizeFormula(cand.expected_salary || "₹24 - 36 LPA"),
      location: sanitizeFormula(cand.location || "Bangalore, India"),
      skills: sanitizeFormula(skillsStr),
      email: sanitizeFormula(cand.email || ""),
      phone: sanitizeFormula(cand.phone || "-"),
      current_company: sanitizeFormula(cand.current_company || "Independent Specialist"),
      hiring_type: sanitizeFormula(cand.hiring_type || "FULL_TIME"),
      verified: cand.verified ? "Verified Active" : "Unverified",
      source: sanitizeFormula(cand.source || "India Tech Talent Radar"),
      linkedin_url: sanitizeFormula(cand.linkedin_url || "-"),
      github_url: sanitizeFormula(cand.github_url || "-"),
      portfolio_url: sanitizeFormula(cand.portfolio_url || "-"),
      bio: sanitizeFormula(cand.bio || "Active technical candidate open to new roles."),
      created_at: cand.created_at
        ? new Date(cand.created_at).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
    };

    const addedRow = worksheet.addRow(rowData);
    addedRow.height = 28;

    const isEven = rowNumber % 2 === 0;

    addedRow.eachCell((cell, colNumber) => {
      cell.font = { name: "Segoe UI", size: 10 };
      cell.alignment = {
        vertical: "middle",
        horizontal: [3, 4, 6, 13, 14, 20].includes(colNumber) ? "center" : "left",
        wrapText: [2, 9, 19].includes(colNumber),
      };

      // Alternating soft zebra row tint
      if (isEven) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF8FAFC" }, // Soft cool slate
        };
      }

      // Thin bottom border
      cell.border = {
        bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
      };

      // Special highlight for Fit Match column (col 3)
      if (colNumber === 3) {
        if (fitNum >= 90) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFDCFCE7" }, // Soft emerald
          };
          cell.font = { name: "Segoe UI", size: 10, bold: true, color: { argb: "FF15803D" } };
        } else if (fitNum >= 80) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFDBEAFE" }, // Soft blue
          };
          cell.font = { name: "Segoe UI", size: 10, bold: true, color: { argb: "FF1D4ED8" } };
        }
      }
    });
  });

  // Auto-adjust column widths based on maximum content length with generous padding
  worksheet.columns.forEach((column) => {
    let maxLen = column.header ? String(column.header).length : 12;
    column.eachCell({ includeEmpty: false }, (cell) => {
      const val = cell.value ? String(cell.value) : "";
      if (val.length > maxLen && val.length < 70) {
        maxLen = val.length;
      }
    });
    // Add generous padding and set reasonable min/max caps
    column.width = Math.min(65, Math.max(maxLen + 4, 15));
  });

  return workbook;
}

module.exports = {
  serializeCandidatesToCsv,
  buildCandidatesExcelWorkbook,
};
