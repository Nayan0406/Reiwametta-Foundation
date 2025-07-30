import React from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection, FORMAT_TEXT_COMMAND } from "lexical";
import { $createHeadingNode, $createQuoteNode } from "@lexical/rich-text";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from "@lexical/list";
// import { $createParagraphNode } from "lexical";

export function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = React.useState(false);
  const [isItalic, setIsItalic] = React.useState(false);
  const [isUnderline, setIsUnderline] = React.useState(false);

  const updateToolbar = React.useCallback(() => {
    editor.getEditorState().read(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        setIsBold(selection.hasFormat("bold"));
        setIsItalic(selection.hasFormat("italic"));
        setIsUnderline(selection.hasFormat("underline"));
        console.log(
          "Selection updated - Italic:",
          selection.hasFormat("italic")
        );
      }
    });
  }, [editor]);

  React.useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateToolbar();
      });
    });
  }, [editor, updateToolbar]);

  const formatBold = () => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
  };

  const formatItalic = () => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
  };

  const formatUnderline = () => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
  };

  const formatHeading = (level) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        selection.getNodes().forEach((node) => {
          node.replace($createHeadingNode(`h${level}`));
        });
      }
    });
  };

  const formatQuote = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        selection.getNodes().forEach((node) => {
          node.replace($createQuoteNode());
        });
      }
    });
  };

  return (
    <div className="toolbar flex flex-wrap gap-1 mb-2 p-2 border-b">
      <button
        onClick={formatBold}
        className={`p-1 rounded ${
          isBold ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"
        }`}
        title="Bold"
      >
        <span className="font-bold">B</span>
      </button>
      <button
        onClick={formatItalic}
        className={`p-1 rounded ${
          isItalic ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"
        }`}
        title="Italic"
      >
        <span className="italic">I</span>
      </button>
      <button
        onClick={formatUnderline}
        className={`p-1 rounded ${
          isUnderline ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"
        }`}
        title="Underline"
      >
        <span className="underline">U</span>
      </button>
      <div className="border-r mx-1 h-6"></div>
      <button
        onClick={() => formatHeading(1)}
        className="p-1 rounded hover:bg-gray-100"
        title="Heading 1"
      >
        H1
      </button>
      <button
        onClick={() => formatHeading(2)}
        className="p-1 rounded hover:bg-gray-100"
        title="Heading 2"
      >
        H2
      </button>
      <button
        onClick={() => formatHeading(3)}
        className="p-1 rounded hover:bg-gray-100"
        title="Heading 3"
      >
        H3
      </button>
      <div className="border-r mx-1 h-6"></div>
      <button
        onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND)}
        className="p-1 rounded hover:bg-gray-100"
        title="Bullet List"
      >
        • List
      </button>
      <button
        onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND)}
        className="p-1 rounded hover:bg-gray-100"
        title="Numbered List"
      >
        1. List
      </button>
      <button
        onClick={formatQuote}
        className="p-1 rounded hover:bg-gray-100"
        title="Quote"
      >
        ""
      </button>
    </div>
  );
}