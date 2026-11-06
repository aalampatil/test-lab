'use client';
import Editor, { loader, type EditorProps } from '@monaco-editor/react';
loader.config({ paths: { vs: '/monaco/vs' } });
export default function CodeEditor(props: EditorProps) {
  return <Editor {...props} />;
}
