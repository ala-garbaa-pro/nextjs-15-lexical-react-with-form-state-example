"use client";

import React from "react";
import { LexicalRichTextEditor } from "@/components/custom/lexical-editor";
import Editor from "@monaco-editor/react";

export default function TestFormPage() {
  console.log("[TestFormPage] Component rendering");
  const [content, setContent] = React.useState("<p>init <b>content</b></p>");

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

  const handleContentChange = React.useCallback((html: string) => {
    console.log("[TestFormPage] handleContentChange called", {
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

  return (
    <div className="container py-10">
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
          <h3 className="text-lg font-medium mb-2">Current Content:</h3>
          <Editor
            height="20vh"
            defaultLanguage="html"
            defaultValue={content}
            theme=""
          />
          ;
          <div className="p-4 border rounded bg-muted/30">
            <pre className="whitespace-pre-wrap break-all">{content}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
