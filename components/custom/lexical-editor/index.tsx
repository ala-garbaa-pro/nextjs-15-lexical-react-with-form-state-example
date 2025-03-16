"use client";

// Global
import React from "react";
import {
  TextNode,
  ParagraphNode,
  $getRoot,
  $createParagraphNode,
  $createTextNode,
  SerializedEditorState,
  $getSelection,
  $isRangeSelection,
  RangeSelection,
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
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

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
  autoSave?: boolean; // If true, changes are sent to parent on every edit (default: false)
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

// Memoize the editor component to prevent unnecessary re-renders
export const LexicalRichTextEditor = React.memo(
  function LexicalRichTextEditorInner({
    initialContent,
    onChange,
    autoSave = false, // Default to false - only save when button is clicked
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

    // Track the previous content to detect changes
    const previousContentRef = useRef<string>("");

    // Track if we're currently updating from parent to prevent cursor jumps
    const isUpdatingFromParentRef = useRef(false);

    // Update editor content whenever initialContent changes
    useEffect(() => {
      console.log("[LexicalEditor] useEffect for initialContent triggered", {
        editor: !!editor,
        hasInitialContent: !!initialContent,
        previousContent: previousContentRef.current,
      });

      if (editor && initialContent && typeof window !== "undefined") {
        // Skip if the content hasn't changed
        if (initialContent === previousContentRef.current) {
          console.log("[LexicalEditor] Content unchanged, skipping update");
          return;
        }

        // Update the previous content reference
        previousContentRef.current = initialContent;

        console.log("[LexicalEditor] Setting content", {
          initialContent,
        });

        try {
          // Set flag to indicate we're updating from parent
          isUpdatingFromParentRef.current = true;

          // Import the necessary functions for HTML parsing
          import("@lexical/html").then(({ $generateNodesFromDOM }) => {
            // Create a DOM parser
            const parser = new DOMParser();
            // Parse the HTML string into a DOM document
            const dom = parser.parseFromString(initialContent, "text/html");

            // Get the current editor state and selection before updating
            let savedSelection: RangeSelection | null = null;
            editor.getEditorState().read(() => {
              const selection = $getSelection();
              if ($isRangeSelection(selection)) {
                // Save the current selection state
                savedSelection = selection.clone();
                console.log("[LexicalEditor] Saved current selection", {
                  savedSelection,
                });
              }
            });

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

              // Try to restore the selection if we had one
              if (savedSelection) {
                savedSelection.dirty = true;
              }
            });

            // Reset the flag after a short delay
            setTimeout(() => {
              isUpdatingFromParentRef.current = false;
              console.log("[LexicalEditor] Reset update flag");
            }, 100);
          });
        } catch (error) {
          console.error("[LexicalEditor] Error setting content", error);
          isUpdatingFromParentRef.current = false;
        }
      }
    }, [editor, initialContent]);

    // Keep track of the last HTML to avoid unnecessary updates
    const lastHtmlRef = useRef<string>("");
    // Store the current HTML content locally
    const [localHtmlContent, setLocalHtmlContent] = useState<string>("");

    const handleEditorChange = useCallback(
      (html: string) => {
        // Call the onChange callback with the HTML string
        console.log("[LexicalEditor] handleEditorChange called with HTML", {
          htmlLength: html?.length,
          htmlPreview: html?.substring(0, 50),
          autoSave,
        });

        // Only update if the content has actually changed
        if (html !== lastHtmlRef.current) {
          lastHtmlRef.current = html;
          // Always update local state
          setLocalHtmlContent(html);

          // Only call parent onChange if autoSave is enabled
          if (autoSave && onChange) {
            console.log(
              "[LexicalEditor] Auto-saving: Calling onChange callback with new content"
            );
            onChange(html);
          }
        } else {
          console.log("[LexicalEditor] Content unchanged, skipping update");
        }
      },
      [onChange, autoSave]
    );

    // Function to manually save content to parent
    const handleSaveContent = useCallback(() => {
      console.log("[LexicalEditor] Manual save triggered", {
        contentLength: localHtmlContent?.length,
      });

      if (onChange && localHtmlContent) {
        onChange(localHtmlContent);
        console.log("[LexicalEditor] Content saved to parent");
      }
    }, [onChange, localHtmlContent]);

    console.log("[LexicalRichTextEditor] Rendering component");
    return (
      <LexicalComposer initialConfig={editorConfig}>
        <div className="editor-container">
          <div className="editor-toolbar">
            <ToolbarPlugin />
            {!autoSave && (
              <Button
                onClick={handleSaveContent}
                variant="outline"
                size="sm"
                className="mr-2 flex items-center gap-1"
              >
                <Save className="h-4 w-4" />
                Save
              </Button>
            )}
          </div>
          <div className="editor-inner">
            <RichTextPlugin
              contentEditable={
                <ContentEditable
                  className="editor-input"
                  onKeyDown={(e) => {
                    // Only log for special keys to reduce console noise
                    if (
                      e.key === "Enter" ||
                      e.key === "Tab" ||
                      e.key === "Escape"
                    ) {
                      console.log("[ContentEditable] onKeyDown", {
                        key: e.key,
                      });
                    }
                  }}
                  // Remove onInput handler to reduce console noise
                  onBlur={() => console.log("[ContentEditable] onBlur")}
                  onFocus={() => console.log("[ContentEditable] onFocus")}
                  // Add key to force the same instance to be used
                  key="lexical-editor-content-editable"
                />
              }
              placeholder={<Placeholder />}
              ErrorBoundary={LexicalErrorBoundary}
            />
            <ListPlugin />
            <HistoryPlugin />
            {/* Removed AutoFocusPlugin to prevent cursor jumping */}
            <OnChangePlugin onChange={handleEditorChange} />
            {/* Capture the editor instance */}
            <EditorCapturePlugin setEditor={setEditor} />
          </div>
        </div>
      </LexicalComposer>
    );
  },
  // Custom comparison function to prevent unnecessary re-renders
  (prevProps, nextProps) => {
    // Only re-render if initialContent has changed
    return prevProps.initialContent === nextProps.initialContent;
  }
);

export default LexicalRichTextEditor;
