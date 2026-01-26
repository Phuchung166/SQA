/**
 * Lexical Rich Text Nodes
 * HeadingNode and QuoteNode implementations
 */

import {
  $applyNodeReplacement,
  ElementNode,
  EditorConfig,
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  ParagraphNode,
  RangeSelection,
  SerializedElementNode,
  ElementFormatType,
  $createParagraphNode,
  isHTMLElement,
} from 'lexical';

export type HeadingTagType = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

export type SerializedHeadingNode = {
  tag: HeadingTagType;
} & SerializedElementNode;

export type SerializedQuoteNode = SerializedElementNode;

/**
 * HeadingNode - Represents heading elements (h1-h6)
 */
export class HeadingNode extends ElementNode {
  __tag: HeadingTagType;

  static getType(): string {
    return 'heading';
  }

  static clone(node: HeadingNode): HeadingNode {
    return new HeadingNode(node.__tag, node.__key);
  }

  constructor(tag: HeadingTagType = 'h1', key?: NodeKey) {
    super(key);
    this.__tag = tag;
  }

  getTag(): HeadingTagType {
    return this.__tag;
  }

  setTag(tag: HeadingTagType): this {
    const self = this.getWritable();
    self.__tag = tag;
    return self;
  }

  createDOM(config: EditorConfig): HTMLElement {
    const tag = this.__tag;
    const element = document.createElement(tag);
    
    if (config.theme.heading && config.theme.heading[tag]) {
      element.className = config.theme.heading[tag];
    }
    
    return element;
  }

  updateDOM(prevNode: this, dom: HTMLElement, config: EditorConfig): boolean {
    return prevNode.__tag !== this.__tag;
  }

  static importDOM(): DOMConversionMap | null {
    return {
      h1: () => ({ conversion: convertHeadingElement, priority: 0 }),
      h2: () => ({ conversion: convertHeadingElement, priority: 0 }),
      h3: () => ({ conversion: convertHeadingElement, priority: 0 }),
      h4: () => ({ conversion: convertHeadingElement, priority: 0 }),
      h5: () => ({ conversion: convertHeadingElement, priority: 0 }),
      h6: () => ({ conversion: convertHeadingElement, priority: 0 }),
    };
  }

  exportDOM(editor: LexicalEditor): DOMExportOutput {
    const { element } = super.exportDOM(editor);

    if (element && isHTMLElement(element)) {
      if (this.isEmpty()) {
        element.append(document.createElement('br'));
      }

      const formatType = this.getFormatType();
      if (formatType) {
        element.style.textAlign = formatType;
      }

      const direction = this.getDirection();
      if (direction) {
        element.dir = direction;
      }
    }

    return { element };
  }

  static importJSON(serializedNode: SerializedHeadingNode): HeadingNode {
    const node = createHeadingNode(serializedNode.tag);
    node.setTag(serializedNode.tag);
    return node;
  }

  exportJSON(): SerializedHeadingNode {
    return {
      ...super.exportJSON(),
      tag: this.getTag(),
    };
  }

  insertNewAfter(
    selection?: RangeSelection,
    restoreSelection = true,
  ): ParagraphNode | HeadingNode {
    const anchorOffset = selection ? selection.anchor.offset : 0;
    const lastDesc = this.getLastDescendant();
    const isAtEnd =
      !lastDesc ||
      (selection &&
        selection.anchor.key === lastDesc.getKey() &&
        anchorOffset === lastDesc.getTextContentSize());
    
    const newElement =
      isAtEnd || !selection
        ? $createParagraphNode()
        : createHeadingNode(this.getTag());
    
    const direction = this.getDirection();
    newElement.setDirection(direction);
    this.insertAfter(newElement, restoreSelection);
    
    return newElement;
  }

  collapseAtStart(): true {
    const newElement = !this.isEmpty()
      ? createHeadingNode(this.getTag())
      : $createParagraphNode();
    
    const children = this.getChildren();
    children.forEach((child) => newElement.append(child));
    this.replace(newElement);
    
    return true;
  }

  extractWithChild(): boolean {
    return true;
  }
}

/**
 * QuoteNode - Represents blockquote elements
 */
export class QuoteNode extends ElementNode {
  static getType(): string {
    return 'quote';
  }

  static clone(node: QuoteNode): QuoteNode {
    return new QuoteNode(node.__key);
  }

  createDOM(config: EditorConfig): HTMLElement {
    const element = document.createElement('blockquote');
    
    if (config.theme.quote) {
      element.className = config.theme.quote;
    }
    
    return element;
  }

  updateDOM(prevNode: this, dom: HTMLElement): boolean {
    return false;
  }

  static importDOM(): DOMConversionMap | null {
    return {
      blockquote: () => ({ conversion: convertQuoteElement, priority: 0 }),
    };
  }

  exportDOM(editor: LexicalEditor): DOMExportOutput {
    const { element } = super.exportDOM(editor);

    if (element && isHTMLElement(element)) {
      if (this.isEmpty()) {
        element.append(document.createElement('br'));
      }

      const formatType = this.getFormatType();
      if (formatType) {
        element.style.textAlign = formatType;
      }

      const direction = this.getDirection();
      if (direction) {
        element.dir = direction;
      }
    }

    return { element };
  }

  static importJSON(serializedNode: SerializedQuoteNode): QuoteNode {
    const node = createQuoteNode();
    return node;
  }

  insertNewAfter(
    _: RangeSelection,
    restoreSelection?: boolean,
  ): ParagraphNode {
    const newBlock = $createParagraphNode();
    const direction = this.getDirection();
    newBlock.setDirection(direction);
    this.insertAfter(newBlock, restoreSelection);
    return newBlock;
  }

  collapseAtStart(): true {
    const paragraph = $createParagraphNode();
    const children = this.getChildren();
    children.forEach((child) => paragraph.append(child));
    this.replace(paragraph);
    return true;
  }

  canMergeWhenEmpty(): true {
    return true;
  }
}

/**
 * Factory functions
 */
export function createHeadingNode(
  tag: HeadingTagType = 'h1',
): HeadingNode {
  return $applyNodeReplacement(new HeadingNode(tag));
}

export function createQuoteNode(): QuoteNode {
  return $applyNodeReplacement(new QuoteNode());
}

/**
 * Type guards
 */
export function isHeadingNode(
  node: LexicalNode | null | undefined,
): node is HeadingNode {
  return node instanceof HeadingNode;
}

export function isQuoteNode(
  node: LexicalNode | null | undefined,
): node is QuoteNode {
  return node instanceof QuoteNode;
}

/**
 * DOM conversion helpers
 */
function convertHeadingElement(element: HTMLElement): DOMConversionOutput {
  const nodeName = element.nodeName.toLowerCase();
  
  if (
    nodeName === 'h1' ||
    nodeName === 'h2' ||
    nodeName === 'h3' ||
    nodeName === 'h4' ||
    nodeName === 'h5' ||
    nodeName === 'h6'
  ) {
    const node = createHeadingNode(nodeName as HeadingTagType);
    
    if (element.style) {
      node.setFormat(element.style.textAlign as ElementFormatType);
    }
    
    return { node };
  }
  
  return { node: null };
}

function convertQuoteElement(element: HTMLElement): DOMConversionOutput {
  const node = createQuoteNode();
  
  if (element.style) {
    node.setFormat(element.style.textAlign as ElementFormatType);
  }
  
  return { node };
}
