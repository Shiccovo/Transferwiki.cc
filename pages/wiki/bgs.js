import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import { useState } from 'react';
import DocsLayout from '../../components/layout/DocsLayout';
import SiteMeta from '../../components/SiteMeta';

marked.setOptions({ gfm: true, breaks: false });

function ChevronIcon({ open }) {
  return (
    <svg
      className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

export default function BgsPage({ intro, sections }) {
  // First section open by default
  const [openSections, setOpenSections] = useState(() => {
    const init = {};
    if (sections.length > 0) init[0] = true;
    return init;
  });

  const toggle = (i) => {
    setOpenSections(prev => ({ ...prev, [i]: !prev[i] }));
  };

  return (
    <>
      <SiteMeta
        title="附录：学生案例"
        canonical="/wiki/bgs"
        description="历届转学生案例汇总，按季度整理。"
      />
      <DocsLayout>
        <div className="max-w-4xl mx-auto py-8 px-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">附录：学生案例</h1>

          {intro && (
            <div
              className="prose dark:prose-invert max-w-none mb-8"
              dangerouslySetInnerHTML={{ __html: intro }}
            />
          )}

          <div className="space-y-3">
            {sections.map((section, i) => (
              <div
                key={section.title}
                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggle(i)}
                  className="w-full flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-left transition-colors"
                >
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white m-0">
                    {section.title}
                  </h2>
                  <ChevronIcon open={!!openSections[i]} />
                </button>

                {openSections[i] && (
                  <div
                    className="px-6 py-4 prose dark:prose-invert max-w-none border-t border-gray-200 dark:border-gray-700"
                    dangerouslySetInnerHTML={{ __html: section.content }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </DocsLayout>
    </>
  );
}

export async function getStaticProps() {
  const filePath = path.join(process.cwd(), 'content/docs/bgs.md');
  const raw = fs.readFileSync(filePath, 'utf8');
  const { content } = matter(raw);

  const lines = content.split('\n');
  const introLines = [];
  const sections = [];
  let currentSection = null;

  for (const line of lines) {
    const headerMatch = line.match(/^## (.+)$/);
    if (headerMatch) {
      if (currentSection) sections.push(currentSection);
      currentSection = { title: headerMatch[1].trim(), lines: [] };
    } else if (currentSection) {
      currentSection.lines.push(line);
    } else {
      introLines.push(line);
    }
  }
  if (currentSection) sections.push(currentSection);

  return {
    props: {
      intro: marked.parse(introLines.join('\n')),
      sections: sections.map(s => ({
        title: s.title,
        content: marked.parse(s.lines.join('\n')),
      })),
    },
  };
}
