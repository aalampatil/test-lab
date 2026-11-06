'use client';
import Editor, { loader, type EditorProps } from '@monaco-editor/react';
import { useEffect, useState } from 'react';
type Monaco = typeof import('monaco-editor');
type MonacoWindow = Window & {
  TestLabMonaco?: Monaco;
  MonacoEnvironment?: { getWorker: () => Worker };
};
let initialization: Promise<void> | undefined;
function initialize() {
  if (!initialization)
    initialization = new Promise<void>((resolve, reject) => {
      const host = window as MonacoWindow;
      host.MonacoEnvironment = {
        getWorker: () => new Worker('/monaco/editor.worker.js', { type: 'module' }),
      };
      const style = document.createElement('link');
      style.rel = 'stylesheet';
      style.href = '/monaco/editor.css';
      document.head.appendChild(style);
      const script = document.createElement('script');
      script.src = '/monaco/editor.js';
      script.async = true;
      script.onload = () => {
        if (!host.TestLabMonaco) {
          reject(Error('Editor unavailable.'));
          return;
        }
        loader.config({ monaco: host.TestLabMonaco });
        resolve();
      };
      script.onerror = () => {
        initialization = undefined;
        reject(Error('Editor unavailable. Use the simple editor.'));
      };
      document.head.appendChild(script);
    });
  return initialization;
}
export default function CodeEditor(props: EditorProps) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let active = true;
    initialize()
      .then(() => {
        if (active) setReady(true);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  return ready ? <Editor {...props} /> : props.loading;
}
