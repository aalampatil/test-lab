'use client';
import { useState } from 'react';
import { Check, Copy, FolderTree, Terminal } from 'lucide-react';
import type { Lesson } from '@/lib/content';
import { projectGuide } from '@/lib/project-guides';

export function ProjectGuide({ lesson }: { lesson: Lesson }) {
  const [language, setLanguage] = useState<'js' | 'ts'>('js');
  const guide = projectGuide(lesson, language);
  return (
    <div className="project-guide">
      <span className="eyebrow">FROM THE LAB TO YOUR REPOSITORY</span>
      <h2>Use this in your own project.</h2>
      <p>
        Open your repository in your code editor. The repository root is the folder that contains{' '}
        <code>package.json</code>. Run every command below in a terminal opened in that folder.
      </p>
      <div className="filter-pills project-language" role="group" aria-label="Example language">
        <button
          aria-pressed={language === 'js'}
          className={language === 'js' ? 'active' : ''}
          onClick={() => setLanguage('js')}
        >
          JavaScript
        </button>
        <button
          aria-pressed={language === 'ts'}
          className={language === 'ts' ? 'active' : ''}
          onClick={() => setLanguage('ts')}
        >
          TypeScript
        </button>
      </div>
      <div className="project-step">
        <h3>
          <span>1</span>Install the test runner
        </h3>
        <p>
          Use a supported Node.js LTS release, such as Node.js 22. If this is a new folder without a
          package.json, run <code>npm init -y</code> first. In an existing repository, keep your
          package.json.
        </p>
        <Snippet label="Terminal · repository root" code="npm install -D vitest" />
      </div>
      <div className="project-step">
        <h3>
          <span>2</span>Create the folders and files
        </h3>
        <p>
          Create a folder named <code>tests</code> directly inside your repository. Inside it,
          create <code>{guide.testPath.split('/').at(-1)}</code>. The <code>.test.{language}</code>{' '}
          ending identifies this as a test file.
        </p>
        <Snippet label="Folder structure" code={guide.tree} />
        <p>
          The application function lives in <code>{guide.sourcePath}</code>; its test lives
          separately in <code>{guide.testPath}</code>. This is one useful convention. Some teams
          keep tests next to the source using <code>*.test.{language}</code>, or use a folder called{' '}
          <code>__tests__</code>. Follow an existing repository’s convention and configuration.
        </p>
      </div>
      <div className="project-step">
        <h3>
          <span>3</span>Add the application code
        </h3>
        <p>
          Create <code>src/utils</code> if it does not exist, then add this file. When testing a
          function you already have, use its real file instead of copying it into another folder.
        </p>
        <Snippet label={guide.sourcePath} code={guide.source} />
      </div>
      <div className="project-step">
        <h3>
          <span>4</span>Write the test file
        </h3>
        <p>
          Paste this into <code>{guide.testPath}</code>. The import starts with <code>../</code>{' '}
          because it goes up from the tests folder to the repository root, then into{' '}
          <code>src/utils</code>.
        </p>
        <Snippet label={guide.testPath} code={guide.test} />
        <p>
          Replace the function import and assertions with the behavior of your own application. Test
          the exported function through its public interface.
        </p>
      </div>
      <div className="project-step">
        <h3>
          <span>5</span>Tell Vitest where to look
        </h3>
        <p>
          Create <code>vitest.config.mjs</code> beside package.json. If you already have a Vitest
          config, merge the relevant settings into that file. This Node environment is for the plain
          functions in these lessons; React component tests need a DOM environment and additional
          setup.
        </p>
        <Snippet label="vitest.config.mjs" code={guide.config} />
        <p>
          Add these entries inside the existing <code>scripts</code> object in package.json. Keep
          your other scripts. If <code>test</code> already runs another framework, use a new name
          such as <code>test:unit</code> and use that name in the commands below.
        </p>
        <Snippet label="package.json · scripts fragment" code={guide.scripts} />
      </div>
      <div className="project-step">
        <h3>
          <span>6</span>Run, read, and repeat
        </h3>
        <Snippet label="Run this test file once" code={guide.run} />
        <p>
          You should see <strong>1 test file passed</strong> and <strong>2 tests passed</strong>. A
          failed assertion gives you the test name, expected value, actual value, and the line to
          inspect. Exit code 0 means the run passed; a nonzero exit code means it failed.
        </p>
        <Snippet label="Rerun when you save a change" code={guide.watch} />
        <p>
          In watch mode, save an edit to the function or test and watch the results update. Press{' '}
          <code>q</code> to exit. Run <code>npm test</code> to execute all matching test files.
        </p>
      </div>
      <div className="project-step">
        <h3>
          <span>7</span>Prove your test catches a bug
        </h3>
        <p>
          Temporarily change the function to return an incorrect result. Run the test and confirm it
          fails, then restore the correct implementation and run again. Keep both the source and
          test files in Git so your test protects future changes.
        </p>
      </div>
      <div className="info-note">
        <FolderTree size={17} />
        <p>
          These paths are for your own repository. In the TestLab editor, keep <code>./app</code> as
          the application import. The lab supplies that virtual file; your repository uses the real
          path shown above.
        </p>
      </div>
      <div className="project-troubleshooting">
        <h3>
          <Terminal size={16} />
          If something goes wrong
        </h3>
        <dl>
          <dt>“No test files found”</dt>
          <dd>
            Check that the file is inside tests, ends in .test.{language}, and matches your config’s
            include pattern.
          </dd>
          <dt>“Cannot find module”</dt>
          <dd>
            Check the relative import, file spelling, capitalization, and exported function name. Do
            not copy the lab’s ./app import into your repository.
          </dd>
          <dt>“Missing script: test”</dt>
          <dd>
            Save the scripts entry in the root package.json, then run the command in that same
            folder.
          </dd>
          <dt>The terminal keeps running after a pass</dt>
          <dd>You are in watch mode. Press q, or use npm test for a single run.</dd>
        </dl>
      </div>
    </div>
  );
}

function Snippet({ label, code }: { label: string; code: string }) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  return (
    <div className="project-snippet">
      <div className="code-label">
        <span>{label}</span>
        <button
          aria-label={`Copy ${label}`}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(code);
              setCopied(true);
              setError('');
            } catch {
              setError('Select the code below and copy it manually.');
            }
          }}
        >
          {copied ? (
            <>
              <Check size={13} />
              Copied
            </>
          ) : (
            <>
              <Copy size={13} />
              Copy
            </>
          )}
        </button>
      </div>
      <pre>
        <code>{code}</code>
      </pre>
      {error && (
        <p role="status" className="error-text">
          {error}
        </p>
      )}
    </div>
  );
}
