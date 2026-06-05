const PISTON_API = "https://emkc.org/api/v2/piston/execute";

const LANGUAGE_MAP = {
  javascript: { language: "javascript", version: "18.15.0" },
  python: { language: "python", version: "3.10.0" },
  java: { language: "java", version: "15.0.2" },
  typescript: { language: "typescript", version: "5.0.3" },
  cpp: { language: "c++", version: "10.2.0" },
  sql: { language: "sql", version: "3.36.0" },
};

export async function executeCode(code, language) {
  const runtime = LANGUAGE_MAP[language?.toLowerCase()];
  if (!runtime) {
    return {
      success: false,
      error: `Unsupported language: ${language}`,
    };
  }

  try {
    const res = await fetch(PISTON_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: runtime.language,
        version: runtime.version,
        files: [{ content: code }],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return { success: false, error: `Piston API error (${res.status}): ${err}` };
    }

    const data = await res.json();

    return {
      success: true,
      stdout: data?.run?.stdout ?? "",
      stderr: data?.run?.stderr ?? "",
      output: data?.run?.output ?? "",
      executionTime: data?.run?.cpu_time ?? null,
      memoryUsage: data?.run?.memory ?? null,
      exitCode: data?.run?.code ?? null,
      signal: data?.run?.signal ?? null,
    };
  } catch (err) {
    return {
      success: false,
      error: err.message ?? "Failed to execute code via Piston API",
    };
  }
}
