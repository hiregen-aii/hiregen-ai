import { useState, useEffect } from "react";
import {
  Bot,
  Brain,
  FileSearch,
  Mail,
  Zap,
  CheckCircle2,
  AlertCircle,
  Key,
  Globe,
  Sliders,
  Sparkles,
  Eye,
  EyeOff,
  Cpu,
} from "lucide-react";

import { useSettings } from "@/context/SettingsContext";
import { useNotifications } from "@/context/NotificationContext";
import { fetchAutopilotStatus, updateAutopilotConfig } from "@/services/autopilot.service";
import {
  fetchAiSettings,
  saveAiSettings,
  testAiConnection,
  type AiSettingsData,
} from "@/services/aiSettings.service";

interface AIOption {
  key: "resumeScreening" | "candidateRanking" | "emailSuggestions";
  title: string;
  description: string;
  icon: typeof FileSearch;
}

const aiOptions: AIOption[] = [
  {
    key: "resumeScreening",
    title: "AI Resume Screening",
    description: "Automatically evaluate tech stacks and candidate relevance using active AI engine.",
    icon: FileSearch,
  },
  {
    key: "candidateRanking",
    title: "Candidate Ranking",
    description: "Rank candidates dynamically based on verified GitHub commit velocity and role match.",
    icon: Brain,
  },
  {
    key: "emailSuggestions",
    title: "Executive Email Drafting",
    description: "Generate tailored B2B outreach headhunting copy for open engineering requisitions.",
    icon: Mail,
  },
];

const AISettings = () => {
  const { settings, updateAI } = useSettings();
  const { addNotification } = useNotifications();

  const [aiSettings, setAISettings] = useState(settings.ai);
  const [isAutopilot, setIsAutopilot] = useState(false);

  // Dynamic Backend AI Engine State
  const [serverAi, setServerAi] = useState<AiSettingsData | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string>("GROQ");
  const [selectedModel, setSelectedModel] = useState<string>("groq/compound-mini");
  const [apiKeyInput, setApiKeyInput] = useState<string>("");
  const [customBaseUrl, setCustomBaseUrl] = useState<string>("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [temperature, setTemperature] = useState<number>(0.35);

  // Testing & Saving state
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Load server-side AI configuration & Autopilot on mount
  useEffect(() => {
    fetchAutopilotStatus()
      .then((status) => {
        setIsAutopilot(status.isEnabled);
        if (status.minFitScore) {
          setAISettings((prev) => ({ ...prev, matchScore: status.minFitScore }));
        }
      })
      .catch(() => {});

    fetchAiSettings()
      .then((data) => {
        setServerAi(data);
        setSelectedProvider(data.provider || "GROQ");
        setSelectedModel(data.model || "groq/compound-mini");
        setCustomBaseUrl(data.customBaseUrl || "");
        setTemperature(data.temperature ?? 0.35);
      })
      .catch((err) => {
        console.warn("Could not load backend AI settings:", err);
      });
  }, []);

  const activeProviderMeta = serverAi?.availableProviders.find((p) => p.id === selectedProvider);

  // Handle provider switch
  const handleProviderChange = (newProvider: string) => {
    setSelectedProvider(newProvider);
    const meta = serverAi?.availableProviders.find((p) => p.id === newProvider);
    if (meta) {
      setSelectedModel(meta.defaultModel);
      if (newProvider === "CUSTOM") {
        setCustomBaseUrl(meta.defaultBaseUrl || "http://localhost:11434/v1");
      }
    }
    setTestResult(null);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testAiConnection({
        provider: selectedProvider,
        model: selectedModel,
        apiKey: apiKeyInput || undefined,
        customBaseUrl: selectedProvider === "CUSTOM" ? customBaseUrl : undefined,
      });
      setTestResult({
        success: true,
        message: res.message || `Connected to ${selectedProvider} in ${res.latencyMs}ms`,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Connection failed";
      setTestResult({
        success: false,
        message,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      // 1. Save to Backend Database & In-memory cache
      const updatedAi = await saveAiSettings({
        provider: selectedProvider,
        model: selectedModel,
        apiKey: apiKeyInput.trim() || undefined,
        customBaseUrl: selectedProvider === "CUSTOM" ? customBaseUrl.trim() : undefined,
        temperature,
      });

      setServerAi(updatedAi);
      if (apiKeyInput.trim()) {
        setApiKeyInput(""); // Clear plain text input after saving
      }

      // 2. Sync Autopilot & UI preferences
      updateAI({
        ...aiSettings,
        preferredModel: selectedModel,
      });

      await updateAutopilotConfig({
        enabled: isAutopilot,
        minFitScore: aiSettings.matchScore,
      });

      addNotification({
        title: "AI Engine & Preferences Saved",
        message: `Active AI provider set to ${selectedProvider} (${selectedModel}). Changes take effect across all drafting & intelligence workflows immediately.`,
        type: "success",
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save AI configuration";
      addNotification({
        title: "Save Failed",
        message,
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSetting = (key: AIOption["key"]) => {
    setAISettings((previous) => ({
      ...previous,
      [key]: !previous[key],
    }));
  };

  return (
    <div className="space-y-6">
      {/* 1. Primary AI Provider & Engine Orchestrator Card */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-[#111827]">
        <div className="border-b border-slate-200 p-6 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-violet-100 p-3 dark:bg-violet-900/30">
                <Cpu size={22} className="text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  AI Model Engine & Provider
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                    Live Backend Linked
                  </span>
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Switch between Groq, Gemini, OpenAI, Grok, or Custom Local LLMs without code changes or redeployments.
                </p>
              </div>
            </div>
            {serverAi?.hasKey && (
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                <CheckCircle2 size={14} />
                Key Configured ({serverAi.maskedKey || "Active"})
              </span>
            )}
          </div>
        </div>

        <div className="space-y-6 p-6">
          {/* Provider Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-900 dark:text-white">
                Active AI Provider
              </label>
              <select
                value={selectedProvider}
                onChange={(e) => handleProviderChange(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-medium outline-none transition-all focus:border-violet-500 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
              >
                {serverAi?.availableProviders.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                )) || (
                  <>
                    <option value="GROQ">Groq Cloud (Fastest Inference)</option>
                    <option value="GEMINI">Google Gemini</option>
                    <option value="OPENAI">OpenAI (ChatGPT)</option>
                    <option value="GROK">xAI Grok</option>
                    <option value="CUSTOM">Custom OpenAI-Compatible / Local</option>
                  </>
                )}
              </select>
              <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                Determines which inference API executes automated email drafting and company research briefs.
              </p>
            </div>

            {/* Model Selection */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-900 dark:text-white">
                Selected Model
              </label>
              {selectedProvider === "CUSTOM" ? (
                <input
                  type="text"
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  placeholder="e.g. mistral, llama3, qwen-2.5"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-violet-500 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                />
              ) : (
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-medium outline-none transition-all focus:border-violet-500 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                >
                  {activeProviderMeta?.models.map((m) => (
                    <option key={m} value={m}>
                      {m} {m === activeProviderMeta.defaultModel ? "(Recommended)" : ""}
                    </option>
                  )) || (
                    <option value={selectedModel}>{selectedModel}</option>
                  )}
                </select>
              )}
              <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                Model family used for prompt generation, reasoning, and token generation speed.
              </p>
            </div>
          </div>

          {/* API Key Override & Custom Endpoint */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div>
              <label className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-900 dark:text-white">
                <span className="flex items-center gap-1.5">
                  <Key size={15} className="text-violet-500" />
                  Provider API Key
                </span>
                {serverAi?.hasKey && (
                  <span className="text-xs font-normal text-slate-400">
                    Leave blank to keep existing key
                  </span>
                )}
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? "text" : "password"}
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder={serverAi?.hasKey ? `Existing key active (${serverAi.maskedKey})` : "Enter your API key (e.g. gsk_...)"}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-11 text-sm outline-none transition-all focus:border-violet-500 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                Saved securely in database system settings. Never exposed in client bundles.
              </p>
            </div>

            {/* Custom Base URL (Visible for CUSTOM or override) */}
            <div>
              <label className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-900 dark:text-white">
                <Globe size={15} className="text-violet-500" />
                API Base URL {selectedProvider !== "CUSTOM" && "(Optional Override)"}
              </label>
              <input
                type="text"
                value={customBaseUrl}
                onChange={(e) => setCustomBaseUrl(e.target.value)}
                placeholder={activeProviderMeta?.defaultBaseUrl || "https://api.groq.com/openai/v1"}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-violet-500 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
              />
              <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                Endpoint URL for the provider. Useful for private proxies, LiteLLM, Ollama, or vLLM instances.
              </p>
            </div>
          </div>

          {/* Test Connection Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/40">
            <div className="flex items-center gap-3">
              <Sparkles size={18} className="text-violet-600 dark:text-violet-400" />
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  Verify Model Connectivity
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Sends a lightweight probe to {selectedProvider} ({selectedModel}) to verify keys and latency.
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={isTesting}
              onClick={handleTestConnection}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-violet-200 bg-white px-4 py-2 text-xs font-semibold text-violet-700 shadow-sm transition hover:bg-violet-50 disabled:opacity-50 dark:border-violet-800 dark:bg-slate-900 dark:text-violet-300 dark:hover:bg-violet-900/30"
            >
              {isTesting ? "Testing..." : "Test Connection"}
            </button>
          </div>

          {/* Test Result Message */}
          {testResult && (
            <div
              className={`flex items-center gap-2.5 rounded-xl p-3.5 text-sm ${
                testResult.success
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-300"
                  : "bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/30 dark:border-rose-800 dark:text-rose-300"
              }`}
            >
              {testResult.success ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <span>{testResult.message}</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Recruitment Intelligence Features */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-[#111827]">
        <div className="border-b border-slate-200 p-6 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-violet-100 p-3 dark:bg-violet-900/30">
              <Bot size={22} className="text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Autonomous Workflow Controls
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Configure candidate matching thresholds, resume screening, and automatic dispatch.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6 p-6">
          {aiOptions.map((option) => {
            const Icon = option.icon;
            return (
              <div
                key={option.key}
                className="flex items-center justify-between rounded-xl border border-slate-200 p-4 dark:border-slate-700"
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-violet-100 p-3 dark:bg-violet-900/30">
                    <Icon size={20} className="text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {option.title}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {option.description}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleSetting(option.key)}
                  className={`relative h-7 w-14 rounded-full transition-all duration-300 ${
                    aiSettings[option.key] ? "bg-violet-600" : "bg-slate-300 dark:bg-slate-600"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all duration-300 ${
                      aiSettings[option.key] ? "left-8" : "left-1"
                    }`}
                  />
                </button>
              </div>
            );
          })}

          {/* Autopilot Outreach Dispatch Toggle */}
          <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4 dark:border-slate-700">
            <div className="flex items-center gap-4">
              <div
                className={`rounded-lg p-3 ${
                  isAutopilot
                    ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : "bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400"
                }`}
              >
                <Zap size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    Autopilot Outreach Dispatch
                  </h3>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      isAutopilot
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                  >
                    {isAutopilot ? "Autonomous Active" : "Manual Review"}
                  </span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Automatically send outreach emails to candidates meeting or exceeding the match score threshold.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsAutopilot(!isAutopilot)}
              className={`relative h-7 w-14 rounded-full transition-all duration-300 ${
                isAutopilot ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-600"
              }`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all duration-300 ${
                  isAutopilot ? "left-8" : "left-1"
                }`}
              />
            </button>
          </div>

          {/* Match Score */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders size={18} className="text-violet-500" />
                Match Score Threshold
              </h3>
              <span className="rounded-lg bg-violet-100 px-3 py-1 text-sm font-semibold text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
                {aiSettings.matchScore}%
              </span>
            </div>

            <input
              type="range"
              min={50}
              max={100}
              value={aiSettings.matchScore}
              onChange={(e) =>
                setAISettings((previous) => ({
                  ...previous,
                  matchScore: Number(e.target.value),
                }))
              }
              className="w-full accent-violet-600"
            />
          </div>

          {/* Save Button */}
          <div className="flex justify-end border-t border-slate-200 pt-6 dark:border-slate-700">
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSaveAll}
              className="flex items-center gap-2 rounded-xl bg-violet-600 px-7 py-3 font-semibold text-white transition-all duration-300 hover:bg-violet-700 hover:shadow-lg disabled:opacity-50"
            >
              <Bot size={18} />
              {isSaving ? "Saving Configuration..." : "Save AI Settings"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AISettings;