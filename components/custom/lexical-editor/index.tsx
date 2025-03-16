"use client";

// Global
import {
  TextNode,
  ParagraphNode,
  $getRoot,
  $createParagraphNode,
  $createTextNode,
  SerializedEditorState,
} from "lexical";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListItemNode, ListNode } from "@lexical/list";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";

// Import HTML utilities for serialization/deserialization
import { $generateHtmlFromNodes } from "@lexical/html";
import { useCallback, useEffect, useState, useRef } from "react";

// Components
import TreeViewPlugin from "@/components/custom/lexical-editor/plugins/tree-view-plugin";
import ToolbarPlugin from "@/components/custom/lexical-editor/plugins/toolbar-plugin";
import OnChangePlugin from "@/components/custom/lexical-editor/plugins/on-change-plugin";
import EditorCapturePlugin from "@/components/custom/lexical-editor/plugins/editor-capture-plugin";
import { ExampleTheme } from "@/components/custom/lexical-editor/theme";

// Styles
import "@/components/custom/lexical-editor/styles.css";

function Placeholder() {
  console.log("[Placeholder] Rendering placeholder");
  return <div className="editor-placeholder">Enter some rich text...</div>;
}

type LexicalRichTextEditorProps = {
  initialContent?: string;
  onChange?: (html: string) => void;
};

function createEditorConfig(initialContent?: string) {
  console.log("[createEditorConfig] Creating editor config", {
    hasInitialContent: !!initialContent,
  });

  return {
    namespace: "Rich Text Demo",
    nodes: [
      HeadingNode,
      ListNode,
      ListItemNode,
      QuoteNode,
      TextNode,
      ParagraphNode,
    ],
    // Handling of errors during update
    onError(error: Error) {
      console.error("[EditorConfig] Error in editor:", error);
    },
    // The editor theme
    theme: ExampleTheme,
  };
}

export function LexicalRichTextEditor({
  initialContent,
  onChange,
}: LexicalRichTextEditorProps) {
  console.log("[LexicalRichTextEditor] Component rendering", {
    hasInitialContent: !!initialContent,
  });
  const editorConfig = createEditorConfig();
  console.log("[LexicalRichTextEditor] Editor config created");
  const [editor, setEditor] = useState<any>(null);

  // Log when editor state changes
  useEffect(() => {
    console.log("[LexicalRichTextEditor] Editor state changed", {
      hasEditor: !!editor,
    });
  }, [editor]);

  // Set initial content when the editor is mounted - only once
  useEffect(() => {
    console.log("[LexicalEditor] useEffect for initialContent triggered", {
      editor: !!editor,
      hasInitialContent: !!initialContent,
    });
    if (editor && initialContent && typeof window !== "undefined") {
      // We need to set this flag to prevent infinite loops
      const isInitialContentSet = (editor as any)._initialContentSet;

      if (!isInitialContentSet) {
        console.log("[LexicalEditor] Setting initial content", {
          initialContent,
        });

        try {
          // Import the necessary functions for HTML parsing
          import("@lexical/html").then(({ $generateNodesFromDOM }) => {
            // Create a DOM parser
            const parser = new DOMParser();
            // Parse the HTML string into a DOM document
            const dom = parser.parseFromString(initialContent, "text/html");

            // Update the editor with the parsed HTML content
            editor.update(() => {
              // Clear the editor first
              const root = $getRoot();
              root.clear();

              // Generate nodes from the DOM and insert them into the editor
              const nodes = $generateNodesFromDOM(editor, dom);
              if (nodes.length > 0) {
                root.append(...nodes);
                console.log(
                  "[LexicalEditor] Set formatted HTML content in editor"
                );
              } else {
                // Fallback if no nodes were generated
                console.log(
                  "[LexicalEditor] No nodes generated from HTML, using fallback"
                );
                const paragraph = $createParagraphNode();
                const textContent = dom.body.textContent || "";
                const textNode = $createTextNode(textContent);
                paragraph.append(textNode);
                root.append(paragraph);
              }
            });

            // Mark that we've set the initial content
            (editor as any)._initialContentSet = true;
          });
        } catch (error) {
          console.error("[LexicalEditor] Error setting initial content", error);
        }
      }
    }
  }, [editor, initialContent]);

  // Keep track of the last HTML to avoid unnecessary updates
  const lastHtmlRef = useRef<string>("");

  const handleEditorChange = useCallback(
    (html: string) => {
      // Call the onChange callback with the HTML string
      console.log("[LexicalEditor] handleEditorChange called with HTML", {
        htmlLength: html?.length,
        htmlPreview: html?.substring(0, 50),
      });

      // Only update if the content has actually changed
      if (html !== lastHtmlRef.current) {
        lastHtmlRef.current = html;

        if (onChange) {
          console.log(
            "[LexicalEditor] Calling onChange callback with new content"
          );
          onChange(html);
        }
      } else {
        console.log("[LexicalEditor] Content unchanged, skipping update");
      }
    },
    [onChange]
  );

  console.log("[LexicalRichTextEditor] Rendering component");
  return (
    <LexicalComposer initialConfig={editorConfig}>
      <div className="editor-container">
        <ToolbarPlugin />
        <div className="editor-inner">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="editor-input"
                onKeyDown={(e) =>
                  console.log("[ContentEditable] onKeyDown", { key: e.key })
                }
                onInput={(e) =>
                  console.log("[ContentEditable] onInput", { target: e.target })
                }
                onBlur={() => console.log("[ContentEditable] onBlur")}
                onFocus={() => console.log("[ContentEditable] onFocus")}
              />
            }
            placeholder={<Placeholder />}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <ListPlugin />
          <HistoryPlugin />
          <AutoFocusPlugin />
          <OnChangePlugin onChange={handleEditorChange} />
          {/* Capture the editor instance */}
          <EditorCapturePlugin setEditor={setEditor} />
        </div>
      </div>
    </LexicalComposer>
  );
}

export default LexicalRichTextEditor;
