"use client";

import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

type EditorCapturePluginProps = {
  setEditor: (editor: any) => void;
};

export default function EditorCapturePlugin({
  setEditor,
}: EditorCapturePluginProps) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    console.log("[EditorCapturePlugin] useEffect triggered", {
      hasEditor: !!editor,
    });
    if (editor) {
      console.log("[EditorCapturePlugin] Setting editor instance");
      setEditor(editor);
    }
  }, [editor, setEditor]);

  return null;
}
