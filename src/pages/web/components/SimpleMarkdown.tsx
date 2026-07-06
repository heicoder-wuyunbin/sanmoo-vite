import { Typography, theme as antTheme } from 'antd';
import React, { useMemo } from 'react';

type Props = {
  content?: string;
};

const keywordSet = new Set([
  'const',
  'let',
  'var',
  'function',
  'return',
  'if',
  'else',
  'for',
  'while',
  'switch',
  'case',
  'break',
  'continue',
  'class',
  'new',
  'import',
  'from',
  'export',
  'default',
  'async',
  'await',
  'try',
  'catch',
  'finally',
  'throw',
  'public',
  'private',
  'protected',
  'static',
  'void',
  'true',
  'false',
  'null',
  'undefined',
  'package',
  'extends',
  'implements',
  'interface',
]);

type Token = { type: 'keyword' | 'string' | 'number' | 'comment' | 'function' | 'operator' | 'punctuation' | 'plain'; value: string };

function tokenizeLine(line: string, lang?: string): Token[] {
  const language = (lang || '').toLowerCase();
  if (!language || ['text', 'plain'].includes(language)) {
    return [{ type: 'plain', value: line }];
  }

  if (language === 'json') {
    return line
      .split(/(".*?"(?=\s*:)|".*?"|\b-?\d+(\.\d+)?\b|[{}[\],:])/g)
      .filter((s) => s !== undefined && s !== '')
      .map((part) => {
        if (/^".*"$/.test(part)) return { type: 'string', value: part };
        if (/^-?\d+(\.\d+)?$/.test(part))
          return { type: 'number', value: part };
        if (/^[{}[\],:]$/.test(part))
          return { type: 'punctuation', value: part };
        return { type: 'plain', value: part };
      });
  }

  const chunks = line.split(
    /((?:\/\/.*$)|(?:#.*$)|(?:"(?:\\.|[^"])*")|(?:'(?:\\.|[^'])*')|\b\d+(\.\d+)?\b|\b[a-zA-Z_]\w*\b|[=+\-*/%!<>|&^~]+|[()[\]{}.,;:])/g,
  );

  const out: Token[] = [];
  for (const chunk of chunks) {
    if (!chunk) continue;
    if (/^(\/\/.*|#.*)$/.test(chunk)) {
      out.push({ type: 'comment', value: chunk });
      continue;
    }
    if (/^"(?:\\.|[^"])*"$/.test(chunk) || /^'(?:\\.|[^'])*'$/.test(chunk)) {
      out.push({ type: 'string', value: chunk });
      continue;
    }
    if (/^\d+(\.\d+)?$/.test(chunk)) {
      out.push({ type: 'number', value: chunk });
      continue;
    }
    if (/^[=+\-*/%!<>|&^~]+$/.test(chunk)) {
      out.push({ type: 'operator', value: chunk });
      continue;
    }
    if (/^[()[\]{}.,;:]$/.test(chunk)) {
      out.push({ type: 'punctuation', value: chunk });
      continue;
    }
    if (/^[a-zA-Z_]\w*$/.test(chunk)) {
      out.push({
        type: keywordSet.has(chunk) ? 'keyword' : 'plain',
        value: chunk,
      });
      continue;
    }
    out.push({ type: 'plain', value: chunk });
  }

  for (let i = 0; i < out.length - 1; i += 1) {
    if (
      out[i].type === 'plain' &&
      /^[a-zA-Z_]\w*$/.test(out[i].value) &&
      out[i + 1].value === '('
    ) {
      out[i] = { type: 'function', value: out[i].value };
    }
  }

  return out;
}

const SimpleMarkdown: React.FC<Props> = ({ content }) => {
  const { token } = antTheme.useToken();

  const codeBlockStyle = useMemo<React.CSSProperties>(
    () => ({
      background: `color-mix(in srgb, ${token.colorPrimaryBg} 60%, ${token.colorBgContainer})`,
      color: token.colorText,
      borderRadius: token.borderRadiusLG,
      padding: 18,
      overflowX: 'auto',
      margin: '12px 0 18px',
      border: `1px solid ${token.colorBorderSecondary}`,
      boxShadow: token.boxShadow,
    }),
    [token],
  );

  const inlineCodeStyle = useMemo<React.CSSProperties>(
    () => ({
      background: token.colorFillTertiary,
      padding: '2px 8px',
      borderRadius: token.borderRadius,
      border: `1px solid ${token.colorBorderSecondary}`,
      fontFamily:
        'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    }),
    [token],
  );

  const tokenColor = useMemo<Record<string, string>>(
    () => ({
      keyword: token.colorPrimary,
      string: token.colorSuccess,
      number: token.colorWarning,
      comment: token.colorTextTertiary,
      function: token.colorWarning,
      operator: token.colorTextSecondary,
      punctuation: token.colorTextSecondary,
      plain: token.colorText,
    }),
    [token],
  );

  if (!content) {
    return <Typography.Text type="secondary">暂无内容</Typography.Text>;
  }

  const lines = content.split('\n');
  const nodes: React.ReactNode[] = [];
  let keySeq = 0;
  const nextKey = (prefix: string) => `${prefix}-${keySeq++}`;
  let inCode = false;
  let codeLang = '';
  let codeBuffer: string[] = [];

  const flushCode = () => {
    if (codeBuffer.length > 0) {
      nodes.push(
        <pre key={nextKey('code')} style={codeBlockStyle}>
          <code>
            {codeBuffer.map((codeLine) => (
              <div key={nextKey('line')}>
                {tokenizeLine(codeLine, codeLang).map((tkn) => (
                  <span
                    key={nextKey('tk')}
                    style={{ color: tokenColor[tkn.type] }}
                  >
                    {tkn.value}
                  </span>
                ))}
              </div>
            ))}
          </code>
        </pre>,
      );
      codeBuffer = [];
      codeLang = '';
    }
  };

  lines.forEach((line) => {
    if (line.trim().startsWith('```')) {
      if (inCode) {
        flushCode();
        inCode = false;
      } else {
        codeLang = line.trim().slice(3).trim();
        inCode = true;
      }
      return;
    }

    if (inCode) {
      codeBuffer.push(line);
      return;
    }

    const image = line.match(/^!\[(.*)\]\((.+)\)$/);
    if (image) {
      nodes.push(
        <img
          key={nextKey('img')}
          src={image[2]}
          alt={image[1] || 'image'}
          style={{
            maxWidth: '100%',
            borderRadius: token.borderRadiusLG,
            margin: '12px 0 20px',
            border: `1px solid ${token.colorBorderSecondary}`,
            boxShadow: token.boxShadow,
          }}
        />,
      );
      return;
    }

    const h1 = line.match(/^#\s+(.+)$/);
    const h2 = line.match(/^##\s+(.+)$/);
    const h3 = line.match(/^###\s+(.+)$/);
    if (h1) {
      nodes.push(
        <Typography.Title
          key={nextKey('h1')}
          level={2}
          style={{
            marginTop: 18,
            marginBottom: 10,
            color: token.colorText,
            textWrap: 'balance',
          }}
        >
          {h1[1]}
        </Typography.Title>,
      );
      return;
    }
    if (h2) {
      nodes.push(
        <Typography.Title
          key={nextKey('h2')}
          level={3}
          style={{
            marginTop: 18,
            marginBottom: 10,
            color: token.colorText,
            textWrap: 'balance',
          }}
        >
          {h2[1]}
        </Typography.Title>,
      );
      return;
    }
    if (h3) {
      nodes.push(
        <Typography.Title
          key={nextKey('h3')}
          level={4}
          style={{ marginTop: 16, marginBottom: 8, color: token.colorText }}
        >
          {h3[1]}
        </Typography.Title>,
      );
      return;
    }

    if (line.trim().startsWith('> ')) {
      nodes.push(
        <blockquote
          key={nextKey('quote')}
          style={{
            margin: '12px 0 18px',
            borderLeft: `4px solid ${token.colorPrimary}`,
            padding: '2px 0 2px 14px',
            color: token.colorTextSecondary,
            background: `linear-gradient(90deg, ${token.colorPrimaryBg} 0%, ${token.colorBgContainer} 100%)`,
            borderRadius: token.borderRadius,
          }}
        >
          {line.replace(/^>\s+/, '')}
        </blockquote>,
      );
      return;
    }

    if (line.trim().startsWith('- ')) {
      nodes.push(
        <Typography.Paragraph
          key={nextKey('li')}
          style={{ marginBottom: 8, lineHeight: 1.9, color: token.colorText }}
        >
          {'• '}
          {line.replace(/^-\s+/, '')}
        </Typography.Paragraph>,
      );
      return;
    }

    if (line.trim() === '') {
      nodes.push(<div key={nextKey('sp')} style={{ height: 8 }} />);
      return;
    }

    const withInlineCode = line.split(/(`[^`]+`)/g).map((chunk) => {
      if (/^`[^`]+`$/.test(chunk)) {
        return (
          <code key={nextKey('inline')} style={inlineCodeStyle}>
            {chunk.slice(1, -1)}
          </code>
        );
      }
      return <React.Fragment key={nextKey('txt')}>{chunk}</React.Fragment>;
    });

    nodes.push(
      <Typography.Paragraph
        key={nextKey('p')}
        style={{
          marginBottom: 12,
          lineHeight: 1.95,
          fontSize: 16,
          color: token.colorText,
        }}
      >
        {withInlineCode}
      </Typography.Paragraph>,
    );
  });

  if (inCode) {
    flushCode();
  }

  return <div>{nodes}</div>;
};

export default SimpleMarkdown;
