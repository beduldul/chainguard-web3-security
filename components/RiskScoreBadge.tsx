'use client';

import React from 'react';
import { RiskLevel } from '@/lib/types';
import { ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';

interface RiskScoreBadgeProps {
  score: number;
  riskLevel: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
}

export default function RiskScoreBadge({ score, riskLevel, size = 'md' }: RiskScoreBadgeProps) {
  let colorClass = 'from-emerald-500 to-teal-400 text-emerald-400 border-emerald-500/40 shadow-emerald-500/20';
  let badgeLabel = 'LOW RISK';
  let Icon = ShieldCheck;

  if (score >= 75) {
    colorClass = 'from-rose-600 to-red-500 text-rose-400 border-rose-500/50 shadow-rose-500/30 animate-pulse-slow';
    badgeLabel = 'CRITICAL RISK';
    Icon = ShieldAlert;
  } else if (score >= 50) {
    colorClass = 'from-amber-500 to-orange-500 text-amber-400 border-amber-500/40 shadow-amber-500/20';
    badgeLabel = 'HIGH RISK';
    Icon = AlertTriangle;
  } else if (score >= 25) {
    colorClass = 'from-yellow-500 to-amber-400 text-yellow-400 border-yellow-500/40 shadow-yellow-500/20';
    badgeLabel = 'MODERATE RISK';
    Icon = AlertTriangle;
  }

  const circleRadius = size === 'lg' ? 42 : size === 'md' ? 32 : 22;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex items-center gap-4">
      {/* Circular Gauge */}
      <div className="relative flex items-center justify-center">
        <svg
          className={`${size === 'lg' ? 'w-28 h-28' : size === 'md' ? 'w-20 h-20' : 'w-14 h-14'} transform -rotate-90`}
        >
          <circle
            cx="50%"
            cy="50%"
            r={circleRadius}
            className="stroke-white/10"
            strokeWidth={size === 'lg' ? '8' : '6'}
            fill="transparent"
          />
          <circle
            cx="50%"
            cy="50%"
            r={circleRadius}
            className={`transition-all duration-1000 stroke-current ${colorClass.split(' ')[2]}`}
            strokeWidth={size === 'lg' ? '8' : '6'}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={`font-black font-mono ${size === 'lg' ? 'text-2xl' : size === 'md' ? 'text-lg' : 'text-xs'} text-white`}>
            {score}
          </span>
          <span className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">/ 100</span>
        </div>
      </div>

      {/* Label Badge */}
      <div>
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border bg-white/[0.03] backdrop-blur-md ${colorClass}`}>
          <Icon className="w-4 h-4" />
          <span className="text-xs font-black tracking-wider uppercase">{badgeLabel}</span>
        </div>
        <p className="text-[11px] text-gray-400 mt-1 font-mono">
          Security Threat Score: <span className="text-white font-bold">{score}%</span>
        </p>
      </div>
    </div>
  );
}
