const { scrapeHiringSignals } = require("./scraper.service");
const candidateService = require("./candidate.service");

let syncIntervalTimer = null;
let warmupTimer = null;
let isSyncing = false;
let isEnabled = true;

// Default to 60 minutes (1 hour) as requested for production schedule
let intervalMinutes = parseInt(process.env.AUTO_SYNC_INTERVAL_MINUTES || "60", 10);
if (isNaN(intervalMinutes) || intervalMinutes < 1) {
  intervalMinutes = 60;
}

let lastSyncAt = null;
let nextSyncAt = null;
let totalRuns = 0;
let lastResult = null;
let lastError = null;

/**
 * Executes one automatic ingestion cycle across open-web live job feeds and candidate talent.
 * Strictly targeted to India with 24-hour freshness.
 */
async function runAutoSyncCycle(reason = "INTERVAL") {
  if (isSyncing) {
    console.log("[AUTO-SYNC] Cycle skipped: Previous sync cycle is still running.");
    return {
      status: "SKIPPED_ALREADY_RUNNING",
      message: "Sync cycle already in progress.",
    };
  }

  isSyncing = true;
  lastError = null;
  console.log(`[AUTO-SYNC] Starting background sync cycle (${reason}) - Targeting India (24h Freshness)...`);

  try {
    // 1 & 2. Concurrently scrape Indian hiring signals and sync candidate talent pool
    const [leadResult, candidateResult] = await Promise.allSettled([
      scrapeHiringSignals({
        location: "India",
        query: "software engineer",
        hiringType: "",
      }),
      candidateService.syncIndianCandidates(),
    ]);

    const stats = leadResult.status === "fulfilled" ? leadResult.value : { newlyAdded: 0, error: leadResult.reason?.message };
    if (candidateResult.status === "fulfilled") {
      stats.candidates = candidateResult.value;
    } else {
      console.warn("[AUTO-SYNC] Candidate talent sync notice:", candidateResult.reason?.message);
    }

    // 3. Auto-generate outreach drafts and handle autopilot dispatch for high-fit leads
    try {
      const { syncDraftsForActiveLeads } = require("./outreachDraft.service");
      const draftStats = await syncDraftsForActiveLeads(25);
      stats.drafts = draftStats;
    } catch (draftErr) {
      console.warn("[AUTO-SYNC] Background draft sync notice:", draftErr.message);
    }

    lastSyncAt = new Date().toISOString();
    totalRuns++;
    lastResult = stats;

    if (isEnabled && syncIntervalTimer) {
      nextSyncAt = new Date(Date.now() + intervalMinutes * 60 * 1000).toISOString();
    } else {
      nextSyncAt = null;
    }

    console.log(
      `[AUTO-SYNC] Completed cycle #${totalRuns}: ${stats.newlyAdded || 0} leads added, ` +
      `${stats.candidates?.newlyAdded || 0} candidates ingested. Next run at: ${nextSyncAt}`
    );

    return {
      status: "SUCCESS",
      reason,
      syncedAt: lastSyncAt,
      stats,
    };
  } catch (err) {
    lastError = err.message;
    console.error("[AUTO-SYNC ERROR] Cycle encountered failure:", err.message);
    return {
      status: "ERROR",
      reason,
      error: err.message,
    };
  } finally {
    isSyncing = false;
  }
}

/**
 * Starts the automatic background sync schedule.
 * Defaults to 60-minute hourly cycle, with an immediate warmup run 12 seconds after launch.
 */
function startAutoSync(customIntervalMinutes) {
  if (customIntervalMinutes && !isNaN(customIntervalMinutes) && customIntervalMinutes > 0) {
    intervalMinutes = customIntervalMinutes;
  }

  isEnabled = true;
  if (syncIntervalTimer) {
    clearInterval(syncIntervalTimer);
  }
  if (warmupTimer) {
    clearTimeout(warmupTimer);
  }

  nextSyncAt = new Date(Date.now() + intervalMinutes * 60 * 1000).toISOString();

  // 1. Recurring 1-Hour Schedule
  syncIntervalTimer = setInterval(() => {
    runAutoSyncCycle("SCHEDULED_INTERVAL").catch((err) => {
      console.warn("[AUTO-SYNC] Scheduled run encountered error:", err.message);
    });
  }, intervalMinutes * 60 * 1000);

  if (syncIntervalTimer && typeof syncIntervalTimer.unref === "function") {
    syncIntervalTimer.unref();
  }

  // 2. Initial Warmup Run: Execute first cycle 12s after server startup so pipeline populates immediately
  warmupTimer = setTimeout(() => {
    runAutoSyncCycle("SERVER_STARTUP_WARMUP").catch((err) => {
      console.warn("[AUTO-SYNC] Startup warmup sync notice:", err.message);
    });
  }, 12000);

  if (warmupTimer && typeof warmupTimer.unref === "function") {
    warmupTimer.unref();
  }

  console.log(`[AUTO-SYNC] Initialized hourly background scraper (Interval: ${intervalMinutes}m). Initial warmup runs in 12s.`);
}

/**
 * Stops the automatic background sync schedule.
 */
function stopAutoSync() {
  isEnabled = false;
  if (syncIntervalTimer) {
    clearInterval(syncIntervalTimer);
    syncIntervalTimer = null;
  }
  if (warmupTimer) {
    clearTimeout(warmupTimer);
    warmupTimer = null;
  }
  nextSyncAt = null;
  console.log("[AUTO-SYNC] Background scheduler stopped.");
}

/**
 * Returns current status of the background auto-sync worker.
 */
function getAutoSyncStatus() {
  return {
    isEnabled,
    isSyncing,
    intervalMinutes,
    lastSyncAt,
    nextSyncAt,
    totalRuns,
    lastResult,
    lastError,
  };
}

/**
 * Triggers an on-demand sync cycle immediately.
 */
async function triggerImmediateSync() {
  return await runAutoSyncCycle("MANUAL_TRIGGER");
}

module.exports = {
  startAutoSync,
  stopAutoSync,
  getAutoSyncStatus,
  triggerImmediateSync,
  runAutoSyncCycle,
};
