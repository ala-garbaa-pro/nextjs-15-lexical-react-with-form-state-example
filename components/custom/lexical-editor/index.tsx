"use client";

import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";

const theme = {
  // Theme styling goes here
  //...
};

function onError(error: Error) {
  console.error(error);
}

function onChange(editorState: any) {
  editorState.read(() => {
    console.log(editorState);
    // Read the contents of the EditorState here.
    // This is where you would implement your custom save behavior.
  });
}

type LexicalRichTextEditorProps = {};
export function LexicalRichTextEditor({}: LexicalRichTextEditorProps) {
  const initialConfig = {
    namespace: "MyEditor",
    theme,
    onError,
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <RichTextPlugin
        contentEditable={
          <ContentEditable
            aria-placeholder={"Enter some text..."}
            placeholder={<div>Enter some text...</div>}
          />
        }
        ErrorBoundary={LexicalErrorBoundary}
      />

      <OnChangePlugin onChange={onChange} />
      <HistoryPlugin />
    </LexicalComposer>
  );
}

export default LexicalRichTextEditor;
