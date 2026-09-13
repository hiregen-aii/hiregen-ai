const { scrapeHiringSignals } = require("./scraper.service");

let syncIntervalTimer = null;
let isSyncing = false;
let isEnabled = true;
let intervalMinutes = parseInt(process.env.AUTO_SYNC_INTERVAL_MINUTES || "10", 10);
if (isNaN(intervalMinutes) || intervalMinutes < 1) {
  intervalMinutes = 10;
}

let lastSyncAt = null;
let nextSyncAt = null;
let totalRuns = 0;
let lastResult = null;
let lastError = null;

/**
 * Executes one automatic ingestion cycle across open-web live job feeds.
 */
async function runAutoSyncCycle(reason = "INTERVAL") {
  if (isSyncing) {
    return {
      status: "SKIPPED_ALREADY_RUNNING",
      message: "Sync cycle already in progress.",
    };
  }

  isSyncing = true;
  lastError = null;

  try {
    const stats = await scrapeHiringSignals();

    // Auto-generate outreach drafts and handle autopilot dispatch for high-fit leads
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

    return {
      status: "SUCCESS",
      reason,
      syncedAt: lastSyncAt,
      stats,
    };
  } catch (err) {
    lastError = err.message;
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
 */
function startAutoSync(customIntervalMinutes) {
  if (customIntervalMinutes && !isNaN(customIntervalMinutes) && customIntervalMinutes > 0) {
    intervalMinutes = customIntervalMinutes;
  }

  isEnabled = true;
  if (syncIntervalTimer) {
    clearInterval(syncIntervalTimer);
  }

  nextSyncAt = new Date(Date.now() + intervalMinutes * 60 * 1000).toISOString();

  syncIntervalTimer = setInterval(() => {
    runAutoSyncCycle("SCHEDULED_INTERVAL").catch((err) => {
      console.warn("[AUTO-SYNC] Scheduled run encountered error:", err.message);
    });
  }, intervalMinutes * 60 * 1000);

  // Unref so the interval timer does not keep Node.js process alive during graceful shutdown / tests
  if (syncIntervalTimer && typeof syncIntervalTimer.unref === "function") {
    syncIntervalTimer.unref();
  }
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
  nextSyncAt = null;
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
