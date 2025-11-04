// hooks/use-article-headings.ts
import { useEffect, useState } from "react";

type TocItem = {
  id: string;
  title: string;
  level: number;
};

export function useArticleHeadings() {
  const [headings, setHeadings] = useState<TocItem[]>([]);

  useEffect(() => {
    const collect = () => {
      const container =
        document.getElementById("article-content") ?? document.body;
      const nodes = Array.from(container.querySelectorAll("h2, h3"));
      const toc = nodes
        .filter((node) => !!node.id)
        .map((node) => ({
          id: node.id,
          title: node.textContent || "",
          level: Number(node.tagName.replace("H", "")),
        }));
      setHeadings(toc);
    };

    collect();

    const observer = new MutationObserver(() => {
      collect();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return headings;
}
