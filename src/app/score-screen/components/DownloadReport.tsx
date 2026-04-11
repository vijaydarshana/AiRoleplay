'use client';
import { useState } from 'react';
import type { SessionRecord } from '@/types';
import { Download, FileText, Printer } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  session: SessionRecord;
}

export default function DownloadReport({ session }: Props) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      // Build a printable HTML report and trigger download as HTML file
      // BACKEND INTEGRATION POINT: Replace with server-side PDF generation for production
      const formatDate = (ts: number) =>
        new Date(ts).toLocaleDateString('en-IN', {
          day: 'numeric', month: 'long', year: 'numeric',
          hour: '2-digit', minute: '2-digit',
        });

      const formatDuration = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m}m ${s}s`;
      };

      const criteriaRows = session.score.criteria
        .map(
          (c) => `
          <tr>
            <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#334155;">${c.name}</td>
            <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;text-align:center;font-weight:700;font-size:14px;color:${c.score >= 80 ? '#10b981' : c.score >= 60 ? '#f59e0b' : '#ef4444'};">${c.score}</td>
            <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-size:12px;color:#64748b;">${c.weight}%</td>
            <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-size:12px;color:#475569;">${c.feedback}</td>
          </tr>`
        )
        .join('');

      const transcriptRows = session.transcript
        .map(
          (t) => `
          <div style="margin-bottom:12px;display:flex;gap:10px;flex-direction:${t.speaker === 'candidate' ? 'row-reverse' : 'row'};">
            <div style="flex-shrink:0;width:32px;height:32px;border-radius:50%;background:${t.speaker === 'ai' ? '#4f6ef7' : '#10b981'};display:flex;align-items:center;justify-content:center;color:white;font-size:10px;font-weight:700;">
              ${t.speaker === 'ai' ? session.scenarioTitle.charAt(0) : 'ME'}
            </div>
            <div style="max-width:70%;background:${t.speaker === 'ai' ? '#f1f5f9' : '#eff6ff'};border-radius:12px;padding:10px 14px;font-size:13px;color:#334155;line-height:1.5;">
              ${t.text}
            </div>
          </div>`
        )
        .join('');

      const protocolRows = session.protocolItems
        .map(
          (p) => `
          <div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid #f1f5f9;">
            <span style="color:${p.checked ? '#10b981' : '#ef4444'};font-size:16px;">${p.checked ? '✓' : '✗'}</span>
            <span style="font-size:13px;color:${p.checked ? '#065f46' : '#991b1b'};">${p.label}</span>
          </div>`
        )
        .join('');

      const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>RoleplayAssess Report — ${session.scenarioTitle}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', system-ui, sans-serif; color: #1e293b; background: #fff; padding: 40px; max-width: 900px; margin: 0 auto; }
  h1 { font-size: 24px; font-weight: 700; color: #1e293b; }
  h2 { font-size: 16px; font-weight: 600; color: #334155; margin-bottom: 12px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; }
  .section { margin-bottom: 32px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { background: #f8fafc; padding: 10px 12px; text-align: left; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; border-bottom: 2px solid #e2e8f0; }
  @media print { body { padding: 20px; } }
</style>
</head>
<body>
  <div class="section">
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px;padding-bottom:20px;border-bottom:3px solid #4f6ef7;">
      <div style="width:48px;height:48px;background:#4f6ef7;border-radius:12px;display:flex;align-items:center;justify-content:center;color:white;font-size:22px;">🎙️</div>
      <div>
        <h1>RoleplayAssess — Performance Report</h1>
        <p style="color:#64748b;font-size:13px;margin-top:4px;">Generated on ${formatDate(Date.now())}</p>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px;">
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px;text-align:center;">
        <div style="font-size:11px;color:#94a3b8;margin-bottom:4px;">SCENARIO</div>
        <div style="font-size:13px;font-weight:600;color:#334155;">${session.scenarioTitle}</div>
      </div>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px;text-align:center;">
        <div style="font-size:11px;color:#94a3b8;margin-bottom:4px;">OVERALL SCORE</div>
        <div style="font-size:24px;font-weight:700;color:${session.score.overall >= 80 ? '#10b981' : session.score.overall >= 60 ? '#f59e0b' : '#ef4444'};">${session.score.overall}</div>
      </div>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px;text-align:center;">
        <div style="font-size:11px;color:#94a3b8;margin-bottom:4px;">DURATION</div>
        <div style="font-size:13px;font-weight:600;color:#334155;">${formatDuration(session.duration)}</div>
      </div>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px;text-align:center;">
        <div style="font-size:11px;color:#94a3b8;margin-bottom:4px;">PROTOCOL</div>
        <div style="font-size:13px;font-weight:600;color:${session.score.protocolCompletion >= 80 ? '#10b981' : '#f59e0b'};">${session.score.protocolCompletion}%</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>AI Assessment Summary</h2>
    <p style="font-size:14px;color:#475569;line-height:1.7;background:#f8fafc;border-left:4px solid #4f6ef7;padding:14px 16px;border-radius:0 8px 8px 0;">${session.score.summary}</p>
  </div>

  <div class="section">
    <h2>Criteria Scores</h2>
    <table>
      <thead>
        <tr>
          <th>Criterion</th>
          <th style="text-align:center;">Score</th>
          <th>Weight</th>
          <th>Feedback</th>
        </tr>
      </thead>
      <tbody>${criteriaRows}</tbody>
    </table>
  </div>

  <div class="section">
    <h2>Protocol Checklist</h2>
    ${protocolRows}
  </div>

  <div class="section">
    <h2>Full Transcript</h2>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;">
      ${transcriptRows}
    </div>
  </div>

  <div style="margin-top:40px;padding-top:16px;border-top:1px solid #e2e8f0;text-align:center;font-size:11px;color:#94a3b8;">
    Generated by RoleplayAssess · AI-Powered Customer Service Training
  </div>
</body>
</html>`;

      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `roleplay-report-${session.scenarioId}-${Date.now()}.html`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success('Report downloaded! Open in browser and print to PDF.');
    } catch (err) {
      console.error('Download error:', err);
      toast.error('Failed to generate report. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
          <FileText size={20} className="text-indigo-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-slate-800">Download Performance Report</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Full report with scores, AI feedback, protocol checklist, and complete transcript
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 active:scale-95 text-sm font-medium transition-all duration-150"
          >
            <Printer size={14} />
            <span>Print</span>
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:scale-95 disabled:opacity-70 text-white text-sm font-semibold transition-all duration-150 shadow-sm shadow-indigo-200"
          >
            {downloading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Download size={14} />
                <span>Download Report</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}