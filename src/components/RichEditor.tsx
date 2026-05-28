import React, { useRef, useEffect, useCallback } from 'react';

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
  dir?: 'rtl' | 'ltr';
}

interface ToolBtn {
  cmd: string;
  arg?: string;
  icon: string;
  title: string;
}

const TOOLS: ToolBtn[] = [
  { cmd: 'bold',          icon: '<b>B</b>',   title: 'Bold' },
  { cmd: 'italic',        icon: '<i>I</i>',   title: 'Italic' },
  { cmd: 'underline',     icon: '<u>U</u>',   title: 'Underline' },
  { cmd: 'insertUnorderedList', icon: '≡',    title: 'List' },
  { cmd: 'formatBlock',   arg: 'h3', icon: 'H',  title: 'Heading' },
  { cmd: 'formatBlock',   arg: 'p',  icon: '¶',  title: 'Paragraph' },
];

export default function RichEditor({ value, onChange, placeholder = '', minHeight = 140, dir = 'rtl' }: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternal = useRef(false);

  // Set initial HTML once
  useEffect(() => {
    if (!editorRef.current) return;
    if (editorRef.current.innerHTML !== value) {
      isInternal.current = true;
      editorRef.current.innerHTML = value;
      isInternal.current = false;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInput = useCallback(() => {
    if (!editorRef.current || isInternal.current) return;
    onChange(editorRef.current.innerHTML);
  }, [onChange]);

  const exec = (cmd: string, arg?: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, arg);
    onChange(editorRef.current?.innerHTML ?? '');
  };

  const toolbarStyle: React.CSSProperties = {
    display: 'flex', flexWrap: 'wrap', gap: 4, padding: '8px 10px',
    background: 'var(--surface-2)', borderBottom: '1px solid var(--border)',
    borderRadius: '10px 10px 0 0',
  };

  const btnStyle: React.CSSProperties = {
    width: 30, height: 30, borderRadius: 6, border: '1px solid var(--border)',
    background: 'var(--surface)', cursor: 'pointer', fontSize: 13,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'var(--text)', fontFamily: 'Jost,sans-serif', transition: 'all 0.15s',
  };

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', marginBottom: 12 }}>
      {/* Toolbar */}
      <div style={toolbarStyle}>
        {TOOLS.map((t, i) => (
          <button
            key={i}
            title={t.title}
            onMouseDown={(e) => { e.preventDefault(); exec(t.cmd, t.arg); }}
            style={btnStyle}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--primary-light)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
            dangerouslySetInnerHTML={{ __html: t.icon }}
          />
        ))}
        <div style={{ width: 1, background: 'var(--border)', margin: '4px 4px' }} />
        {/* Clear formatting */}
        <button
          title="Clear formatting"
          onMouseDown={(e) => { e.preventDefault(); exec('removeFormat'); }}
          style={btnStyle}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--primary-light)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
        >✕</button>
      </div>

      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        dir={dir}
        onInput={handleInput}
        style={{
          minHeight,
          padding: '12px 14px',
          fontSize: 14,
          lineHeight: 1.8,
          fontFamily: 'Cairo,sans-serif',
          color: 'var(--text)',
          background: 'var(--surface)',
          outline: 'none',
          wordBreak: 'break-word',
        }}
        data-placeholder={placeholder}
      />

      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: var(--text-muted);
          pointer-events: none;
        }
        [contenteditable] h3 { font-size: 18px; font-weight: 800; margin: 8px 0 4px; }
        [contenteditable] ul { padding-inline-start: 20px; margin: 6px 0; }
        [contenteditable] li { margin: 2px 0; }
      `}</style>
    </div>
  );
}
