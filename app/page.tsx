"use client";

import React from "react";
import { LexicalRichTextEditor } from "@/components/custom/lexical-editor";

export default function TestFormPage() {
  const [content] = React.useState("<p>init <b>content</b></p>");

  return (
    <div className="container p-10">
      <div className="mb-6">
        <div className="mb-2">
          <h3 className="text-lg font-medium">Lexical Editor:</h3>
          <p className="text-sm text-muted-foreground">
            Type in the editor below and check the console for logs
          </p>
        </div>
        <LexicalRichTextEditor />
      </div>

      <hr className="my-4" />
      <div className="mt-4">
        <h3 className="text-lg font-medium mb-2">Current Content:</h3>
        <div className="p-4 border rounded bg-muted/30">
          <pre className="whitespace-pre-wrap break-all">{content}</pre>
        </div>
      </div>
    </div>
  );
}
