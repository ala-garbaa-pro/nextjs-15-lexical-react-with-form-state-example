"use client";

import React from "react";
import { LexicalRichTextEditor } from "@/components/custom/lexical-editor";
import Editor from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { Code2, RefreshCw, AlertCircle, FileEdit } from "lucide-react";
import { toast } from "sonner";

// Debounce function to limit how often a function can be called
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function (...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export default function TestFormPage() {
  console.log("[TestFormPage] Component rendering");
  const [content, setContent] = React.useState("<p>init <b>content</b></p>");
  const { theme } = useTheme();
  const monacoEditorRef = React.useRef<any>(null);

  React.useEffect(() => {
    console.log("[TestFormPage] Component mounted");
    return () => {
      console.log("[TestFormPage] Component unmounting");
    };
  }, []);

  React.useEffect(() => {
    console.log("[TestFormPage] Content changed", {
      contentLength: content?.length,
    });
  }, [content]);

  // Log when theme changes
  React.useEffect(() => {
    console.log("[TestFormPage] Theme changed", { theme });
  }, [theme]);

  const handleContentChange = React.useCallback((html: string) => {
    console.log("[TestFormPage] handleContentChange called from Lexical", {
      htmlLength: html?.length,
      htmlPreview: html?.substring(0, 50),
    });

    // Only update state if there's actual content
    if (html && html.trim()) {
      setContent(html);
    } else {
      console.log("[TestFormPage] Empty content received, not updating state");
    }
  }, []);

  // Use debounce to prevent too many updates
  const handleMonacoChange = React.useCallback(
    debounce((value: string | undefined) => {
      console.log("[TestFormPage] handleMonacoChange called", {
        valueLength: value?.length,
        valuePreview: value?.substring(0, 50),
      });

      if (value && value.trim()) {
        // Validate HTML before applying
        if (validateHtml(value)) {
          setContent(value);
        } else {
          console.warn(
            "[TestFormPage] Invalid HTML detected, not updating state"
          );
          // We don't show a toast here to avoid too many notifications during typing
        }
      } else {
        console.log(
          "[TestFormPage] Empty value from Monaco, not updating state"
        );
      }
    }, 800), // 800ms debounce - slightly longer to give user time to type
    []
  );

  const handleEditorDidMount = React.useCallback((editor: any) => {
    console.log("[TestFormPage] Monaco editor mounted");
    monacoEditorRef.current = editor;
  }, []);

  const formatHtml = React.useCallback(() => {
    if (monacoEditorRef.current) {
      console.log("[TestFormPage] Formatting HTML");
      // Trigger the editor's format document action
      monacoEditorRef.current.getAction("editor.action.formatDocument").run();
    }
  }, []);

  const validateHtml = (html: string): boolean => {
    try {
      // Create a new DOM parser
      const parser = new DOMParser();
      // Parse the HTML string
      const doc = parser.parseFromString(html, "text/html");

      // Check if there are any parsing errors
      const errors = doc.querySelectorAll("parsererror");
      if (errors.length > 0) {
        console.error("[TestFormPage] HTML validation failed", { errors });
        return false;
      }

      return true;
    } catch (error) {
      console.error("[TestFormPage] Error validating HTML", { error });
      return false;
    }
  };

  const applyChanges = React.useCallback(() => {
    if (monacoEditorRef.current) {
      console.log("[TestFormPage] Applying changes immediately");
      const currentValue = monacoEditorRef.current.getValue();

      if (currentValue && currentValue.trim()) {
        // Validate HTML before applying
        if (validateHtml(currentValue)) {
          setContent(currentValue);
          toast.success("HTML changes applied successfully");
        } else {
          toast.error("Invalid HTML. Please fix the errors before applying.", {
            icon: <AlertCircle className="h-4 w-4" />,
          });
        }
      }
    }
  }, []);

  // Function to add a test element to the content
  const addTestElement = React.useCallback(() => {
    console.log("[TestFormPage] Adding test element to content");
    // Create a timestamp for uniqueness
    const timestamp = new Date().toLocaleTimeString();
    // Add a new paragraph with the timestamp
    const newContent =
      content +
      `<p style="color: blue;">Test element added at ${timestamp}</p>`;
    setContent(newContent);
    toast.success("Added new element to content");
  }, [content]);

  return (
    <div className="container py-10">
      <div className="flex justify-end mb-4 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={addTestElement}
          className="flex items-center gap-1"
        >
          <FileEdit className="h-4 w-4" />
          Add Test Element
        </Button>
        <ThemeToggle />
      </div>
      <div className="max-w-4xl">
        <div className="mb-6  mx-auto">
          <div className="mb-2">
            <h3 className="text-lg font-medium">Lexical Editor:</h3>
            <p className="text-sm text-muted-foreground">
              Type in the editor below and check the console for logs
            </p>
          </div>
          <LexicalRichTextEditor
            initialContent={content}
            onChange={handleContentChange}
          />
        </div>

        <hr className="my-4" />
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h3 className="text-lg font-medium">Edit HTML Content:</h3>
              <p className="text-sm text-muted-foreground">
                You can directly edit the HTML here and changes will sync with
                the Lexical editor
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={formatHtml}
                className="flex items-center gap-1"
              >
                <Code2 className="h-4 w-4" />
                Format HTML
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={applyChanges}
                className="flex items-center gap-1"
              >
                <RefreshCw className="h-4 w-4" />
                Apply Changes
              </Button>
            </div>
          </div>
          <Editor
            height="20vh"
            defaultLanguage="html"
            value={content}
            onChange={handleMonacoChange}
            onMount={handleEditorDidMount}
            theme={theme === "light" ? "light" : "vs-dark"}
            options={{
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              fontSize: 14,
              wordWrap: "on",
              formatOnPaste: true,
              formatOnType: true,
            }}
            loading={
              <div className="p-4 text-muted-foreground">Loading editor...</div>
            }
          />
          <div className="p-4 border rounded bg-muted/30">
            <pre className="whitespace-pre-wrap break-all">{content}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
