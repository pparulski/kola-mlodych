import React from "react";

interface TextWithLinksProps {
  text?: string;
  className?: string;
}

// Renders plain text preserving line breaks and converting URLs/markdown links into anchor tags safely.
// Supported:
// - Markdown-style: [label](https://example.com) or [label](mailto:user@example.com)
// - Plain URLs: https://example.com, http://example.com, mailto:user@example.com
// - www.example.com (auto-prepended with https://)
export function TextWithLinks({ text, className }: TextWithLinksProps) {
  if (!text) return null;

  const renderLine = (line: string, keyPrefix: string) => {
    const nodes: React.ReactNode[] = [];
    let lastIndex = 0;

    // Combined regex for markdown links and plain URLs
    const pattern = /\[([^\]]+)\]\(((?:https?:\/\/|mailto:)[^\s)]+)\)|(https?:\/\/[\w.-]+[^\s]*|mailto:[^\s]+|\bwww\.[\w.-]+[^\s]*)/g;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(line)) !== null) {
      const [full, mdLabel, mdUrl, plainUrl] = match;
      const matchStart = match.index;

      // Text before match
      if (matchStart > lastIndex) {
        nodes.push(line.slice(lastIndex, matchStart));
      }

      let url = mdUrl || plainUrl || "";
      let label = mdLabel || url;

      // Normalize www.* to https://www.*
      if (/^www\./i.test(url)) {
        url = `https://${url}`;
      }

      // Basic protocol whitelist
      const isAllowed = /^(https?:\/\/|mailto:)/i.test(url);
      if (!isAllowed) {
        // Fallback: render as text if protocol not allowed
        nodes.push(full);
      } else {
        nodes.push(
          <a
            key={`${keyPrefix}-${nodes.length}`}
            href={url}
            target={url.startsWith("http") ? "_blank" : undefined}
            rel={url.startsWith("http") ? "noopener noreferrer nofollow" : undefined}
            className="text-primary underline-offset-4 hover:underline break-words"
          >
            {label}
          </a>
        );
      }

      lastIndex = matchStart + full.length;
    }

    // Remaining text after last match
    if (lastIndex < line.length) {
      nodes.push(line.slice(lastIndex));
    }

    return <span key={keyPrefix}>{nodes}</span>;
  };

  const lines = text.split("\n");
  return (
    <p className={className}>
      {lines.map((line, i) => (
        <React.Fragment key={`l-${i}`}>
          {renderLine(line, `seg-${i}`)}
          {i < lines.length - 1 && <br />}
        </React.Fragment>
      ))}
    </p>
  );
}
