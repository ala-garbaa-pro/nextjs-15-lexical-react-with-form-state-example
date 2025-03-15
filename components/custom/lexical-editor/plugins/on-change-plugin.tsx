"use client";

import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

type OnChangePluginProps = {
  onChange: (html: string) => void;
};

export default function OnChangePlugin({ onChange }: OnChangePluginProps) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    console.log("[OnChangePlugin] useEffect triggered", {
      hasEditor: !!editor,
    });

    // We need a more reliable way to get the content
    const getHtmlFromEditor = () => {
      console.log("[OnChangePlugin] getHtmlFromEditor called");
      if (typeof window !== "undefined") {
        try {
          // Use the editor's serialization API
          return editor.getEditorState().read(() => {
            console.log("[OnChangePlugin] Reading editor state");
            // Get the text content directly from the editor state
            const root = editor._rootElement;
            if (root) {
              // Get the actual text content
              const textContent = root.textContent || "";
              console.log("[OnChangePlugin] Got text content", { textContent });

              // If there's text content, return a simple paragraph with the text
              if (textContent.trim()) {
                const html = `<p>${textContent}</p>`;
                console.log("[OnChangePlugin] Created HTML", { html });
                return html;
              }
            }
            return "";
          });
        } catch (error) {
          console.error("[OnChangePlugin] Error getting HTML", error);
          return "";
        }
      }
      console.log("[OnChangePlugin] Not in browser environment");
      return "";
    };

    // We need to debounce the updates to avoid too many re-renders
    let timeoutId: any = null;

    console.log("[OnChangePlugin] Registering update listener");
    const removeListener = editor.registerUpdateListener(() => {
      console.log("[OnChangePlugin] Update listener triggered");

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
      // Clean up the timeout and listener
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      removeListener();
    };
  }, [editor, onChange]);

  return null;
}
