'use client';
import React from 'react';
import { FilaCalculada } from '@/lib/docentesTypes';
import { formatMiles } from '@/lib/docentesCalc';
import {
  GraduationCap,
  ClipboardList,
  CheckCircle2,
  Award,
  AlertTriangle,
  TrendingDown,
  Users,
  UserCheck,
  BarChart3,
} from 'lucide-react';

interface SummaryCardsProps {
  data: FilaCalculada[];
  año: string;
  errorPct: number;
  atenderPct: number;
  studentsPerDocReal?: number;
}

interface Card {
  label: string;
  value: string;
  sub?: string;
  color: string;
  bg: string;
  icon: React.ReactNode;
}

export const SummaryCards = React.memo(function SummaryCards({
  data, año, errorPct, atenderPct, studentsPerDocReal = 30
}: SummaryCardsProps) {
  const {
    totalEstUE, totalDocNec, totalPlanilla, totalEgresados,
    totalNec, totalError, totalAtender, totalDocReal, totalConMargen
  } = React.useMemo(() => {
    let est = 0, dn = 0, pl = 0, eg = 0, tn = 0, er = 0, at = 0, dr = 0, cm = 0;
    for (let i = 0; i < data.length; i++) {
      const f = data[i];
      est += f.estUE;
      dn += f.docNec;
      pl += f.planilla;
      eg += f.egresados;
      tn += f.totalNecesitados;
      er += f.errorMargen;
      at += f.atender;
      dr += f.docenteReal;
      cm += f.docenteConMargen;
    }
    return {
      totalEstUE: Math.round(est),
      totalDocNec: Math.round(dn),
      totalPlanilla: Math.round(pl),
      totalEgresados: Math.round(eg),
      totalNec: Math.round(tn),
      totalError: Math.round(er),
      totalAtender: Math.round(at),
      totalDocReal: Math.round(dr),
      totalConMargen: Math.round(cm),
    };
  }, [data]);

  const cards: Card[] = [
    {
      label: 'Estudiantes UE',
      value: formatMiles(totalEstUE),
      icon: <GraduationCap className="h-4 w-4 text-sky-400" />,
      color: 'text-sky-400',
      bg: 'border-sky-900/50 bg-sky-950/20',
    },
    {
      label: 'Doc. Necesarios',
      value: formatMiles(totalDocNec),
      icon: <ClipboardList className="h-4 w-4 text-rose-400" />,
      color: 'text-rose-400',
      bg: 'border-rose-900/50 bg-rose-950/20',
    },
    {
      label: 'Planilla Actual',
      value: formatMiles(totalPlanilla),
      icon: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
      color: 'text-emerald-400',
      bg: 'border-emerald-900/50 bg-emerald-950/20',
    },
    {
      label: 'Egresados Disp.',
      value: formatMiles(totalEgresados),
      icon: <Award className="h-4 w-4 text-teal-400" />,
      color: 'text-teal-400',
      bg: 'border-teal-900/50 bg-teal-950/20',
    },
    {
      label: 'Total Necesitados',
      value: formatMiles(totalNec),
      sub: 'Doc.Nec − (Planilla+Egres)',
      icon: <AlertTriangle className={`h-4 w-4 ${totalNec > 0 ? 'text-rose-400' : 'text-emerald-400'}`} />,
      color: totalNec > 0 ? 'text-rose-400' : 'text-emerald-400',
      bg: totalNec > 0 ? 'border-rose-900/50 bg-rose-950/20' : 'border-emerald-900/50 bg-emerald-950/20',
    },
    {
      label: `Error ${errorPct}%`,
      value: formatMiles(totalError),
      sub: `Total × ${((100 - errorPct) / 100).toFixed(2)} (invert.)`,
      icon: <TrendingDown className="h-4 w-4 text-orange-400" />,
      color: 'text-orange-400',
      bg: 'border-orange-900/50 bg-orange-950/20',
    },
    {
      label: `Atender ${atenderPct}%`,
      value: formatMiles(totalAtender),
      sub: `Error × ${atenderPct}%`,
      icon: <Users className="h-4 w-4 text-yellow-400" />,
      color: 'text-yellow-400',
      bg: 'border-yellow-900/50 bg-yellow-950/20',
    },
    {
      label: 'Doc. Real',
      value: formatMiles(totalDocReal),
      sub: `Error ÷ ${studentsPerDocReal}`,
      icon: <UserCheck className="h-4 w-4 text-purple-400" />,
      color: 'text-purple-400',
      bg: 'border-purple-900/50 bg-purple-950/20',
    },
    {
      label: 'Doc. Con Margen',
      value: formatMiles(totalConMargen),
      sub: `Atender ÷ ${studentsPerDocReal}`,
      icon: <BarChart3 className="h-4 w-4 text-amber-400" />,
      color: 'text-amber-400',
      bg: 'border-amber-900/50 bg-amber-950/20',
    },
  ];

  return (
    <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2.5">
      {cards.map((c) => (
        <div key={c.label} className={`rounded-2xl border p-3 shadow-lg flex flex-col gap-1.5 ${c.bg}`}>
          <div className="flex items-center gap-1.5">
            <span className="shrink-0">{c.icon}</span>
            <span className="text-[9px] font-medium text-slate-400 leading-tight truncate">{c.label}</span>
          </div>
          <span className={`text-lg font-extrabold font-mono leading-none ${c.color}`}>{c.value}</span>
          {c.sub && <span className="text-[9px] text-slate-500 leading-tight truncate">{c.sub}</span>}
          <span className="text-[9px] text-slate-600">{año}</span>
        </div>
      ))}
    </div>
  );
});
