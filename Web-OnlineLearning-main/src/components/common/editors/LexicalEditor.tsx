'use client';

import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListNode, ListItemNode } from '@lexical/list';
import { LinkNode } from '@lexical/link';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  UNDO_COMMAND,
  REDO_COMMAND,
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  ElementFormatType,
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  COMMAND_PRIORITY_NORMAL,
  TextFormatType,
} from 'lexical';
import { insertList } from '@lexical/list';
import { $createLinkNode } from '@lexical/link';
import { createHeadingNode, createQuoteNode, HeadingNode, QuoteNode } from './richTextNodes';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Undo2,
  Redo2,
  Heading1,
  Heading2,
  Heading3,
  Code2,
  Quote,
  Link2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Palette,
  Image,
  Type,
} from 'lucide-react';

interface LexicalEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}

// Toolbar Button with active state
interface ToolbarButtonProps {
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  icon,
  title,
  onClick,
  isActive = false,
  disabled = false,
}) => (
  <button
    onClick={onClick}
    title={title}
    type="button"
    disabled={disabled}
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '36px',
      height: '36px',
      border: isActive ? '2px solid #1890ff' : '1px solid #d9d9d9',
      borderRadius: '4px',
      backgroundColor: isActive ? '#e6f4ff' : '#fff',
      color: isActive ? '#1890ff' : '#000',
      cursor: disabled ? 'not-allowed' : 'pointer',
      padding: '4px',
      transition: 'all 0.2s',
      opacity: disabled ? 0.5 : 1,
    }}
    onMouseEnter={e => {
      if (!disabled) {
        (e.currentTarget as HTMLElement).style.backgroundColor = isActive ? '#e6f4ff' : '#f5f5f5';
      }
    }}
    onMouseLeave={e => {
      if (!disabled) {
        (e.currentTarget as HTMLElement).style.backgroundColor = isActive ? '#e6f4ff' : '#fff';
      }
    }}
  >
    {icon}
  </button>
);

// State Hook for Editor Commands
const useEditorCommands = () => {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [alignment, setAlignment] = useState<ElementFormatType>('left');

  // Listen to selection changes
  useEffect(() => {
    const unregister = editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          setIsBold(selection.hasFormat('bold'));
          setIsItalic(selection.hasFormat('italic'));
          setIsUnderline(selection.hasFormat('underline'));
          setIsStrikethrough(selection.hasFormat('strikethrough'));
        }
      });
    });
    return unregister;
  }, [editor]);

  return {
    editor,
    isBold,
    isItalic,
    isUnderline,
    isStrikethrough,
    alignment,
    setAlignment,
  };
};

// Professional Toolbar
const EditorToolbar: React.FC = () => {
  const { editor, isBold, isItalic, isUnderline, isStrikethrough, alignment, setAlignment } =
    useEditorCommands();

  const [linkUrl, setLinkUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [fontSize, setFontSize] = useState('16px');
  const [fontFamily, setFontFamily] = useState('Arial');
  const [textColor, setTextColor] = useState('#000000');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [showImageInput, setShowImageInput] = useState(false);

  // Text formatting commands
  const handleBold = useCallback(() => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
  }, [editor]);

  const handleItalic = useCallback(() => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
  }, [editor]);

  const handleUnderline = useCallback(() => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
  }, [editor]);

  const handleStrikethrough = useCallback(() => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough');
  }, [editor]);

  const handleUndo = useCallback(() => {
    editor.dispatchCommand(UNDO_COMMAND, undefined);
  }, [editor]);

  const handleRedo = useCallback(() => {
    editor.dispatchCommand(REDO_COMMAND, undefined);
  }, [editor]);

  const handleBulletList = useCallback(() => {
    insertList(editor, 'bullet');
  }, [editor]);

  const handleNumberedList = useCallback(() => {
    insertList(editor, 'number');
  }, [editor]);

  const handleAlignLeft = useCallback(() => {
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left' as ElementFormatType);
    setAlignment('left');
  }, [editor]);

  const handleAlignCenter = useCallback(() => {
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center' as ElementFormatType);
    setAlignment('center');
  }, [editor]);

  const handleAlignRight = useCallback(() => {
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right' as ElementFormatType);
    setAlignment('right');
  }, [editor]);

  const handleAlignJustify = useCallback(() => {
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify' as ElementFormatType);
    setAlignment('justify');
  }, [editor]);

  const handleAddLink = useCallback(() => {
    if (!linkUrl.trim()) return;

    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const linkNode = $createLinkNode(linkUrl);
        selection.insertNodes([linkNode]);
      }
    });
    setLinkUrl('');
    setShowLinkInput(false);
  }, [editor, linkUrl]);

  const handleAddImage = useCallback(() => {
    if (!imageUrl.trim()) return;

    editor.update(() => {
      const root = $getRoot();
      const paragraph = $createParagraphNode();
      const text = $createTextNode(`[Image: ${imageUrl}]`);
      paragraph.append(text);
      root.append(paragraph);
    });
    setImageUrl('');
    setShowImageInput(false);
  }, [editor, imageUrl]);

  const handleFontSizeChange = useCallback((size: string) => {
    setFontSize(size);
  }, []);

  const handleFontFamilyChange = useCallback((family: string) => {
    setFontFamily(family);
  }, []);

  const handleTextColorChange = useCallback((color: string) => {
    setTextColor(color);
  }, []);

  return (
    <div
      style={{
        padding: '12px',
        backgroundColor: '#fafafa',
        borderRadius: '4px 4px 0 0',
        borderBottom: '1px solid #d9d9d9',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        alignItems: 'center',
      }}
    >
      {/* Undo/Redo */}
      <div style={{ display: 'flex', gap: '4px' }}>
        <ToolbarButton icon={<Undo2 size={16} />} title="Undo (Ctrl+Z)" onClick={handleUndo} />
        <ToolbarButton icon={<Redo2 size={16} />} title="Redo (Ctrl+Y)" onClick={handleRedo} />
      </div>

      <Divider />

      {/* Text Formatting */}
      <div style={{ display: 'flex', gap: '4px' }}>
        <ToolbarButton
          icon={<Bold size={16} />}
          title="Bold (Ctrl+B)"
          onClick={handleBold}
          isActive={isBold}
        />
        <ToolbarButton
          icon={<Italic size={16} />}
          title="Italic (Ctrl+I)"
          onClick={handleItalic}
          isActive={isItalic}
        />
        <ToolbarButton
          icon={<Underline size={16} />}
          title="Underline (Ctrl+U)"
          onClick={handleUnderline}
          isActive={isUnderline}
        />
        <ToolbarButton
          icon={<Strikethrough size={16} />}
          title="Strikethrough"
          onClick={handleStrikethrough}
          isActive={isStrikethrough}
        />
      </div>

      <Divider />

      {/* Font Controls */}
      <select
        value={fontFamily}
        onChange={e => handleFontFamilyChange(e.target.value)}
        title="Font Family"
        style={{
          padding: '4px 8px',
          borderRadius: '4px',
          border: '1px solid #d9d9d9',
          backgroundColor: '#fff',
          cursor: 'pointer',
          fontSize: '12px',
          height: '36px',
          minWidth: '100px',
        }}
      >
        <option value="Arial">Arial</option>
        <option value="Georgia">Georgia</option>
        <option value="Times New Roman">Times New Roman</option>
        <option value="Courier New">Courier New</option>
        <option value="Verdana">Verdana</option>
        <option value="Comic Sans MS">Comic Sans</option>
      </select>

      <select
        value={fontSize}
        onChange={e => handleFontSizeChange(e.target.value)}
        title="Font Size"
        style={{
          padding: '4px 8px',
          borderRadius: '4px',
          border: '1px solid #d9d9d9',
          backgroundColor: '#fff',
          cursor: 'pointer',
          fontSize: '12px',
          height: '36px',
          minWidth: '70px',
        }}
      >
        <option value="12px">12px</option>
        <option value="14px">14px</option>
        <option value="16px">16px</option>
        <option value="18px">18px</option>
        <option value="20px">20px</option>
        <option value="24px">24px</option>
        <option value="28px">28px</option>
        <option value="32px">32px</option>
      </select>

      {/* Color Picker */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <input
          type="color"
          value={textColor}
          onChange={e => handleTextColorChange(e.target.value)}
          title="Text Color"
          style={{
            width: '36px',
            height: '36px',
            border: '1px solid #d9d9d9',
            borderRadius: '4px',
            cursor: 'pointer',
            padding: '2px',
          }}
        />
      </div>

      <Divider />

      {/* Lists */}
      <div style={{ display: 'flex', gap: '4px' }}>
        <ToolbarButton icon={<List size={16} />} title="Bullet List" onClick={handleBulletList} />
        <ToolbarButton
          icon={<ListOrdered size={16} />}
          title="Numbered List"
          onClick={handleNumberedList}
        />
      </div>

      <Divider />

      {/* Alignment */}
      <div style={{ display: 'flex', gap: '4px' }}>
        <ToolbarButton
          icon={<AlignLeft size={16} />}
          title="Align Left"
          onClick={handleAlignLeft}
          isActive={alignment === 'left'}
        />
        <ToolbarButton
          icon={<AlignCenter size={16} />}
          title="Align Center"
          onClick={handleAlignCenter}
          isActive={alignment === 'center'}
        />
        <ToolbarButton
          icon={<AlignRight size={16} />}
          title="Align Right"
          onClick={handleAlignRight}
          isActive={alignment === 'right'}
        />
        <ToolbarButton
          icon={<AlignJustify size={16} />}
          title="Justify"
          onClick={handleAlignJustify}
          isActive={alignment === 'justify'}
        />
      </div>

      <Divider />

      {/* Link */}
      <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
        {showLinkInput && (
          <input
            type="text"
            placeholder="https://example.com"
            value={linkUrl}
            onChange={e => setLinkUrl(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleAddLink()}
            autoFocus
            style={{
              padding: '4px 8px',
              borderRadius: '4px',
              border: '1px solid #d9d9d9',
              fontSize: '12px',
              width: '150px',
              height: '28px',
            }}
          />
        )}
        <ToolbarButton
          icon={<Link2 size={16} />}
          title="Add Link"
          onClick={() => {
            if (showLinkInput && linkUrl) {
              handleAddLink();
            } else {
              setShowLinkInput(!showLinkInput);
            }
          }}
          isActive={showLinkInput}
        />
      </div>

      {/* Image */}
      <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
        {showImageInput && (
          <input
            type="text"
            placeholder="https://example.com/image.jpg"
            value={imageUrl}
            onChange={e => setImageUrl(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleAddImage()}
            autoFocus
            style={{
              padding: '4px 8px',
              borderRadius: '4px',
              border: '1px solid #d9d9d9',
              fontSize: '12px',
              width: '150px',
              height: '28px',
            }}
          />
        )}
        <ToolbarButton
          icon={<Image size={16} />}
          title="Add Image"
          onClick={() => {
            if (showImageInput && imageUrl) {
              handleAddImage();
            } else {
              setShowImageInput(!showImageInput);
            }
          }}
          isActive={showImageInput}
        />
      </div>
    </div>
  );
};

const Divider = () => (
  <div style={{ borderLeft: '1px solid #d9d9d9', height: '24px', margin: '0 4px' }} />
);

// Editor Content Component
const EditorContent: React.FC = () => (
  <div
    style={{
      position: 'relative',
      borderRadius: '0 0 4px 4px',
      border: '1px solid #d9d9d9',
      borderTop: 'none',
    }}
  >
    <RichTextPlugin
      contentEditable={
        <ContentEditable
          style={{
            minHeight: '300px',
            padding: '12px',
            fontSize: '14px',
            lineHeight: '1.6',
          }}
        />
      }
      placeholder={
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            opacity: 0.5,
            pointerEvents: 'none',
          }}
        >
          Start typing...
        </div>
      }
      ErrorBoundary={({ children }) => <div>{children}</div>}
    />
    <HistoryPlugin />
    <AutoFocusPlugin />
    <ListPlugin />
    <LinkPlugin />
  </div>
);

// Main Lexical Editor Component
const LexicalEditor: React.FC<LexicalEditorProps> = ({
  value = '',
  onChange,
  placeholder = 'Enter text...',
  readOnly = false,
}) => {
  const config = useMemo(
    () => ({
      namespace: 'LexicalEditor',
      nodes: [ListNode, ListItemNode, LinkNode],
      onError: (error: Error) => {
        console.error('Lexical error:', error);
      },
    }),
    [],
  );

  return (
    <div style={{ border: '1px solid #d9d9d9', borderRadius: '4px', overflow: 'hidden' }}>
      <LexicalComposer initialConfig={config}>
        <EditorToolbar />
        <EditorContent />
      </LexicalComposer>
    </div>
  );
};

export default LexicalEditor;
