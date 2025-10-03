'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

const EXAMPLE_YAML = `client:
  business_name: "Green Fork"
  industry: "casual restaurant"
  city: "Albuquerque, NM"
  zip: "87106"
  goal: "foot_traffic"    # awareness | foot_traffic | leads | online_sales
  monthly_budget_usd: 4000

constraints:
  channels: ["billboards", "facebook_instagram"]  # google_search optional
  tone: "concise, agency-ready"
  max_billboard_locations: 5
  require_json_then_markdown: true`;

interface PlanResponse {
  id: string;
  json: any;
  markdown: string;
  pdf_url?: string;
}

export default function Home() {
  const [yamlInput, setYamlInput] = useState(EXAMPLE_YAML);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<PlanResponse | null>(null);
  const [showJson, setShowJson] = useState(false);
  const [generatePdf, setGeneratePdf] = useState(true);

  const loadExample = () => {
    setYamlInput(EXAMPLE_YAML);
    setError('');
  };

  const validateYaml = () => {
    try {
      if (!yamlInput.trim()) {
        setError('YAML input is empty');
        return;
      }
      setError('');
      showToast('YAML looks valid!', 'success');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const generatePlan = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          yaml_input: yamlInput,
          options: {
            dry_run: false,
            pdf: generatePdf,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate plan');
      }

      const data: PlanResponse = await response.json();
      setResult(data);
      showToast('Plan generated successfully!', 'success');
    } catch (err: any) {
      setError(err.message);
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const downloadJson = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result.json, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `plan-${result.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadMarkdown = () => {
    if (!result) return;
    const blob = new Blob([result.markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `plan-${result.id}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadPdf = () => {
    if (!result?.pdf_url) return;
    window.open(result.pdf_url, '_blank');
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    const toast = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg text-white ${bgColor} shadow-lg z-50 animate-fade-in`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex items-center gap-6">
          <img
            src="/logo.jpeg"
            alt="Roadrunner Marketing Logo"
            className="w-32 h-32 object-contain"
          />
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Channel Optimization Tool
            </h1>
            <p className="text-gray-600">
              Generate local media plans
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">
                Input
              </h2>
              <button
                onClick={loadExample}
                className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-md transition"
              >
                Load Example
              </button>
            </div>

            <textarea
              value={yamlInput}
              onChange={(e) => setYamlInput(e.target.value)}
              className="w-full h-96 p-4 font-mono text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Paste your YAML here..."
            />

            <div className="mt-4 flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={generatePdf}
                  onChange={(e) => setGeneratePdf(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">Generate PDF</span>
              </label>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={validateYaml}
                className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition"
              >
                Validate YAML
              </button>
              <button
                onClick={generatePlan}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-md transition font-semibold"
              >
                {loading ? 'Generating...' : 'Generate Plan'}
              </button>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">
                Generated Plan
              </h2>
              {result && (
                <div className="flex gap-2">
                  <button
                    onClick={downloadJson}
                    className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded-md transition"
                  >
                    JSON
                  </button>
                  <button
                    onClick={downloadMarkdown}
                    className="px-3 py-1 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-md transition"
                  >
                    Markdown
                  </button>
                  {result.pdf_url && (
                    <button
                      onClick={downloadPdf}
                      className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md transition"
                    >
                      PDF
                    </button>
                  )}
                </div>
              )}
            </div>

            {loading && (
              <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            )}

            {!loading && !result && (
              <div className="flex items-center justify-center h-96 text-gray-400">
                <p>No plan generated yet. Click "Generate Plan" to start.</p>
              </div>
            )}

            {!loading && result && (
              <div>
                <div className="mb-4 flex gap-2">
                  <button
                    onClick={() => setShowJson(false)}
                    className={`px-4 py-2 rounded-md transition ${
                      !showJson
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    Markdown
                  </button>
                  <button
                    onClick={() => setShowJson(true)}
                    className={`px-4 py-2 rounded-md transition ${
                      showJson
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    JSON
                  </button>
                </div>

                <div className="border border-gray-300 rounded-md p-4 h-96 overflow-auto bg-gray-50">
                  {showJson ? (
                    <pre className="text-xs font-mono">
                      {JSON.stringify(result.json, null, 2)}
                    </pre>
                  ) : (
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown>{result.markdown}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
