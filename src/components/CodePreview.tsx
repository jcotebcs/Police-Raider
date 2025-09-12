import React from 'react';

interface CodePreviewProps {
  code: string;
  language: string;
}

const CodePreview: React.FC<CodePreviewProps> = ({ code, language }) => {
  // Simple syntax highlighting for TypeScript and Markdown
  const highlightCode = (code: string, lang: string) => {
    if (lang === 'markdown') {
      return highlightMarkdown(code);
    }
    return highlightTypeScript(code);
  };

  const highlightTypeScript = (code: string) => {
    // Basic TypeScript syntax highlighting
    return code
      .replace(/(\/\*[\s\S]*?\*\/|\/\/.*$)/gm, '<span class="syntax-comment">$1</span>')
      .replace(/\b(interface|class|function|const|let|var|export|import|type|enum|async|await|return|if|else|for|while|try|catch|throw|new)\b/g, '<span class="syntax-keyword">$1</span>')
      .replace(/\b(string|number|boolean|any|void|Promise|Array|Record)\b/g, '<span class="syntax-type">$1</span>')
      .replace(/'([^']*)'|"([^"]*)"|`([^`]*)`/g, '<span class="syntax-string">$&</span>')
      .replace(/\b(\d+)\b/g, '<span class="syntax-number">$1</span>')
      .replace(/(@\w+)/g, '<span class="syntax-decorator">$1</span>');
  };

  const highlightMarkdown = (code: string) => {
    return code
      .replace(/^(#{1,6})\s(.*)$/gm, '<span class="md-header">$1 $2</span>')
      .replace(/\*\*(.*?)\*\*/g, '<span class="md-bold">**$1**</span>')
      .replace(/\*(.*?)\*/g, '<span class="md-italic">*$1*</span>')
      .replace(/`([^`]+)`/g, '<span class="md-code">`$1`</span>')
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<span class="md-code-block">```$1\n$2```</span>')
      .replace(/^\s*[-*+]\s(.*)$/gm, '<span class="md-list">• $1</span>')
      .replace(/^\s*\d+\.\s(.*)$/gm, '<span class="md-list">$1</span>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<span class="md-link">[$1]($2)</span>');
  };

  return (
    <div className="relative h-96 overflow-auto">
      <pre className="code-preview h-full p-4 text-sm leading-relaxed text-gray-300 whitespace-pre-wrap">
        <code
          dangerouslySetInnerHTML={{
            __html: highlightCode(code, language)
          }}
        />
      </pre>
    </div>
  );
};

export default CodePreview;