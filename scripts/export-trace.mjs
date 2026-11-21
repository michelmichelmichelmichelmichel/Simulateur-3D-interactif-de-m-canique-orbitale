/**
 * Convertit l'export d'une session Claude Code (transcript.jsonl) en :
 *  - une copie brute anonymisée (.jsonl) ;
 *  - une version lisible (.md) : messages de l'utilisateur, réponses de l'IA,
 *    outils appelés et leurs résultats.
 *
 * Usage : node scripts/export-trace.mjs <transcript.jsonl> <nom-de-sortie>
 *   ex. : node scripts/export-trace.mjs transcript.jsonl 2026-11-21_01_cadrage-et-demo
 *
 * Anonymisation : toute adresse e-mail est remplacée par [MASQUÉ : adresse e-mail].
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'

const [input, name] = process.argv.slice(2)
if (!input || !name) {
  console.error('Usage : node scripts/export-trace.mjs <transcript.jsonl> <nom-de-sortie>')
  process.exit(1)
}

const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g
// Adresses génériques à conserver (attribution des commits)
const KEEP = new Set(['noreply@anthropic.com'])
let masked = 0
const anonymize = (text) =>
  text.replace(EMAIL, (match) => {
    if (KEEP.has(match)) return match
    masked++
    return '[MASQUÉ : adresse e-mail]'
  })

const MAX_LENGTH = 4000
const truncate = (text) =>
  text.length > MAX_LENGTH
    ? `${text.slice(0, MAX_LENGTH)}\n… [tronqué dans cette version lisible : ${text.length} caractères au total, voir le .jsonl]`
    : text

const fence = (text, lang = '') => `\`\`\`${lang}\n${text.replaceAll('```', "'''")}\n\`\`\``

const raw = readFileSync(input, 'utf8')
const lines = raw.split('\n').filter(Boolean)
const out = [`# Trace de session Claude Code — ${name}`, '']
out.push(
  '> Version lisible générée par `scripts/export-trace.mjs` à partir de l’export',
  '> officiel de l’application. Les raisonnements internes du modèle (« thinking »)',
  '> ne sont pas repris ici ; l’export brut complet est dans le fichier `.jsonl`.',
  '> Les résultats d’outils très longs sont tronqués dans cette version uniquement.',
  '',
)

const counts = { user: 0, assistant: 0, tool_use: 0, tool_result: 0 }
for (const line of lines) {
  const entry = JSON.parse(line)
  if (entry.type !== 'user' && entry.type !== 'assistant') continue
  const content = entry.message?.content
  const time = entry.timestamp ? ` — ${entry.timestamp.slice(0, 19).replace('T', ' ')} UTC` : ''

  if (typeof content === 'string') {
    if (entry.isMeta) continue
    counts.user++
    out.push(`## Utilisateur${time}`, '', content, '')
    continue
  }
  if (!Array.isArray(content)) continue

  for (const block of content) {
    if (block.type === 'text' && block.text.trim()) {
      const who = entry.type === 'assistant' ? 'Claude' : 'Utilisateur'
      counts[entry.type]++
      out.push(`## ${who}${time}`, '', block.text, '')
    } else if (block.type === 'tool_use') {
      counts.tool_use++
      out.push(`### Outil appelé : \`${block.name}\``, '', fence(truncate(JSON.stringify(block.input, null, 2)), 'json'), '')
    } else if (block.type === 'tool_result') {
      counts.tool_result++
      const result = Array.isArray(block.content)
        ? block.content.map((c) => (c.type === 'text' ? c.text : `[${c.type}]`)).join('\n')
        : String(block.content ?? '')
      const label = block.is_error ? 'Résultat (erreur)' : 'Résultat'
      out.push(`#### ${label}`, '', fence(truncate(result)), '')
    }
  }
}

mkdirSync('ai-traces/sessions', { recursive: true })
writeFileSync(`ai-traces/sessions/${name}.md`, anonymize(out.join('\n')))
const maskedInMarkdown = masked
writeFileSync(`ai-traces/sessions/${name}.jsonl`, anonymize(raw))
console.log({ ...counts, emailsMasquesMarkdown: maskedInMarkdown, emailsMasquesJsonl: masked - maskedInMarkdown })
