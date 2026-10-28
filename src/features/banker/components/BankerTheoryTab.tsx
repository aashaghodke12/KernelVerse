import React from 'react';
import { BookOpen, AlertTriangle, Layers, GitCompare, CheckCircle2 } from 'lucide-react';
import { BANKER_THEORY_CONTENT } from '../../../data/bankerTheoryData';

export const BankerTheoryTab: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Analogy Card */}
      <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 p-5 rounded-2xl border border-blue-200 shadow-subtle">
        <div className="flex items-center space-x-2.5 mb-2">
          <BookOpen className="w-5 h-5 text-primary-blue" />
          <h3 className="text-sm font-bold text-text-main">
            {BANKER_THEORY_CONTENT.analogy.title}
          </h3>
        </div>
        <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
          {BANKER_THEORY_CONTENT.analogy.description}
        </p>
      </div>

      {/* Mathematical Matrix Representation */}
      <div className="bg-surface p-5 rounded-2xl border border-app-border shadow-subtle space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-app-border">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-violet-600" />
            <h3 className="text-sm font-bold text-text-main">
              Fundamental Matrices and Formulae
            </h3>
          </div>
          <span className="text-xs font-mono text-violet-700 bg-violet-50 px-2 py-0.5 rounded font-bold">
            n processes, m resources
          </span>
        </div>

        {/* Formula Callout */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
          <div className="font-mono text-base font-bold text-primary-blue tracking-wide">
            Need[i][j] = Max[i][j] − Allocation[i][j]
          </div>
          <p className="text-xs text-text-muted mt-1.5">
            {BANKER_THEORY_CONTENT.formula.explanation}
          </p>
        </div>

        {/* Definitions list */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {BANKER_THEORY_CONTENT.definitions.map(item => (
            <div
              key={item.term}
              className="p-3.5 bg-slate-50/60 border border-app-border rounded-xl space-y-1"
            >
              <h4 className="text-xs font-bold text-text-main font-mono">{item.term}</h4>
              <p className="text-[11px] text-text-muted leading-relaxed">{item.meaning}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Safe State vs Unsafe State Contrast Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-emerald-50/70 p-5 rounded-2xl border border-emerald-200 space-y-2">
          <div className="flex items-center space-x-2 text-emerald-800">
            <CheckCircle2 className="w-5 h-5 text-app-success" />
            <h4 className="text-sm font-bold">Safe State</h4>
          </div>
          <p className="text-xs text-emerald-900 leading-relaxed">
            There exists at least one order of execution <span className="font-mono font-bold">&lt;P0, P1, ..., Pn-1&gt;</span> such that every process can finish using available resources and resources released by prior processes. <strong>Deadlock is completely impossible.</strong>
          </p>
        </div>

        <div className="bg-amber-50/70 p-5 rounded-2xl border border-amber-200 space-y-2">
          <div className="flex items-center space-x-2 text-amber-900">
            <AlertTriangle className="w-5 h-5 text-app-warning" />
            <h4 className="text-sm font-bold">Unsafe State</h4>
          </div>
          <p className="text-xs text-amber-950 leading-relaxed">
            No safe sequence can be guaranteed. <strong>An unsafe state is NOT necessarily a deadlock!</strong> It only means that the OS can no longer guarantee that deadlock will be prevented if processes choose to demand their maximum claims.
          </p>
        </div>
      </div>

      {/* Algorithms Steps: Safety vs Request */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Safety Algorithm */}
        <div className="bg-surface p-5 rounded-2xl border border-app-border shadow-subtle space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-primary-blue">
            The Safety Algorithm
          </h4>
          <ol className="list-decimal list-inside space-y-2.5 text-xs text-slate-700 leading-relaxed">
            {BANKER_THEORY_CONTENT.safetyAlgorithmSteps.map((step, idx) => (
              <li key={idx} className="pl-1">
                <span className="font-medium">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Resource Request Algorithm */}
        <div className="bg-surface p-5 rounded-2xl border border-app-border shadow-subtle space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-secondary-violet">
            The Resource-Request Algorithm
          </h4>
          <ol className="list-decimal list-inside space-y-2.5 text-xs text-slate-700 leading-relaxed">
            {BANKER_THEORY_CONTENT.resourceRequestAlgorithmSteps.map((step, idx) => (
              <li key={idx} className="pl-1">
                <span className="font-medium whitespace-pre-line">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
};
