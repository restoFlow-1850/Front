import { useMemo } from 'react'

import { parseMessageBlocks } from '../lib/aiChat'

function Token({ token }) {
  if (token.type === 'bold') {
    return <strong className="font-bold text-slate-900 dark:text-white">{token.value}</strong>
  }
  if (token.type === 'amount') {
    return (
      <span className="rounded-md bg-emerald-50 px-1 py-0.5 font-bold tabular-nums text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
        {token.value}
      </span>
    )
  }
  return <>{token.value}</>
}

function Tokens({ tokens }) {
  return tokens.map((token, index) => <Token key={`${token.type}-${index}`} token={token} />)
}

export default function AiMessageContent({ text }) {
  const blocks = useMemo(() => parseMessageBlocks(text), [text])

  if (blocks.length === 0) return null

  return (
    <div className="space-y-2">
      {blocks.map((block, index) =>
        block.type === 'list' ? (
          <ul key={`list-${index}`} className="space-y-1">
            {block.items.map((tokens, itemIndex) => (
              <li key={`item-${itemIndex}`} className="flex gap-2">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#F97316]" />
                <span className="min-w-0">
                  <Tokens tokens={tokens} />
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p key={`p-${index}`} className="whitespace-pre-line">
            <Tokens tokens={block.tokens} />
          </p>
        ),
      )}
    </div>
  )
}
