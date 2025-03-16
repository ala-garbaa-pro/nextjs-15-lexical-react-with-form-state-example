"use client";

import { useEffect, useRef } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $generateHtmlFromNodes } from "@lexical/html";
import { $getRoot } from "lexical";

type OnChangePluginProps = {
  onChange: (html: string) => void;
};

export default function OnChangePlugin({ onChange }: OnChangePluginProps) {
  const [editor] = useLexicalComposerContext();
  // Track if the update is from a programmatic change
  const isProgrammaticChangeRef = useRef(false);

  useEffect(() => {
    console.log("[OnChangePlugin] useEffect triggered", {
      hasEditor: !!editor,
    });

    // Get formatted HTML content from the editor
    const getHtmlFromEditor = () => {
      console.log("[OnChangePlugin] getHtmlFromEditor called");
      if (typeof window !== "undefined") {
        try {
          // Use the editor's serialization API with proper HTML generation
          return editor.getEditorState().read(() => {
            console.log("[OnChangePlugin] Reading editor state");

            // Get the root node
            const root = $getRoot();

            // Generate HTML from the editor nodes - this preserves formatting
            const html = $generateHtmlFromNodes(editor, null);
            console.log("[OnChangePlugin] Generated formatted HTML", {
              html,
              htmlPreview: html?.substring(0, 100),
            });

            // Also log the text content for debugging
            const textContent = root.getTextContent() || "";
            console.log("[OnChangePlugin] Got text content", { textContent });

            return html || "";
          });
        } catch (error) {
          console.error("[OnChangePlugin] Error getting HTML", error);
          return "";
        }
      }
      console.log("[OnChangePlugin] Not in browser environment");
      return "";
    };

    // Listen for programmatic changes
    const removeUpdateListener = editor.registerUpdateListener(
      ({ dirtyElements, dirtyLeaves, prevEditorState, tags }) => {
        // Check if this update was triggered by setting content programmatically
        if (tags.has("historic") && tags.has("initialize-editor")) {
          console.log("[OnChangePlugin] Detected programmatic content change");
          isProgrammaticChangeRef.current = true;

          // Reset the flag after a short delay
          setTimeout(() => {
            isProgrammaticChangeRef.current = false;
          }, 100);
        }
      }
    );

    // We need to debounce the updates to avoid too many re-renders
    let timeoutId: any = null;

    console.log("[OnChangePlugin] Registering content update listener");
    const removeContentListener = editor.registerUpdateListener(() => {
      console.log("[OnChangePlugin] Content update listener triggered");

      // Skip if this update was triggered by setting content programmatically
      if (isProgrammaticChangeRef.current) {
        console.log(
          "[OnChangePlugin] Skipping update due to programmatic change"
        );
        return;
      }

      // Clear any existing timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Set a new timeout to debounce the updates
      timeoutId = setTimeout(() => {
        // Get HTML content and call the onChange callback
        const html = getHtmlFromEditor();
        console.log("[OnChangePlugin] Calling onChange with HTML", { html });
        onChange(html);
      }, 100); // 100ms debounce
    });

    return () => {
      // Clean up the timeout and listeners
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      removeContentListener();
      removeUpdateListener();
    };
  }, [editor, onChange]);

  return null;
}
