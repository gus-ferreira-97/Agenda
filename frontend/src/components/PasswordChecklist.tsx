import { Check, X } from 'lucide-react';

interface PasswordChecklistProps {
  password: string;
  show: boolean;
}

interface Rule {
  label: string;
  test: (password: string) => boolean;
}

const RULES: Rule[] = [
  {
    label: 'Pelo menos 8 caracteres',
    test: (p) => p.length >= 8,
  },
  {
    label: 'Pelo menos uma letra maiúscula',
    test: (p) => /[A-Z]/.test(p),
  },
  {
    label: 'Pelo menos uma letra minúscula',
    test: (p) => /[a-z]/.test(p),
  },
  {
    label: 'Pelo menos um número',
    test: (p) => /[0-9]/.test(p),
  },
  {
    label: 'Pelo menos um caractere especial',
    test: (p) => /[^A-Za-z0-9]/.test(p),
  },
];

export default function PasswordChecklist({ password, show }: PasswordChecklistProps) {
  if (!show) return null;

  return (
    <ul className="mt-2 space-y-1">
      {RULES.map((rule) => {
        const passed = rule.test(password);
        return (
          <li
            key={rule.label}
            className={`flex items-center gap-1.5 text-xs transition-colors ${
              passed ? 'text-green-600' : 'text-gray-400'
            }`}
          >
            {passed ? (
              <Check className="w-3.5 h-3.5 flex-shrink-0" />
            ) : (
              <X className="w-3.5 h-3.5 flex-shrink-0" />
            )}
            {rule.label}
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Helper exportado para verificar se a senha atende todas as regras.
 * Útil para bloquear o envio do formulário.
 */
export function isPasswordStrong(password: string): boolean {
  return RULES.every((rule) => rule.test(password));
}