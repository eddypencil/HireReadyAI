//src\features\interview\components\CodeQuestion.jsx
import { useEffect, useRef, useState } from "react";
import { executeCode } from "../services/wandbox.service";
import { Loader2, Play, Terminal, Clock, Cpu, CheckCircle2, XCircle, ChevronDown, ChevronRight, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

const PLACEHOLDER = {
  javascript: "// Write your JavaScript solution here\n\n",
  python: "# Write your Python solution here\n\n",
  java: "// Write your Java solution here\n\n",
  typescript: "// Write your TypeScript solution here\n\n",
  cpp: "// Write your C++ solution here\n\n",
  sql: "-- Write your SQL query here\n\n",
  default: "// Write your solution here\n\n",
};

const LANG_INFO = {
  javascript: { color: "#f7df1e", bg: "#f7df1e/10", label: "JavaScript" },
  python: { color: "#3776ab", bg: "#3776ab/10", label: "Python" },
  java: { color: "#ed8b00", bg: "#ed8b00/10", label: "Java" },
  typescript: { color: "#3178c6", bg: "#3178c6/10", label: "TypeScript" },
  cpp: { color: "#00599c", bg: "#00599c/10", label: "C++" },
  sql: { color: "#e38c00", bg: "#e38c00/10", label: "SQL" },
  default: { color: "#2a6f97", bg: "#2a6f97/10", label: "Code" },
};

export default function CodeQuestion({ question, onAnswer }) {
  const lang = question?.language?.toLowerCase() ?? "default";
  const langInfo = LANG_INFO[lang] ?? LANG_INFO.default;
  const placeholder = PLACEHOLDER[lang] ?? PLACEHOLDER.default;
  const { t } = useTranslation();

  const [code, setCode] = useState(placeholder);
  const [consoleOutput, setConsoleOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showExpected, setShowExpected] = useState(false);

  const isVisuals = question?.codeType === "visuals";

  const textareaRef = useRef(null);
  const lineNumRef = useRef(null);
  const consoleRef = useRef(null);

  useEffect(() => {
    const ta = textareaRef.current;
    const ln = lineNumRef.current;
    if (!ta || !ln) return;
    const onScroll = () => {
      ln.scrollTop = ta.scrollTop;
    };
    ta.addEventListener("scroll", onScroll);
    return () => ta.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [consoleOutput]);

  const handleKeyDown = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const { selectionStart, selectionEnd } = e.target;
      const newCode =
        code.slice(0, selectionStart) + "  " + code.slice(selectionEnd);
      setCode(newCode);
      requestAnimationFrame(() => {
        const ta = textareaRef.current;
        if (ta) {
          ta.selectionStart = selectionStart + 2;
          ta.selectionEnd = selectionStart + 2;
        }
      });
    }
  };

  const lines = code.split("\n");
  const isEmpty = code.trim() === "" || code.trim() === placeholder.trim();

  const handleRun = async () => {
    if (isEmpty) return;
    setIsRunning(true);
    setConsoleOutput(null);
    const result = await executeCode(code, lang);
    setConsoleOutput(result);
    setIsRunning(false);
  };

  const handleSubmit = () => {
    if (isEmpty) return;
    const answerPayload = [
      `CODE (${langInfo.label}):`,
      "```" + (lang === "default" ? "" : lang),
      code.trim(),
      "```",
      "",
    ];
    if (consoleOutput && !isVisuals) {
      answerPayload.push("EXECUTION OUTPUT:");
      answerPayload.push(`- Exit Code: ${consoleOutput.exitCode ?? "N/A"}`);
      answerPayload.push(`- Signal: ${consoleOutput.signal ?? "none"}`);
      answerPayload.push(`- CPU Time: ${consoleOutput.executionTime ?? "N/A"}ms`);
      answerPayload.push(`- Memory: ${consoleOutput.memoryUsage != null ? (consoleOutput.memoryUsage / 1024).toFixed(2) + " KB" : "N/A"}`);
      answerPayload.push(`- stdout: ${consoleOutput.stdout || "(empty)"}`);
      answerPayload.push(`- stderr: ${consoleOutput.stderr || "(none)"}`);
    }
    onAnswer(answerPayload.join("\n"));
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full">
      {/* ── Left: Editor ─────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col gap-3">
        <div className="rounded-xl overflow-hidden border border-border bg-card shadow-md shadow-cerulean-900/10">
          {/* Editor header */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-secondary/60 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="size-3 rounded-full bg-destructive/80" />
                <span className="size-3 rounded-full bg-warning" />
                <span className="size-3 rounded-full bg-success" />
              </div>
              <span
                className="text-xs font-mono font-medium px-2 py-0.5 rounded-md"
                style={{
                  color: langInfo.color,
                  background: `color-mix(in srgb, ${langInfo.color} 12%, transparent)`,
                }}
              >
                {langInfo.label}
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground">Tab = 2 spaces</span>
          </div>

          {/* Code area */}
          <div className="flex" style={{ minHeight: "280px", height: "auto" }}>
            <div
              ref={lineNumRef}
              className="flex-none px-3 pt-3 pb-3 overflow-hidden select-none text-right"
              style={{
                width: "44px",
                background: "var(--color-muted)",
                borderRight: "1px solid var(--color-border)",
                fontFamily:
                "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
                fontSize: "13px",
                lineHeight: "21px",
                color: "var(--color-muted-foreground)",
                opacity: 0.6,
              }}
            >
              {lines.map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              className="flex-1 resize-none focus:outline-none py-3 pl-4 pr-3"
              style={{
                background: "var(--color-card)",
                color: "var(--color-foreground)",
                fontFamily:
                "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
                fontSize: "13px",
                lineHeight: "21px",
                caretColor: "var(--color-ring)",
                minHeight: "280px",
              }}
            />
          </div>

          {/* Editor footer */}
          <div className="flex items-center justify-between px-4 py-2 bg-secondary/40 border-t border-border">
            <span className="text-[11px] text-muted-foreground font-mono">
              Ln {lines.length} · {code.length} chars
            </span>
            <span className="text-[11px] text-muted-foreground">UTF-8</span>
          </div>
        </div>

        {/* Action button */}
        {isVisuals ? (
          <button
            onClick={handleSubmit}
            disabled={isEmpty}
            className="flex items-center justify-center gap-2 w-full bg-primary text-primary-foreground rounded-lg px-4 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-primary/20"
          >
            <CheckCircle2 className="size-4" />
            Submit Answer →
          </button>
        ) : (
          <button
            onClick={handleRun}
            disabled={isEmpty || isRunning}
            className="flex items-center justify-center gap-2 w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:bg-secondary hover:border-primary/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isRunning ? (
              <Loader2 className="size-4 animate-spin text-primary" />
            ) : (
              <Play className="size-4 text-primary" />
            )}
            {isRunning ? "Running…" : "Run Code"}
          </button>
        )}

        {/* Expected output toggler */}
        {question?.expectedOutput && (
          <button
            onClick={() => setShowExpected(!showExpected)}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors px-1"
          >
            {showExpected ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
            Expected Output
          </button>
        )}
        {showExpected && question?.expectedOutput && (
          <pre className="rounded-lg border border-border bg-muted/50 p-3 text-xs font-mono text-foreground whitespace-pre-wrap overflow-x-auto">
            {question.expectedOutput}
          </pre>
        )}
      </div>

      {/* ── Right: Console / Output ──────────────────────────────────── */}
      {!isVisuals && (
        <div className="w-full lg:w-80 xl:w-96 flex flex-col gap-3">
          <div className="flex items-center gap-2 px-1">
            <Terminal className="size-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Console</span>
          </div>

          <div
            ref={consoleRef}
            className="flex-1 rounded-xl border border-border bg-card shadow-md shadow-cerulean-900/10 overflow-y-auto"
            style={{ minHeight: "200px", maxHeight: "400px" }}
          >
            {!consoleOutput && !isRunning && (
              <div className="flex flex-col items-center justify-center h-full py-12 px-4 text-center">
                <Terminal className="size-8 text-muted-foreground/30 mb-3" />
                <p className="text-xs text-muted-foreground">Click "Run Code" to see output here</p>
              </div>
            )}

            {isRunning && (
              <div className="flex flex-col items-center justify-center h-full py-12 px-4 text-center gap-3">
                <Loader2 className="size-6 animate-spin text-primary" />
                <p className="text-xs text-muted-foreground">Executing code…</p>
              </div>
            )}

            {consoleOutput && !isRunning && (
              <div className="p-4 space-y-3">
                {/* stdout */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <CheckCircle2 className="size-3.5 text-success" />
                    <span className="text-[11px] font-medium text-success/80 uppercase tracking-wider">stdout</span>
                  </div>
                  <pre className="rounded-lg bg-[#0d1117] p-3 text-[13px] font-mono text-[#e6edf3] whitespace-pre-wrap overflow-x-auto leading-relaxed" style={{ minHeight: "2.5rem" }}>
                    {consoleOutput.stdout || <span className="text-[#484f58] italic">(empty)</span>}
                  </pre>
                </div>

                {/* stderr */}
                {consoleOutput.stderr && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <XCircle className="size-3.5 text-destructive" />
                      <span className="text-[11px] font-medium text-destructive/80 uppercase tracking-wider">stderr</span>
                    </div>
                    <pre className="rounded-lg bg-[#1a0a0a] border border-destructive/20 p-3 text-[13px] font-mono text-[#f87171] whitespace-pre-wrap overflow-x-auto leading-relaxed">
                      {consoleOutput.stderr}
                    </pre>
                  </div>
                )}

                {/* Error */}
                {!consoleOutput.success && consoleOutput.error && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <AlertCircle className="size-3.5 text-destructive" />
                      <span className="text-[11px] font-medium text-destructive/80 uppercase tracking-wider">Error</span>
                    </div>
                    <pre className="rounded-lg bg-[#1a0a0a] border border-destructive/20 p-3 text-[13px] font-mono text-[#f87171] whitespace-pre-wrap overflow-x-auto leading-relaxed">
                      {consoleOutput.error}
                    </pre>
                  </div>
                )}

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border">
                  <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
                    <Clock className="size-3.5 text-muted-foreground" />
                    <div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Time</div>
                      <div className="text-sm font-mono font-medium text-foreground">
                        {consoleOutput.executionTime != null ? `${consoleOutput.executionTime}ms` : "—"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
                    <Cpu className="size-3.5 text-muted-foreground" />
                    <div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Memory</div>
                      <div className="text-sm font-mono font-medium text-foreground">
                        {consoleOutput.memoryUsage != null
                          ? `${(consoleOutput.memoryUsage / 1024).toFixed(2)} KB`
                          : "—"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Exit code */}
                {consoleOutput.exitCode != null && (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-muted-foreground">Exit code:</span>
                    <span className={`text-[11px] font-mono font-medium ${consoleOutput.exitCode === 0 ? "text-success" : "text-destructive"}`}>
                      {consoleOutput.exitCode}
                      {consoleOutput.signal ? ` (${consoleOutput.signal})` : ""}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={isEmpty}
            className="flex items-center justify-center gap-2 w-full bg-primary text-primary-foreground rounded-lg px-4 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <CheckCircle2 className="size-4" />
            {t("code_question.submit_answer")} →
          </button>
        </div>
      )}
    </div>
  );
}
