import { Link } from 'react-router-dom';
import { Clock, AlertTriangle, Sparkles } from 'lucide-react';
import type { TrialInfo } from '../hooks/useTrial';

interface TrialBannerProps {
  trial: TrialInfo;
}

export default function TrialBanner({ trial }: TrialBannerProps) {
  if (!trial.isTrial || trial.isExpired) return null;

  const { daysLeft } = trial;

  // Define a cor conforme os dias restantes
  let colorClasses = 'bg-violet-50 border-violet-200 text-violet-900';
  let iconColor = 'text-violet-600';
  let message = `Você está no período de teste. Restam ${daysLeft} ${daysLeft === 1 ? 'dia' : 'dias'}.`;
  let Icon = Clock;

  if (daysLeft <= 1) {
    colorClasses = 'bg-red-50 border-red-200 text-red-900';
    iconColor = 'text-red-600';
    message = daysLeft === 0
      ? 'Seu período de teste termina hoje. Assine para continuar usando.'
      : 'Seu período de teste termina amanhã. Assine para não perder o acesso.';
    Icon = AlertTriangle;
  } else if (daysLeft <= 3) {
    colorClasses = 'bg-yellow-50 border-yellow-200 text-yellow-900';
    iconColor = 'text-yellow-600';
    Icon = AlertTriangle;
  }

  return (
    <div className={`border-b ${colorClasses}`}>
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
        <Icon className={`w-4 h-4 flex-shrink-0 ${iconColor}`} />
        <p className="text-xs md:text-sm flex-1 min-w-0">
          {message}
        </p>
        <Link
          to="#"
          onClick={(e) => e.preventDefault()}
          className="inline-flex items-center gap-1 text-xs md:text-sm font-semibold hover:underline whitespace-nowrap"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Fazer upgrade</span>
          <span className="sm:hidden">Upgrade</span>
        </Link>
      </div>
    </div>
  );
}