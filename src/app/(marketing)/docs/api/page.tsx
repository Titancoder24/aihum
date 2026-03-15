import type { Metadata } from 'next';
import { SITE } from '@/constants';

export const metadata: Metadata = {
  title: 'API Documentation — Integrate AI Detection & Humanization',
  description:
    'Complete API reference for HumanizeElite. Detect AI content, humanize text, and analyze documents programmatically with our REST API.',
  alternates: { canonical: `${SITE.url}/docs/api` },
  openGraph: {
    title: 'API Documentation | HumanizeElite',
    description:
      'Complete API reference for AI detection and humanization. REST API with clear examples.',
    url: `${SITE.url}/docs/api`,
  },
};

interface EndpointDoc {
  method: 'GET' | 'POST';
  path: string;
  title: string;
  description: string;
  auth: boolean;
  requestBody?: string;
  responseBody: string;
  curlExample: string;
  fetchExample: string;
}

const endpoints: EndpointDoc[] = [
  {
    method: 'POST',
    path: '/api/v1/detect',
    title: 'Detect AI Content',
    description:
      'Analyze text for AI-generated patterns. Returns an overall score (0-100), confidence level, per-sentence scores, module breakdowns, and identified patterns.',
    auth: false,
    requestBody: `{
  "text": "Your text to analyze...",
  "options": {
    "detailed": true,
    "perSentence": true,
    "weights": {
      "perplexity": 0.20,
      "burstiness": 0.18
    }
  }
}`,
    responseBody: `{
  "success": true,
  "data": {
    "overallScore": 78,
    "confidence": "high",
    "sentences": [
      {
        "text": "AI tends to produce uniform text.",
        "index": 0,
        "score": 0.85,
        "color": "red",
        "moduleScores": { "perplexity": 0.9 }
      }
    ],
    "modules": [
      {
        "name": "perplexity",
        "score": 0.82,
        "weight": 0.20,
        "details": ["Low perplexity detected"]
      }
    ],
    "patterns": [
      {
        "name": "Uniform sentence length",
        "description": "Sentences vary by less than 5 words",
        "severity": "high",
        "examples": ["..."]
      }
    ],
    "wordCount": 250,
    "processingTimeMs": 45
  }
}`,
    curlExample: `curl -X POST ${SITE.url}/api/v1/detect \\
  -H "Content-Type: application/json" \\
  -d '{"text": "Your text to analyze..."}'`,
    fetchExample: `const response = await fetch("${SITE.url}/api/v1/detect", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    text: "Your text to analyze...",
    options: { detailed: true, perSentence: true }
  })
});

const data = await response.json();
console.log(data.data.overallScore); // 0-100`,
  },
  {
    method: 'POST',
    path: '/api/v1/humanize',
    title: 'Humanize Text',
    description:
      'Transform AI-generated text into natural human writing. Choose from 5 modes: standard, academic, creative, seo, professional. Returns before/after scores and a detailed change log.',
    auth: false,
    requestBody: `{
  "text": "Your AI-generated text...",
  "mode": "standard",
  "options": {
    "intensity": "medium",
    "preserveKeywords": ["SEO", "keyword"]
  }
}`,
    responseBody: `{
  "success": true,
  "data": {
    "original": "Your AI-generated text...",
    "humanized": "Your naturally rewritten text...",
    "beforeScore": 82,
    "afterScore": 18,
    "mode": "standard",
    "changes": [
      {
        "original": "Furthermore",
        "replacement": "Also",
        "stage": "vocabulary",
        "position": 45
      }
    ],
    "stageResults": [
      {
        "stageName": "vocabulary",
        "inputText": "...",
        "outputText": "...",
        "changesCount": 12
      }
    ],
    "processingTimeMs": 120
  }
}`,
    curlExample: `curl -X POST ${SITE.url}/api/v1/humanize \\
  -H "Content-Type: application/json" \\
  -d '{"text": "Your AI text...", "mode": "standard"}'`,
    fetchExample: `const response = await fetch("${SITE.url}/api/v1/humanize", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    text: "Your AI-generated text...",
    mode: "academic",
    options: { intensity: "medium" }
  })
});

const data = await response.json();
console.log(data.data.afterScore); // Target: below 40`,
  },
  {
    method: 'POST',
    path: '/api/v1/analyze',
    title: 'Analyze (Detect + Humanize)',
    description:
      'One-shot endpoint that detects AI content and then humanizes it. Returns both the detection result and the humanized output in a single response.',
    auth: false,
    requestBody: `{
  "text": "Your text to analyze and humanize...",
  "mode": "standard"
}`,
    responseBody: `{
  "success": true,
  "data": {
    "detection": {
      "overallScore": 78,
      "confidence": "high",
      "wordCount": 250,
      "processingTimeMs": 45,
      "...": "full DetectionResult"
    },
    "humanization": {
      "original": "...",
      "humanized": "...",
      "beforeScore": 78,
      "afterScore": 15,
      "mode": "standard",
      "processingTimeMs": 120,
      "...": "full HumanizationResult"
    }
  }
}`,
    curlExample: `curl -X POST ${SITE.url}/api/v1/analyze \\
  -H "Content-Type: application/json" \\
  -d '{"text": "Your text...", "mode": "academic"}'`,
    fetchExample: `const response = await fetch("${SITE.url}/api/v1/analyze", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    text: "Your text to analyze and humanize...",
    mode: "standard"
  })
});

const { data } = await response.json();
console.log(data.detection.overallScore); // Before
console.log(data.humanization.afterScore); // After`,
  },
  {
    method: 'GET',
    path: '/api/v1/usage',
    title: 'Get Usage',
    description:
      'Retrieve your current usage statistics including words used today, daily limit, plan type, and reset time. Requires authentication.',
    auth: true,
    responseBody: `{
  "success": true,
  "data": {
    "wordsUsedToday": 3250,
    "wordsLimit": 50000,
    "plan": "pro",
    "resetsAt": "2026-03-16T00:00:00.000Z"
  }
}`,
    curlExample: `curl ${SITE.url}/api/v1/usage \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
    fetchExample: `const response = await fetch("${SITE.url}/api/v1/usage", {
  headers: {
    "Authorization": "Bearer YOUR_API_KEY"
  }
});

const data = await response.json();
console.log(data.data.wordsUsedToday);
console.log(data.data.wordsLimit);`,
  },
];

function MethodBadge({ method }: { method: string }) {
  const colors = method === 'GET' ? 'bg-success/20 text-success' : 'bg-primary/20 text-primary';
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${colors}`}>
      {method}
    </span>
  );
}

function CodeBlock({ code, language }: { code: string; language: string }) {
  return (
    <div className="relative">
      <div className="flex items-center justify-between px-4 py-2 bg-white/[0.03] border-b border-white/5 rounded-t-lg">
        <span className="text-xs text-gray-500 font-mono">{language}</span>
      </div>
      <pre className="bg-surface-dark rounded-b-lg p-4 overflow-x-auto">
        <code className="text-sm text-gray-300 font-mono whitespace-pre">{code}</code>
      </pre>
    </div>
  );
}

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-background-dark">
      <div className="max-w-4xl mx-auto px-4 py-20">
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-100 mb-4">
            API <span className="gradient-text">Documentation</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl">
            Integrate AI detection and humanization into your applications with our
            REST API. Simple endpoints, predictable responses, generous rate limits.
          </p>
        </div>

        {/* Base URL */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-gray-100 mb-4">Base URL</h2>
          <div className="glass rounded-lg p-4">
            <code className="text-sm font-mono text-primary">{SITE.url}</code>
          </div>
        </section>

        {/* Authentication */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-gray-100 mb-4">Authentication</h2>
          <p className="text-gray-400 mb-4">
            Most endpoints are open and do not require authentication. The <code className="text-primary text-sm font-mono">/api/v1/usage</code> endpoint requires a Bearer token in the Authorization header.
          </p>
          <CodeBlock
            language="HTTP Header"
            code="Authorization: Bearer YOUR_API_KEY"
          />
        </section>

        {/* Rate Limiting */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-gray-100 mb-4">Rate Limiting</h2>
          <p className="text-gray-400 mb-4">
            API requests are rate limited per IP address. Current limits:
          </p>
          <div className="glass rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-gray-400 font-medium py-3 px-4">Endpoint</th>
                  <th className="text-left text-gray-400 font-medium py-3 px-4">Limit</th>
                  <th className="text-left text-gray-400 font-medium py-3 px-4">Window</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                <tr className="border-b border-white/5">
                  <td className="py-2.5 px-4 font-mono text-xs">/api/v1/detect</td>
                  <td className="py-2.5 px-4">30 requests</td>
                  <td className="py-2.5 px-4">1 minute</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-2.5 px-4 font-mono text-xs">/api/v1/humanize</td>
                  <td className="py-2.5 px-4">20 requests</td>
                  <td className="py-2.5 px-4">1 minute</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-mono text-xs">/api/v1/analyze</td>
                  <td className="py-2.5 px-4">10 requests</td>
                  <td className="py-2.5 px-4">1 minute</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-gray-500 text-sm mt-3">
            Rate limit info is returned in the <code className="text-gray-400 font-mono text-xs">X-RateLimit-Remaining</code> response header.
          </p>
        </section>

        {/* Error Codes */}
        <section className="mb-16">
          <h2 className="text-xl font-bold text-gray-100 mb-4">Error Responses</h2>
          <p className="text-gray-400 mb-4">
            All errors follow the same format:
          </p>
          <CodeBlock
            language="JSON"
            code={`{
  "success": false,
  "error": "Description of what went wrong"
}`}
          />
          <div className="glass rounded-lg overflow-hidden mt-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-gray-400 font-medium py-3 px-4">Status</th>
                  <th className="text-left text-gray-400 font-medium py-3 px-4">Meaning</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                <tr className="border-b border-white/5">
                  <td className="py-2.5 px-4 font-mono">400</td>
                  <td className="py-2.5 px-4">Invalid JSON in request body</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-2.5 px-4 font-mono">401</td>
                  <td className="py-2.5 px-4">Missing or invalid authentication</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-2.5 px-4 font-mono">422</td>
                  <td className="py-2.5 px-4">Validation error (invalid parameters)</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-2.5 px-4 font-mono">429</td>
                  <td className="py-2.5 px-4">Rate limit exceeded</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-mono">500</td>
                  <td className="py-2.5 px-4">Internal server error</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Endpoints */}
        <div className="space-y-16">
          {endpoints.map((endpoint) => (
            <section key={endpoint.path} id={endpoint.path.replace(/\//g, '-').slice(1)}>
              <div className="flex items-center gap-3 mb-3">
                <MethodBadge method={endpoint.method} />
                <code className="text-sm font-mono text-gray-300">{endpoint.path}</code>
                {endpoint.auth && (
                  <span className="px-2 py-0.5 rounded text-xs bg-warning/20 text-warning font-medium">
                    Auth Required
                  </span>
                )}
              </div>

              <h2 className="text-2xl font-bold text-gray-100 mb-3">{endpoint.title}</h2>
              <p className="text-gray-400 mb-6">{endpoint.description}</p>

              {endpoint.requestBody && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">
                    Request Body
                  </h3>
                  <CodeBlock language="JSON" code={endpoint.requestBody} />
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">
                  Response
                </h3>
                <CodeBlock language="JSON" code={endpoint.responseBody} />
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">
                  cURL Example
                </h3>
                <CodeBlock language="bash" code={endpoint.curlExample} />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">
                  JavaScript Example
                </h3>
                <CodeBlock language="javascript" code={endpoint.fetchExample} />
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
