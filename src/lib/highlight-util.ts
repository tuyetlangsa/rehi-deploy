import type Highlight from "@/db/entities/highlight";

interface TextMapEntry {
  node: Text;
  start: number;
  end: number;
}

interface MatchPosition {
  map: TextMapEntry[];
  startOffset: number;
  endOffset: number;
}

// interface DomPathResult {
//   path: string;
//   offset: number;
// }

export function applyDistributedHighlight(
  range: Range,
  color: string = "rgba(255, 235, 59, 0.6)",
  highlightId?: string
) {
  const iterator = document.createNodeIterator(
    range.commonAncestorContainer,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        if (!node.nodeValue?.trim()) {
          return NodeFilter.FILTER_REJECT;
        }
        const nodeRange = document.createRange();
        nodeRange.selectNodeContents(node);
        return range.compareBoundaryPoints(Range.END_TO_START, nodeRange) < 0 &&
          range.compareBoundaryPoints(Range.START_TO_END, nodeRange) > 0
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT;
      },
    }
  );

  const nodesToWrap: Text[] = [];
  let node: Node | null;
  while ((node = iterator.nextNode())) {
    nodesToWrap.push(node as Text);
  }

  for (const textNode of nodesToWrap) {
    const nodeRange = document.createRange();
    nodeRange.selectNodeContents(textNode);

    const startOffset =
      range.compareBoundaryPoints(Range.START_TO_START, nodeRange) > 0
        ? range.startOffset
        : 0;
    const endOffset =
      range.compareBoundaryPoints(Range.END_TO_END, nodeRange) < 0
        ? range.endOffset
        : (textNode.textContent ?? "").length;

    if (startOffset === endOffset) continue;

    try {
      const before = textNode.splitText(startOffset);
      const after = before.splitText(endOffset - startOffset);

      const wrapper = document.createElement("article-highlight");
      wrapper.setAttribute("data-highlight", "true");
      if (highlightId) {
        wrapper.setAttribute("data-highlight-id", highlightId);
      }
      (wrapper as HTMLElement).style.backgroundColor = color;

      before.parentNode?.insertBefore(wrapper, before);
      wrapper.appendChild(before);
    } catch (e) {}
  }
}

export function clearAppliedHighlights(container: HTMLElement) {
  const nodes = Array.from(
    container.querySelectorAll("article-highlight[data-highlight='true']")
  );
  for (const el of nodes) {
    const parent = el.parentNode as Node & ParentNode;
    while (el.firstChild) parent.insertBefore(el.firstChild, el);
    parent.removeChild(el);
  }
}

export function getElementPath(node: Node): {
  stringPath: string;
  arrayPath: number[];
} {
  const path: number[] = [];
  let current: Node | null = node;

  while (current && (current as Element).id !== "article-content-id") {
    const parent: Node | null = current.parentNode;
    if (!parent) break;
    const siblings = Array.from(parent.childNodes);
    const index = siblings.indexOf(current as ChildNode);

    if (index !== -1) {
      path.unshift(index);
    }

    current = parent;
  }

  return { stringPath: path.join("/"), arrayPath: path };
}

export function getSelectionHTML(range: Range): string {
  const clonedRange = range.cloneRange();
  const tempDiv = document.createElement("div");

  try {
    const contents = clonedRange.cloneContents();
    tempDiv.appendChild(contents);

    return tempDiv.innerHTML;
  } catch (error) {
    return "";
  }
}

export function htmlToMarkdown(html: string): string {
  return html
    .replace(/<h([1-6])[^>]*>(.*?)<\/h[1-6]>/gi, (match, level, content) => {
      const hashes = "#".repeat(parseInt(level));
      return `${hashes} ${content.trim()}`;
    })
    .replace(/<(strong|b)[^>]*>(.*?)<\/(strong|b)>/gi, "**$2**")
    .replace(/<(em|i)[^>]*>(.*?)<\/(em|i)>/gi, "*$2*")
    .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, "[$2]($1)")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<p[^>]*>(.*?)<\/p>/gi, "$1\n\n")
    .replace(/<[^>]*>/g, "")
    .replace(/\n\s*\n/g, "\n\n")
    .trim();
}

export function getAllTextNodes(container: HTMLElement): Text[] {
  const nodes: Text[] = [];
  const walker = document.createTreeWalker(
    container,
    NodeFilter.SHOW_TEXT,
    null
  );
  let node: Node | null;
  while ((node = walker.nextNode())) {
    if (node.nodeValue !== null && node.nodeValue !== undefined) {
      nodes.push(node as Text);
    }
  }
  return nodes;
}

export function buildTextMap(textNodes: Text[]): {
  map: TextMapEntry[];
  totalTextLength: number;
} {
  const map: TextMapEntry[] = [];
  let currentOffset = 0;

  for (const node of textNodes) {
    const len = node.textContent?.length || 0;
    map.push({
      node,
      start: currentOffset,
      end: currentOffset + len,
    });
    currentOffset += len;
  }

  return { map, totalTextLength: currentOffset };
}

export function normalize(str: string): string {
  return str.replace(/\s+/g, " ").trim();
}

export function findMatchPosition(
  container: HTMLElement,
  highlightText: string
): MatchPosition | null {
  const textNodes = getAllTextNodes(container);
  const { map } = buildTextMap(textNodes);
  const fullText = map.map((m) => m.node.textContent || "").join("");
  const normalizedTarget = normalize(highlightText);

  if (!normalizedTarget) return null;

  let origIdx = 0; // Con trỏ cho fullText (văn bản gốc)
  let targetIdx = 0; // Con trỏ cho normalizedTarget (văn bản cần tìm)
  let startOffset = -1; // Vị trí bắt đầu khớp (trong tọa độ gốc)
  let endOffset = -1;

  // 1. Bỏ qua tất cả whitespace ở đầu (mô phỏng .trim() )
  while (origIdx < fullText.length && /\s/.test(fullText[origIdx])) {
    origIdx++;
  }

  // 2. Bắt đầu vòng lặp tìm kiếm
  while (origIdx < fullText.length) {
    const origChar = fullText[origIdx];
    const targetChar = normalizedTarget[targetIdx];
    const isOrigWhitespace = /\s/.test(origChar);

    if (isOrigWhitespace) {
      // --- TRƯỜNG HỢP 1: KÝ TỰ GỐC LÀ WHITESPACE ---
      if (targetChar === " ") {
        // Ký tự target cũng là ' ' (đã chuẩn hóa) -> Khớp
        targetIdx++; // Di chuyển con trỏ target
        origIdx++; // Di chuyển con trỏ gốc

        // Bỏ qua tất cả các whitespace tiếp theo trong chuỗi gốc (mô phỏng replace(/\s+/g, ' '))
        while (origIdx < fullText.length && /\s/.test(fullText[origIdx])) {
          origIdx++;
        }
      } else {
        // Ký tự gốc là whitespace, nhưng target không phải ' '
        // Chỉ bỏ qua whitespace trong chuỗi gốc
        origIdx++;
      }
    } else {
      // --- TRƯỜNG HỢP 2: KÝ TỰ GỐC KHÔNG PHẢI WHITESPACE ---
      if (origChar === targetChar) {
        // Ký tự khớp
        if (targetIdx === 0) {
          startOffset = origIdx; // Ghi lại vị trí bắt đầu (tọa độ GỐC)
        }
        origIdx++;
        targetIdx++;
      } else {
        // Ký tự không khớp -> Reset
        targetIdx = 0;
        // Nếu trước đó đang khớp dở,
        // thì quay lại vị trí sau ký tự bắt đầu của lần khớp hụt
        if (startOffset !== -1) {
          origIdx = startOffset + 1;
        } else {
          // Nếu chưa khớp gì, chỉ đi tiếp
          origIdx++;
        }
        startOffset = -1; // Reset vị trí bắt đầu

        // Quan trọng: Sau khi reset, chúng ta có thể đang ở trên whitespace
        // Cần bỏ qua chúng để bắt đầu tìm kiếm mới
        if (targetIdx === 0) {
          while (origIdx < fullText.length && /\s/.test(fullText[origIdx])) {
            origIdx++;
          }
        }
      }
    }

    // 3. Kiểm tra nếu đã tìm thấy toàn bộ chuỗi
    if (targetIdx === normalizedTarget.length) {
      // Đã tìm thấy!
      endOffset = origIdx; // endOffset là vị trí *sau* ký tự cuối cùng (tọa độ GỐC)
      return { map, startOffset, endOffset };
    }
  }

  // 4. Không tìm thấy
  return null;
}

// /**
//  * Converts global offset to DOM path
//  * @param map - Text map from buildTextMap
//  * @param offset - Global offset position
//  * @returns DOM path and relative offset
//  */
// export function offsetToDomPath(
//   map: TextMapEntry[],
//   offset: number
// ): DomPathResult {
//   for (const entry of map) {
//     if (offset >= entry.start && offset < entry.end) {
//       const node = entry.node;
//       const path = getElementPath(node).stringPath; // Sử dụng getElementPath thay vì getDomPath
//       const relativeOffset = offset - entry.start;
//       return { path, offset: relativeOffset };
//     }
//   }
//   // fallback to last node
//   const last = map[map.length - 1];
//   return {
//     path: getElementPath(last.node).stringPath, // Sử dụng getElementPath thay vì getDomPath
//     offset: last.node.textContent?.length || 0,
//   };
// }

/**
 * Resolves highlight DOM path for browser extension highlights using text matching
 * @param container - Container element
 * @param highlight - Highlight object
 * @returns Highlight with resolved DOM path, or null if resolution fails
 */
interface HighlightData {
  id: string;
  articleId: string;
  location: string;
  text: string;
  html?: string;
  markdown?: string;
  color?: string;
  createdAt: number;
  updatedAt?: number;
  createBy: "rehi-web" | "rehi-browser-extension";
  isDeleted: boolean;
  note?: string;
}

// export function resolveHighlightDomPath(
//   container: HTMLElement,
//   highlight: Highlight
// ): HighlightData | null {
//   const match = findMatchPosition(container, highlight.text);
//   if (!match) return null;

//   const start = offsetToDomPath(match.map, match.startOffset);
//   const end = offsetToDomPath(match.map, match.endOffset);

//   return {
//     ...highlight,
//     location: `${start.path}:${start.offset},${end.path}:${end.offset}`,
//   };
// }

/**
 * Main function that handles both highlight types and applies them
 * @param container - Container element to apply highlights to
 * @param highlights - Array of highlights to apply
 */
export function applyHighlights(
  container: HTMLElement,
  highlights: Highlight[]
) {
  if (!highlights || highlights.length === 0) {
    // Ensure any previous wrappers are cleared
    clearAppliedHighlights(container);
    return;
  }

  // Start fresh each time
  clearAppliedHighlights(container);

  for (const h of highlights) {
    try {
      // Always use text-based matching (ignore location field)
      // This ensures highlights work even when DOM structure changes
      const match = findMatchPosition(container, h.text);
      if (!match) {
        continue;
      }

      // Create range from the matched position
      const range = createRangeFromMatchPosition(container, match);
      if (!range) {
        continue;
      }

      // Apply the highlight
      applyDistributedHighlight(
        range,
        h.color ?? "rgba(255, 235, 59, 0.6)",
        h.id
      );
    } catch (e) {
      // If any single highlight fails (DOM changed), skip it
    }
  }
}

/**
 * Creates a range from a match position by temporarily removing highlights
 * @param container - Container element
 * @param match - Match position with map and offsets
 * @returns Range object or null if creation fails
 */
export function createRangeFromMatchPosition(
  container: HTMLElement,
  match: MatchPosition
): Range | null {
  // // Store current highlights to restore later
  // const highlightElements = Array.from(
  //   container.querySelectorAll('article-highlight[data-highlight="true"]')
  // );
  // const highlightData: Array<{
  //   element: Element;
  //   parent: Node | null;
  //   nextSibling: Node | null;
  //   children: Node[];
  // }> = [];

  // // Extract highlight data before removing them
  // for (const element of highlightElements) {
  //   const children = Array.from(element.childNodes);
  //   highlightData.push({
  //     element,
  //     parent: element.parentNode,
  //     nextSibling: element.nextSibling,
  //     children,
  //   });
  // }

  // // Temporarily remove all highlights to get original DOM structure
  // for (const { element } of highlightData) {
  //   const parent = element.parentNode;
  //   if (parent) {
  //     // Move children back to parent
  //     while (element.firstChild) {
  //       parent.insertBefore(element.firstChild, element);
  //     }
  //     parent.removeChild(element);
  //   }
  // }

  try {
    // Find the nodes and offsets for the given text positions
    let startNode: Text | null = null;
    let endNode: Text | null = null;
    let startNodeOffset = 0;
    let endNodeOffset = 0;

    for (const entry of match.map) {
      // Check if start offset is in this node
      if (
        !startNode &&
        match.startOffset >= entry.start &&
        match.startOffset < entry.end
      ) {
        startNode = entry.node;
        startNodeOffset = match.startOffset - entry.start;
      }

      // Check if end offset is in this node
      if (
        !endNode &&
        match.endOffset >= entry.start &&
        match.endOffset <= entry.end
      ) {
        endNode = entry.node;
        endNodeOffset = match.endOffset - entry.start;
      }

      if (startNode && endNode) break;
    }

    if (!startNode || !endNode) {
      return null;
    }

    // Create the range
    const range = document.createRange();
    range.setStart(startNode, startNodeOffset);
    range.setEnd(endNode, endNodeOffset);

    return range;
  } finally {
    // // Restore all highlights
    // for (const { element, parent, nextSibling, children } of highlightData) {
    //   if (parent) {
    //     // Insert the highlight element
    //     parent.insertBefore(element, nextSibling);
    //     // Move children back into the highlight element
    //     for (const child of children) {
    //       element.appendChild(child);
    //     }
    //   }
    // }
  }
}

/**
 * Resolves DOM node from path string
 * @param root - Root node to start from
 * @param path - Path string in format "0/1/2"
 * @returns The resolved DOM node
 */
export function getNodeFromPath(root: Node, path: string): Node {
  const indexes = path.split("/").map((i) => parseInt(i, 10));
  let node: Node | null = root;
  for (const index of indexes) {
    if (!node || !("childNodes" in node)) throw new Error("Invalid root");
    node = (node as ParentNode).childNodes[index] ?? null;
    if (!node) throw new Error("Invalid path: " + path);
  }
  return node as Node;
}

/**
 * Increases the opacity of a highlight color to make it darker/bolder
 * @param color - Original color string (rgba format)
 * @returns Darker version of the color
 */
function makeHighlightDarker(color: string): string {
  // Extract rgba values from color string
  const rgbaMatch = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
  if (!rgbaMatch) return color; // Return original if not rgba format

  const [, r, g, b, a] = rgbaMatch;
  const currentOpacity = parseFloat(a);

  // Increase opacity by 0.3 (but cap at 0.9 to maintain readability)
  const newOpacity = Math.min(currentOpacity + 0.3, 0.9);

  return `rgba(${r}, ${g}, ${b}, ${newOpacity})`;
}

/**
 * Darkens all highlight segments with the same highlight ID
 * @param container - Container element
 * @param highlightId - ID of the highlight to darken
 * @param originalColors - Map to store original colors for restoration
 */
function darkenAllHighlightSegments(
  container: HTMLElement,
  highlightId: string,
  originalColors: Map<string, string>
) {
  const segments = container.querySelectorAll(
    `article-highlight[data-highlight-id="${highlightId}"]`
  );

  segments.forEach((segment) => {
    const htmlSegment = segment as HTMLElement;
    const originalColor = htmlSegment.style.backgroundColor;

    // Store original color if not already stored
    if (!originalColors.has(highlightId)) {
      originalColors.set(highlightId, originalColor);
    }

    // Darken this segment
    const darkerColor = makeHighlightDarker(originalColor);
    htmlSegment.style.backgroundColor = darkerColor;
  });
}

/**
 * Restores all highlight segments with the same highlight ID to original color
 * @param container - Container element
 * @param highlightId - ID of the highlight to restore
 * @param originalColors - Map containing original colors
 */
function restoreAllHighlightSegments(
  container: HTMLElement,
  highlightId: string,
  originalColors: Map<string, string>
) {
  const segments = container.querySelectorAll(
    `article-highlight[data-highlight-id="${highlightId}"]`
  );

  const originalColor = originalColors.get(highlightId);
  if (originalColor) {
    segments.forEach((segment) => {
      const htmlSegment = segment as HTMLElement;
      htmlSegment.style.backgroundColor = originalColor;
    });
    originalColors.delete(highlightId);
  }
}

/**
 * Clears all delete buttons from the container
 * @param container - Container element
 */
function clearAllDeleteButtons(container: HTMLElement) {
  const deleteButtons = container.querySelectorAll(".highlight-delete-button");
  deleteButtons.forEach((button) => button.remove());
}

/**
 * Adds click handler to highlight elements for showing delete button and darkening effect
 * @param container - Container element
 * @param onDeleteHighlight - Callback function when highlight is deleted
 * @param onEditNote - Callback function when highlight note is edited
 * @param highlights - Array of highlight objects to get note data
 */
export function addHighlightClickHandlers(
  container: HTMLElement,
  onDeleteHighlight: (highlightId: string) => void,
  onEditNote?: (highlightId: string, note: string) => void,
  highlights?: Highlight[]
) {
  // Remove existing handlers first
  removeHighlightClickHandlers(container);

  const highlightElements = container.querySelectorAll(
    'article-highlight[data-highlight="true"]'
  );

  // Map to store original colors for each highlight ID
  const originalColors = new Map<string, string>();
  // Track currently selected highlight ID
  let currentlySelectedId: string | null = null;

  highlightElements.forEach((element) => {
    const highlightId = element.getAttribute("data-highlight-id");
    if (highlightId) {
      const htmlElement = element as HTMLElement;

      element.addEventListener("click", (e) => {
        e.stopPropagation();

        // If clicking on a different highlight, restore the previous one and clear its delete button
        if (currentlySelectedId && currentlySelectedId !== highlightId) {
          restoreAllHighlightSegments(
            container,
            currentlySelectedId,
            originalColors
          );
          // Clear any existing delete buttons
          clearAllDeleteButtons(container);
        }

        // Darken ALL segments with the same highlight ID
        darkenAllHighlightSegments(container, highlightId, originalColors);

        // Update currently selected ID
        currentlySelectedId = highlightId;

        // Get highlight data
        const highlight = highlights?.find((h) => h.id === highlightId);

        // Show delete button (it will handle color restoration)
        showDeleteButton(
          htmlElement,
          highlightId,
          onDeleteHighlight,
          container,
          originalColors,
          () => {
            // Callback to clear currently selected ID when button is closed
            if (currentlySelectedId === highlightId) {
              currentlySelectedId = null;
            }
          },
          onEditNote,
          highlight?.note
        );
      });

      // Add visual feedback
      htmlElement.style.cursor = "pointer";
      htmlElement.title = "Click to manage highlight";
    }
  });
}

/**
 * Shows delete button for a highlight element
 */
function showDeleteButton(
  element: HTMLElement,
  highlightId: string,
  onDeleteHighlight: (highlightId: string) => void,
  container: HTMLElement,
  originalColors: Map<string, string>,
  onClose?: () => void,
  onEditNote?: (highlightId: string, note: string) => void,
  currentNote?: string
) {
  // Remove any existing delete button
  const existingButton = element.querySelector(".highlight-delete-button");
  if (existingButton) {
    existingButton.remove();
    // Restore ALL segments with the same highlight ID
    restoreAllHighlightSegments(container, highlightId, originalColors);
    // Call the onClose callback to clear currently selected ID
    if (onClose) {
      onClose();
    }
    return;
  }

  // Create button container
  const buttonContainer = document.createElement("div");
  buttonContainer.className = "highlight-delete-button";

  // Create note button
  const noteBtn = document.createElement("button");
  noteBtn.className = "note-btn";
  noteBtn.innerHTML = "📝";
  noteBtn.title = "Add/Edit note";

  // Create delete button
  const deleteBtn = document.createElement("button");
  deleteBtn.className = "delete-btn";
  deleteBtn.innerHTML = "✕";
  deleteBtn.title = "Delete highlight";

  // Create cancel button
  const cancelBtn = document.createElement("button");
  cancelBtn.className = "cancel-btn";
  cancelBtn.innerHTML = "Cancel";
  cancelBtn.title = "Cancel";

  // Function to restore ALL segments and close button
  const restoreAndClose = () => {
    restoreAllHighlightSegments(container, highlightId, originalColors);
    buttonContainer.remove();
    // Call the onClose callback to clear currently selected ID
    if (onClose) {
      onClose();
    }
  };

  // Add event listeners
  if (onEditNote) {
    noteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      showNoteEditor(
        element,
        highlightId,
        container,
        originalColors,
        onEditNote,
        currentNote,
        onClose
      );
      restoreAndClose();
    });
  }

  deleteBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    onDeleteHighlight(highlightId);
    restoreAndClose();
  });

  cancelBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    restoreAndClose();
  });

  // Add buttons to container
  if (onEditNote) {
    buttonContainer.appendChild(noteBtn);
  }
  buttonContainer.appendChild(deleteBtn);
  buttonContainer.appendChild(cancelBtn);

  // Add container to highlight element
  element.appendChild(buttonContainer);

  // Add click outside handler to close button
  const clickOutsideHandler = (e: MouseEvent) => {
    if (!buttonContainer.contains(e.target as Node)) {
      restoreAndClose();
      document.removeEventListener("click", clickOutsideHandler);
    }
  };

  // Add event listener after a small delay to prevent immediate closure
  setTimeout(() => {
    document.addEventListener("click", clickOutsideHandler);
  }, 100);

  // Auto-hide after 5 seconds
  setTimeout(() => {
    if (buttonContainer.parentNode) {
      restoreAndClose();
      document.removeEventListener("click", clickOutsideHandler);
    }
  }, 5000);
}

/**
 * Shows note editor for a highlight
 */
function showNoteEditor(
  element: HTMLElement,
  highlightId: string,
  container: HTMLElement,
  originalColors: Map<string, string>,
  onEditNote: (highlightId: string, note: string) => void,
  currentNote?: string,
  onClose?: () => void
) {
  // Remove any existing note editor
  const existingEditor = element.querySelector(".highlight-note-editor");
  if (existingEditor) {
    existingEditor.remove();
    return;
  }

  // Create note editor container
  const editorContainer = document.createElement("div");
  editorContainer.className = "highlight-note-editor";

  // Create textarea
  const textarea = document.createElement("textarea");
  textarea.className = "note-textarea";
  textarea.placeholder = "Write your note here...";
  textarea.value = currentNote || "";

  // Create button container
  const buttonContainer = document.createElement("div");
  buttonContainer.className = "note-editor-buttons";

  // Create save button
  const saveBtn = document.createElement("button");
  saveBtn.className = "save-btn";
  saveBtn.innerHTML = "Save";
  saveBtn.title = "Save note";

  // Create cancel button
  const cancelBtn = document.createElement("button");
  cancelBtn.className = "cancel-btn";
  cancelBtn.innerHTML = "Cancel";
  cancelBtn.title = "Cancel";

  // Function to close editor
  const closeEditor = () => {
    editorContainer.remove();
    restoreAllHighlightSegments(container, highlightId, originalColors);
    if (onClose) {
      onClose();
    }
  };

  // Add event listeners
  saveBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const note = textarea.value;
    onEditNote(highlightId, note);
    closeEditor();
  });

  cancelBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    closeEditor();
  });

  // Add to containers
  buttonContainer.appendChild(saveBtn);
  buttonContainer.appendChild(cancelBtn);
  editorContainer.appendChild(textarea);
  editorContainer.appendChild(buttonContainer);

  // Add container to highlight element
  element.appendChild(editorContainer);

  // Focus textarea
  setTimeout(() => {
    textarea.focus();
  }, 0);

  // Add click outside handler
  const clickOutsideHandler = (e: MouseEvent) => {
    if (!editorContainer.contains(e.target as Node)) {
      closeEditor();
      document.removeEventListener("click", clickOutsideHandler);
    }
  };

  setTimeout(() => {
    document.addEventListener("click", clickOutsideHandler);
  }, 100);
}

/**
 * Removes click handlers from highlight elements
 * @param container - Container element
 */
export function removeHighlightClickHandlers(container: HTMLElement) {
  const highlightElements = container.querySelectorAll(
    'article-highlight[data-highlight="true"]'
  );

  highlightElements.forEach((element) => {
    // Clone element to remove all event listeners
    const newElement = element.cloneNode(true) as HTMLElement;
    element.parentNode?.replaceChild(newElement, element);
  });
}
