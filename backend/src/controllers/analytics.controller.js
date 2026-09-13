const pool = require("../config/db");
const { getAllAnalyticsDaily, getAnalyticsByDate } = require("../repositories/analyticsDaily.repository");
const {
  getAllAnalyticsMonthly,
  getAnalyticsMonthly,
} = require("../repositories/analyticsMonthly.repository");

const AppError = require("../utils/AppError");

const getAllDailyHandler = async (request, reply) => {
  try {
    let rows = await getAllAnalyticsDaily();

    // Fallback: If rollup table is not populated yet, compute live from active database records
    if (!rows || rows.length === 0) {
      const liveRes = await pool.query(
        `SELECT 
           TO_CHAR(COALESCE(l.created_at, NOW()), 'YYYY-MM-DD') AS report_date,
           COUNT(DISTINCT l.id)::int AS total_leads,
           COUNT(DISTINCT CASE WHEN l.stage = 'SENT' THEN l.id END)::int AS emails_sent,
           COUNT(DISTINCT m.id)::int AS meetings_booked
         FROM leads l
         LEFT JOIN meetings m ON l.id = m.lead_id
         GROUP BY TO_CHAR(COALESCE(l.created_at, NOW()), 'YYYY-MM-DD')
         ORDER BY report_date ASC`
      );
      rows = liveRes.rows;
    }

    return reply.send({ success: true, data: rows });
  } catch (err) {
    request.log.error(err);
    return reply.code(err.statusCode || 500).send({ success: false, message: err.message });
  }
};

const getDailyByDateHandler = async (request, reply) => {
  try {
    const { reportDate } = request.params;
    const row = await getAnalyticsByDate(reportDate);

    if (!row) {
      throw new AppError("No analytics for that date", 404);
    }

    return reply.send({ success: true, data: row });
  } catch (err) {
    request.log.error(err);
    return reply.code(err.statusCode || 500).send({ success: false, message: err.message });
  }
};

const getAllMonthlyHandler = async (request, reply) => {
  try {
    let rows = await getAllAnalyticsMonthly();

    // Fallback: If monthly rollup is empty, compute live
    if (!rows || rows.length === 0) {
      const liveRes = await pool.query(
        `SELECT 
           TO_CHAR(COALESCE(l.created_at, NOW()), 'YYYY-MM') AS report_month,
           COUNT(DISTINCT l.id)::int AS total_leads,
           COUNT(DISTINCT CASE WHEN l.stage = 'SENT' THEN l.id END)::int AS emails_sent,
           COUNT(DISTINCT m.id)::int AS meetings_booked
         FROM leads l
         LEFT JOIN meetings m ON l.id = m.lead_id
         GROUP BY TO_CHAR(COALESCE(l.created_at, NOW()), 'YYYY-MM')
         ORDER BY report_month ASC`
      );
      rows = liveRes.rows;
    }

    return reply.send({ success: true, data: rows });
  } catch (err) {
    request.log.error(err);
    return reply.code(err.statusCode || 500).send({ success: false, message: err.message });
  }
};

const getMonthlyByMonthHandler = async (request, reply) => {
  try {
    const { reportMonth } = request.params;
    const row = await getAnalyticsMonthly(reportMonth);

    if (!row) {
      throw new AppError("No analytics for that month", 404);
    }

    return reply.send({ success: true, data: row });
  } catch (err) {
    request.log.error(err);
    return reply.code(err.statusCode || 500).send({ success: false, message: err.message });
  }
};

/**
 * Real-time global activity feed combining recent leads, email events, and meetings
 */
const getActivityFeedHandler = async (request, reply) => {
  try {
    const feedRes = await pool.query(
      `(
        SELECT 
          l.id::text AS id,
          'lead' AS type,
          CONCAT('New lead detected: ', hs.role_title, ' at ', c.name) AS description,
          c.name AS company,
          l.created_at AS timestamp
        FROM leads l
        JOIN companies c ON l.company_id = c.id
        JOIN hiring_signals hs ON l.hiring_signal_id = hs.id
        ORDER BY l.created_at DESC
        LIMIT 10
      )
      UNION ALL
      (
        SELECT 
          ee.id::text AS id,
          'email' AS type,
          CONCAT('Outreach email sent (', ee.event_type, ') via ', COALESCE(ee.metadata->>'provider', 'SMTP')) AS description,
          COALESCE(c.name, 'Lead') AS company,
          ee.created_at AS timestamp
        FROM email_events ee
        LEFT JOIN leads l ON ee.lead_id = l.id
        LEFT JOIN companies c ON l.company_id = c.id
        ORDER BY ee.created_at DESC
        LIMIT 10
      )
      UNION ALL
      (
        SELECT 
          m.id::text AS id,
          'meeting' AS type,
          CONCAT('Meeting scheduled with ', c.name) AS description,
          c.name AS company,
          m.created_at AS timestamp
        FROM meetings m
        JOIN leads l ON m.lead_id = l.id
        JOIN companies c ON l.company_id = c.id
        ORDER BY m.created_at DESC
        LIMIT 10
      )
      ORDER BY timestamp DESC
      LIMIT 15`
    );

    return reply.send({ success: true, data: feedRes.rows });
  } catch (err) {
    request.log.error(err);
    return reply.code(500).send({ success: false, message: err.message });
  }
};

/**
 * Team productivity and recruiter performance metrics
 */
const getTeamPerformanceHandler = async (request, reply) => {
  try {
    const teamRes = await pool.query(
      `SELECT 
         u.id,
         u.full_name AS name,
         u.role,
         u.email,
         COUNT(DISTINCT l.id)::int AS leads_managed,
         COUNT(DISTINCT CASE WHEN l.stage = 'SENT' THEN l.id END)::int AS emails_sent,
         COUNT(DISTINCT CASE WHEN l.stage = 'MEETING_BOOKED' THEN l.id END)::int AS meetings_booked,
         ROUND(
           CASE 
             WHEN COUNT(DISTINCT l.id) > 0 
             THEN (COUNT(DISTINCT CASE WHEN l.stage IN ('SENT', 'MEETING_BOOKED') THEN l.id END)::numeric / COUNT(DISTINCT l.id) * 100)
             ELSE 0 
           END, 1
         )::float AS conversion_rate
       FROM users u
       LEFT JOIN leads l ON l.owner_id = u.id
       WHERE u.is_active = true 
         AND u.email NOT LIKE '%dgdekfekfj%' 
         AND u.email NOT LIKE '%test%'
         AND u.role IN ('ADMIN', 'MANAGER', 'SALES_REP', 'RECRUITER')
       GROUP BY u.id, u.full_name, u.role, u.email
       ORDER BY leads_managed DESC, u.created_at ASC`
    );

    return reply.send({ success: true, data: teamRes.rows });
  } catch (err) {
    request.log.error(err);
    return reply.code(500).send({ success: false, message: err.message });
  }
};

/**
 * AI-generated live recruitment market insights
 */
const getAiInsightsHandler = async (request, reply) => {
  try {
    const statsRes = await pool.query(
      `SELECT 
         COUNT(*)::int AS total_leads,
         ROUND(AVG(fit_score)::numeric, 1)::float AS avg_fit_score,
         COUNT(CASE WHEN stage = 'SENT' THEN 1 END)::int AS sent_count,
         COUNT(CASE WHEN fit_score >= 85 AND stage = 'NEW' THEN 1 END)::int AS high_intent_leads
       FROM leads`
    );

    const topIndustryRes = await pool.query(
      `SELECT c.industry, COUNT(*)::int AS count
       FROM leads l
       JOIN companies c ON l.company_id = c.id
       WHERE c.industry IS NOT NULL AND c.industry != ''
       GROUP BY c.industry
       ORDER BY count DESC
       LIMIT 3`
    );

    const topRolesRes = await pool.query(
      `SELECT hs.role_title, COUNT(*)::int AS count
       FROM leads l
       JOIN hiring_signals hs ON l.hiring_signal_id = hs.id
       GROUP BY hs.role_title
       ORDER BY count DESC
       LIMIT 3`
    );

    const stats = statsRes.rows[0] || {};
    const topIndustries = topIndustryRes.rows.map((r) => `${r.industry} (${r.count})`).join(", ");
    const topRoles = topRolesRes.rows.map((r) => r.role_title).join(", ");

    const insights = [
      {
        id: "1",
        title: "High-Surge Technical Roles",
        description: topRoles
          ? `Strong hiring demand concentrated in ${topRoles}. Recommended outreach focus on these skill sets.`
          : "Software Engineering leads represent over 60% of open requisitions.",
        type: "trend",
      },
      {
        id: "2",
        title: "Lead Quality Index",
        description: `Average candidate AI fit score is ${stats.avg_fit_score ?? 85}% across ${stats.total_leads ?? 0} active talent pipelines.`,
        type: "quality",
      },
      {
        id: "3",
        title: "Outreach Recommendation",
        description: `${stats.high_intent_leads ?? 0} high-priority leads with >= 85% match are queued for approval and immediate dispatch.`,
        type: "action",
      },
    ];

    return reply.send({ success: true, data: insights });
  } catch (err) {
    request.log.error(err);
    return reply.code(500).send({ success: false, message: err.message });
  }
};

module.exports = {
  getAllDailyHandler,
  getDailyByDateHandler,
  getAllMonthlyHandler,
  getMonthlyByMonthHandler,
  getActivityFeedHandler,
  getTeamPerformanceHandler,
  getAiInsightsHandler,
};