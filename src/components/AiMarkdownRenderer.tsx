import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';
import { CheckCircle2, ChevronRight, Hash, Quote, Terminal } from 'lucide-react';

interface AiMarkdownRendererProps {
  content: string;
}

export const AiMarkdownRenderer: React.FC<AiMarkdownRendererProps> = ({ content }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-4"
    >
      <div className="prose prose-zinc dark:prose-invert max-w-none">
        <ReactMarkdown
          components={{
            // Custom H1
            h1: ({ children }) => (
              <div className="flex items-center gap-3 pb-2 border-b border-zinc-200 dark:border-zinc-800 mt-6 first:mt-0 mb-4">
                <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                  <Hash className="w-5 h-5" />
                </div>
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 m-0">
                  {children}
                </h1>
              </div>
            ),
            // Custom H2
            h2: ({ children }) => (
              <h2 className="flex items-center gap-2 text-xl font-semibold text-zinc-800 dark:text-zinc-100 mt-6 mb-3">
                <span className="w-1.5 h-6 rounded-full bg-indigo-500" />
                {children}
              </h2>
            ),
            // Custom H3
            h3: ({ children }) => (
              <h3 className="text-lg font-medium text-indigo-600 dark:text-indigo-400 mt-4 mb-2">
                {children}
              </h3>
            ),
            // Custom Paragraph
            p: ({ children }) => (
              <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed mb-4 text-[15px]">
                {children}
              </p>
            ),
            // Custom List Items
            ul: ({ children }) => (
              <ul className="grid gap-2 my-4 pl-0 list-none">
                {children}
              </ul>
            ),
            li: ({ children }) => (
              <li className="flex gap-3 items-start p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800/50 hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-colors">
                <div className="mt-1 min-w-[1.25rem]">
                  <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                </div>
                <div className="text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed">
                  {children}
                </div>
              </li>
            ),
            // Custom Blockquote
            blockquote: ({ children }) => (
              <div className="relative my-6 pl-6 lg:pl-8 py-1">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-violet-500 rounded-full" />
                <Quote className="absolute -left-2 -top-4 w-6 h-6 text-indigo-200 dark:text-indigo-900/50 fill-current rotate-180" />
                <blockquote className="text-zinc-700 dark:text-zinc-300 italic">
                  {children}
                </blockquote>
              </div>
            ),
            // Custom Code Block
            code: ({ node, inline, className, children, ...props }: any) => {
              const match = /language-(\w+)/.exec(className || '');
              return !inline ? (
                <div className="relative my-4 rounded-xl overflow-hidden bg-[#1e1e1e] border border-zinc-800 shadow-xl">
                  <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-zinc-800">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500/80" />
                      <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                      <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
                      <Terminal className="w-3 h-3" />
                      {match ? match[1] : 'code'}
                    </div>
                  </div>
                  <div className="p-4 overflow-x-auto">
                    <code
                      className="font-mono text-sm text-zinc-300"
                      {...props}
                    >
                      {children}
                    </code>
                  </div>
                </div>
              ) : (
                <code
                  className="px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm font-mono text-indigo-600 dark:text-indigo-400"
                  {...props}
                >
                  {children}
                </code>
              );
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </motion.div>
  );
};
