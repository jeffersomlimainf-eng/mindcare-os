/**
 * logger.js — Meu Sistema PSI
 *
 * Wrapper de log centralizado:
 *  - Em produção (import.meta.env.DEV === false): silencia TUDO.
 *  - Em DEV: loga normalmente, mas redige campos sensíveis (LGPD).
 *
 * Uso:
 *   import { logger } from '../utils/logger';
 *   logger.log('dados do paciente:', obj);   // CPF/email serão [REDACTED]
 *   logger.error('Erro ao salvar:', error);
 */

const SENSITIVE_KEYS = [
  'cpf',
  'phone',
  'telefone',
  'email',
  'pix_key',
  'pixKey',
  'chavePix',
  'paciente_cpf',
  'pacienteCpf',
  'paciente_email',
  'pacienteEmail',
  'paciente_telefone',
  'pacienteTelefone',
  'referral_contact',
  'password',
  'senha',
  'novaSenha',
  'senhaAtual',
  'confirmarSenha',
];

function isSensitive(key) {
  const lower = key.toLowerCase();
  return SENSITIVE_KEYS.some((s) => lower.includes(s.toLowerCase()));
}

function sanitize(arg) {
  if (arg === null || arg === undefined) return arg;
  if (typeof arg !== 'object') return arg;

  if (Array.isArray(arg)) {
    return arg.map(sanitize);
  }

  const copy = { ...arg };
  for (const key of Object.keys(copy)) {
    if (isSensitive(key)) {
      copy[key] = '[REDACTED]';
    } else if (copy[key] !== null && typeof copy[key] === 'object') {
      copy[key] = sanitize(copy[key]);
    }
  }
  return copy;
}

const isDev = import.meta.env.DEV;

export const logger = {
  log: (...args) => {
    if (isDev) console.log(...args.map(sanitize));
  },
  error: (...args) => {
    if (isDev) console.error(...args.map(sanitize));
  },
  warn: (...args) => {
    if (isDev) console.warn(...args.map(sanitize));
  },
  info: (...args) => {
    if (isDev) console.info(...args.map(sanitize));
  },
  debug: (...args) => {
    if (isDev) console.debug(...args.map(sanitize));
  },
};
