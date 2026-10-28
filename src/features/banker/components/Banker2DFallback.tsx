import React from 'react';
import { BankerState, AlgorithmState } from '../../../types';

interface Banker2DFallbackProps {
  state: BankerState;
  currentProcessIdx: number | null;
  completedProcesses: boolean[];
  eligibleProcesses?: boolean[];
}

export const Banker2DFallback: React.FC<Banker2DFallbackProps> = ({
  state,
  currentProcessIdx,
  completedProcesses,
  eligibleProcesses,
}) => {
  const pCount = state.processNames.length;
  const rCount = state.resourceNames.length;

  const width = 640;
  const height = 440;
  const centerX = width / 2;
  const centerY = height / 2;
  const orbitRadius = 150;

  return (
    <div className="relative w-full h-[450px] bg-slate-50 rounded-2xl border border-app-border flex items-center justify-center p-4">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full max-h-[440px]">
        {/* Background Orbit Ring */}
        <circle
          cx={centerX}
          cy={centerY}
          r={orbitRadius}
          fill="none"
          stroke="#E2E8F0"
          strokeWidth="2"
          strokeDasharray="6 6"
        />

        {/* Center: Available Resource Pools */}
        <g transform={`translate(${centerX - (rCount * 50) / 2}, ${centerY - 35})`}>
          <rect
            x={-15}
            y={-10}
            width={rCount * 50 + 30}
            height={80}
            rx={16}
            fill="#FFFFFF"
            stroke="#CBD5E1"
            strokeWidth="1.5"
            className="shadow-sm"
          />
          <text
            x={(rCount * 50) / 2}
            y={8}
            textAnchor="middle"
            className="text-[11px] font-bold fill-slate-500 uppercase tracking-wider"
          >
            Available Vault
          </text>
          {state.resourceNames.map((rName, rIdx) => (
            <g key={rName} transform={`translate(${rIdx * 50 + 25}, 38)`}>
              <circle cx="0" cy="0" r="16" fill="#EEF3FF" stroke="#315EFB" strokeWidth="1.5" />
              <text x="0" y="4" textAnchor="middle" className="text-xs font-bold fill-blue-700">
                {state.available[rIdx]}
              </text>
              <text x="0" y="24" textAnchor="middle" className="text-[10px] font-mono fill-slate-400">
                {rName}
              </text>
            </g>
          ))}
        </g>

        {/* Dynamic connection lines to currently active process */}
        {currentProcessIdx !== null && (
          (() => {
            const angle = (currentProcessIdx / pCount) * Math.PI * 2 - Math.PI / 2;
            const px = centerX + Math.cos(angle) * orbitRadius;
            const py = centerY + Math.sin(angle) * orbitRadius;
            return (
              <line
                x1={centerX}
                y1={centerY}
                x2={px}
                y2={py}
                stroke="#315EFB"
                strokeWidth="2.5"
                strokeDasharray="4 4"
                className="animate-pulse"
              />
            );
          })()
        )}

        {/* Process Orbit Nodes */}
        {state.processNames.map((pName, pIdx) => {
          const angle = (pIdx / pCount) * Math.PI * 2 - Math.PI / 2;
          const px = centerX + Math.cos(angle) * orbitRadius;
          const py = centerY + Math.sin(angle) * orbitRadius;

          const isCompleted = completedProcesses[pIdx];
          const isCurrent = currentProcessIdx === pIdx;
          const isEligible = eligibleProcesses && eligibleProcesses[pIdx];

          let nodeBg = '#FFFFFF';
          let strokeColor = '#CBD5E1';
          let textColor = '#172033';

          if (isCompleted) {
            nodeBg = '#ECFDF5';
            strokeColor = '#15966A';
            textColor = '#065F46';
          } else if (isCurrent) {
            nodeBg = '#EEF3FF';
            strokeColor = '#315EFB';
            textColor = '#1E40AF';
          } else if (isEligible) {
            nodeBg = '#EFF6FF';
            strokeColor = '#60A5FA';
          }

          const needRow = state.need
            ? state.need[pIdx]
            : state.max[pIdx].map((m, r) => m - state.allocation[pIdx][r]);

          return (
            <g key={pName} transform={`translate(${px}, ${py})`}>
              {/* Pulse ring for active */}
              {isCurrent && (
                <circle cx="0" cy="0" r="32" fill="none" stroke="#315EFB" strokeWidth="1.5" className="animate-ping" opacity="0.4" />
              )}
              <circle
                cx="0"
                cy="0"
                r="26"
                fill={nodeBg}
                stroke={strokeColor}
                strokeWidth={isCurrent ? 2.5 : 1.5}
              />
              <text x="0" y="4" textAnchor="middle" className="text-xs font-bold" fill={textColor}>
                {pName}
              </text>
              <text x="0" y="38" textAnchor="middle" className="text-[9px] font-mono fill-slate-500">
                Need: [{needRow.join(',')}]
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
