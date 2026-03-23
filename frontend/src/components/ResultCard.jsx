import { useState } from "react";

const PRIORITY_COLORS = {
  High: "bg-red-100 text-red-700",
  Normal: "bg-yellow-100 text-yellow-700",
  Low: "bg-green-100 text-green-700",
};

function Section({ title, children }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">{title}</h3>
      {children}
    </div>
  );
}

export default function ResultCard({ result, onReset }) {
  const [copied, setCopied] = useState(false);

  function copySalesforceJSON() {
    navigator.clipboard.writeText(JSON.stringify(result.salesforce, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Call Analysis</h2>
        <button
          onClick={onReset}
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          ← New call
        </button>
      </div>

      {/* Summary */}
      <Section title="Summary">
        <p className="text-gray-700 leading-relaxed">{result.summary}</p>
      </Section>

      {/* Sentiment */}
      {result.sentiment && (
        <Section title="Sentiment">
          <div className="flex gap-4">
            {Object.entries(result.sentiment).map(([who, val]) => (
              <div key={who} className="flex items-center gap-2">
                <span className="text-sm text-gray-500 capitalize">{who.replace("_", " ")}:</span>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${
                    val === "positive"
                      ? "bg-green-100 text-green-700"
                      : val === "negative"
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {val}
                </span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Key Moments */}
      {result.key_moments?.length > 0 && (
        <Section title="Key Moments">
          <ul className="space-y-2">
            {result.key_moments.map((m, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-700">
                <span className="text-blue-400 mt-0.5">•</span>
                {m}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Action Items */}
      {result.action_items?.length > 0 && (
        <Section title="Action Items">
          <div className="space-y-2">
            {result.action_items.map((item, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                <div className="flex-1">
                  <p className="text-sm text-gray-800">{item.task}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Owner: <span className="font-medium">{item.owner}</span>
                    {item.due && <> · Due: <span className="font-medium">{item.due}</span></>}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Recommended Next Steps */}
      {result.next_steps?.length > 0 && (
        <Section title="Recommended Next Steps">
          <div className="space-y-3">
            {result.next_steps
              .sort((a, b) => a.priority - b.priority)
              .map((step, i) => (
                <div key={i} className="flex gap-3 p-3 rounded-lg border border-gray-200">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {step.priority}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{step.action}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{step.rationale}</p>
                  </div>
                </div>
              ))}
          </div>
        </Section>
      )}

      {/* Follow-up Tasks preview */}
      {result.salesforce?.FollowUpTasks?.length > 0 && (
        <Section title="Follow-up Tasks (Salesforce)">
          <div className="space-y-2">
            {result.salesforce.FollowUpTasks.map((t, i) => (
              <div key={i} className="flex items-center justify-between text-sm p-2 rounded-lg bg-gray-50">
                <span className="text-gray-700">{t.Subject}</span>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  {t.ActivityDate && <span className="text-gray-400 text-xs">{t.ActivityDate}</span>}
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${PRIORITY_COLORS[t.Priority] || "bg-gray-100 text-gray-600"}`}>
                    {t.Priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Action buttons */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={copySalesforceJSON}
          className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          {copied ? "Copied!" : "Copy JSON"}
        </button>
        <button
          disabled
          title="Coming in next phase"
          className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium opacity-40 cursor-not-allowed"
        >
          Push to Salesforce
        </button>
      </div>
    </div>
  );
}
