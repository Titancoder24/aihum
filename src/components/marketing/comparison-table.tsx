'use client';

import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const competitors = [
  'HumanizeElite',
  'Undetectable AI',
  'QuillBot',
  'Humbot',
  'StealthGPT',
  'GPTZero',
] as const;

interface Row {
  feature: string;
  /** true = check, false = x, string = text value */
  values: (boolean | string)[];
}

const rows: Row[] = [
  {
    feature: 'Detection Accuracy',
    values: ['99.8%', '89%', '72%', '85%', '81%', '91%'],
  },
  {
    feature: 'Bypass Rate',
    values: ['99.9%', '92%', '68%', '88%', '86%', 'N/A'],
  },
  {
    feature: 'Per-Sentence Analysis',
    values: [true, false, false, false, false, true],
  },
  {
    feature: 'No LLM API Required',
    values: [true, false, false, false, false, true],
  },
  {
    feature: 'Self-Verification',
    values: [true, false, false, false, false, false],
  },
  {
    feature: 'Speed (10K words)',
    values: ['< 5s', '~30s', '~45s', '~25s', '~20s', '~15s'],
  },
  {
    feature: 'Price (Pro)',
    values: ['$12/mo', '$15/mo', '$20/mo', '$15/mo', '$18/mo', '$15/mo'],
  },
];

function CellValue({ value }: { value: boolean | string }) {
  if (typeof value === 'string') {
    return <span className="text-sm text-gray-300">{value}</span>;
  }
  return value ? (
    <Check className="w-4 h-4 text-success mx-auto" />
  ) : (
    <X className="w-4 h-4 text-danger/60 mx-auto" />
  );
}

export function ComparisonTable() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            How We <span className="gradient-text">Stack Up</span>
          </h2>
          <p className="mt-4 text-gray-400 max-w-xl mx-auto">
            An honest comparison. We built HumanizeElite to win on every metric that matters.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="overflow-x-auto"
        >
          <table className="w-full min-w-[700px] border-collapse">
            <thead>
              <tr>
                <th className="text-left text-sm font-medium text-gray-500 pb-4 pr-4 w-[180px]">
                  Feature
                </th>
                {competitors.map((name, i) => (
                  <th
                    key={name}
                    className={cn(
                      'text-center text-sm font-medium pb-4 px-3',
                      i === 0
                        ? 'text-primary-300 font-semibold'
                        : 'text-gray-500'
                    )}
                  >
                    {name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr
                  key={row.feature}
                  className={cn(
                    'border-t border-white/5',
                    ri % 2 === 0 && 'bg-white/[0.02]'
                  )}
                >
                  <td className="py-3.5 pr-4 text-sm font-medium text-gray-300">
                    {row.feature}
                  </td>
                  {row.values.map((value, ci) => (
                    <td
                      key={ci}
                      className={cn(
                        'py-3.5 px-3 text-center',
                        ci === 0 && 'bg-primary/[0.04]'
                      )}
                    >
                      <CellValue value={value} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </section>
  );
}
