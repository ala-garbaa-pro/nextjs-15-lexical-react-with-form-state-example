"use client";

import { useCallback, useState, useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
} from "@lexical/list";
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  $getRoot,
  $createParagraphNode,
  $createTextNode,
} from "lexical";
import { $createHeadingNode, $isHeadingNode } from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTheme } from "next-themes";

export default function ToolbarPlugin() {
  console.log("[ToolbarPlugin] Rendering");
  const [editor] = useLexicalComposerContext();
  console.log("[ToolbarPlugin] Got editor from context", {
    hasEditor: !!editor,
  });
  const { theme } = useTheme();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Prevent losing focus when clicking toolbar buttons
  const preventBlur = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  const clearEditor = useCallback(() => {
    console.log("[ToolbarPlugin] clearEditor called");
    editor.update(() => {
      console.log("[ToolbarPlugin] Updating editor to clear content");
      // Get the root node of the editor
      const root = $getRoot();
      console.log("[ToolbarPlugin] Got root node");
      // Clear all content
      root.clear();
      console.log("[ToolbarPlugin] Cleared root node");
      // Create an empty paragraph node
      const paragraph = $createParagraphNode();
      // Add an empty text node to the paragraph
      paragraph.append($createTextNode(""));
      console.log("[ToolbarPlugin] Created empty paragraph");
      // Add the paragraph to the root
      root.append(paragraph);
      console.log("[ToolbarPlugin] Added paragraph to root");
    });
    // Close the dialog after clearing
    setIsDialogOpen(false);
    console.log("[ToolbarPlugin] Closed dialog");
  }, [editor]);

  const formatHeading = useCallback(
    (level: 1 | 2 | 3) => {
      console.log("[ToolbarPlugin] formatHeading called", { level });
      editor.update(() => {
        console.log("[ToolbarPlugin] Updating editor to format heading");
        const selection = $getSelection();
        console.log("[ToolbarPlugin] Got selection", {
          hasSelection: !!selection,
          isRangeSelection: $isRangeSelection(selection),
        });
        if ($isRangeSelection(selection)) {
          console.log("[ToolbarPlugin] Setting blocks type to heading", {
            level,
          });
          $setBlocksType(selection, () => $createHeadingNode(`h${level}`));
          console.log("[ToolbarPlugin] Set blocks type to heading");
        }
      });
    },
    [editor]
  );

  // Update toolbar state based on current selection
  const updateToolbar = useCallback(() => {
    console.log("[ToolbarPlugin] updateToolbar called");
    const selection = $getSelection();
    console.log("[ToolbarPlugin] Got selection", {
      hasSelection: !!selection,
      isRangeSelection: $isRangeSelection(selection),
    });
    if ($isRangeSelection(selection)) {
      const isBoldFormat = selection.hasFormat("bold");
      const isItalicFormat = selection.hasFormat("italic");
      const isUnderlineFormat = selection.hasFormat("underline");
      const isStrikethroughFormat = selection.hasFormat("strikethrough");

      console.log("[ToolbarPlugin] Selection formats", {
        isBold: isBoldFormat,
        isItalic: isItalicFormat,
        isUnderline: isUnderlineFormat,
        isStrikethrough: isStrikethroughFormat,
      });

      setIsBold(isBoldFormat);
      setIsItalic(isItalicFormat);
      setIsUnderline(isUnderlineFormat);
      setIsStrikethrough(isStrikethroughFormat);
    }
  }, []);

  // Register for selection changes to update toolbar state
  useEffect(() => {
    console.log("[ToolbarPlugin] Registering update listener");
    const unregisterListener = editor.registerUpdateListener(
      ({ editorState }) => {
        console.log("[ToolbarPlugin] Editor update detected");
        editorState.read(() => {
          console.log("[ToolbarPlugin] Reading editor state");
          updateToolbar();
        });
      }
    );

    return () => {
      console.log("[ToolbarPlugin] Unregistering update listener");
      unregisterListener();
    };
  }, [editor, updateToolbar]);

  return (
    <div className="toolbar" onMouseDown={preventBlur}>
      <div className="flex flex-wrap gap-1 p-1 border-b border-input bg-background dark:bg-background">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
                title="Undo"
                type="button"
                className="text-foreground hover:text-foreground/80"
              >
                <Undo className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Undo</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
                title="Redo"
                type="button"
                className="text-foreground hover:text-foreground/80"
              >
                <Redo className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Redo</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="w-px h-6 bg-border mx-1 my-auto" />

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")
                }
                title="Bold"
                type="button"
                className="text-foreground hover:text-foreground/80"
                data-state={isBold ? "active" : ""}
              >
                <Bold className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Bold</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isItalic ? "secondary" : "ghost"}
                size="icon"
                onClick={() =>
                  editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")
                }
                title="Italic"
                type="button"
                className="text-foreground hover:text-foreground/80"
              >
                <Italic className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Italic</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isUnderline ? "secondary" : "ghost"}
                size="icon"
                onClick={() =>
                  editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")
                }
                title="Underline"
                type="button"
                className="text-foreground hover:text-foreground/80"
              >
                <Underline className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Underline</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isStrikethrough ? "secondary" : "ghost"}
                size="icon"
                onClick={() =>
                  editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")
                }
                title="Strikethrough"
                type="button"
                className="text-foreground hover:text-foreground/80"
              >
                <Strikethrough className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Strikethrough</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="w-px h-6 bg-border mx-1 my-auto" />

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => formatHeading(1)}
                title="Heading 1"
                type="button"
                className="text-foreground hover:text-foreground/80"
              >
                <Heading1 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Heading 1</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => formatHeading(2)}
                title="Heading 2"
                type="button"
                className="text-foreground hover:text-foreground/80"
              >
                <Heading2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Heading 2</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => formatHeading(3)}
                title="Heading 3"
                type="button"
                className="text-foreground hover:text-foreground/80"
              >
                <Heading3 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Heading 3</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="w-px h-6 bg-border mx-1 my-auto" />

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  editor.dispatchCommand(
                    INSERT_UNORDERED_LIST_COMMAND,
                    undefined
                  )
                }
                title="Bullet List"
                type="button"
                className="text-foreground hover:text-foreground/80"
              >
                <List className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Bullet List</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
                }
                title="Numbered List"
                type="button"
                className="text-foreground hover:text-foreground/80"
              >
                <ListOrdered className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Numbered List</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left")
                }
                title="Align Left"
                type="button"
                className="text-foreground hover:text-foreground/80"
              >
                <AlignLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Align Left</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center")
                }
                title="Align Center"
                type="button"
                className="text-foreground hover:text-foreground/80"
              >
                <AlignCenter className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Align Center</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right")
                }
                title="Align Right"
                type="button"
                className="text-foreground hover:text-foreground/80"
              >
                <AlignRight className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Align Right</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify")
                }
                title="Justify"
                type="button"
                className="text-foreground hover:text-foreground/80"
              >
                <AlignJustify className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Justify</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="w-px h-6 bg-border mx-1 my-auto" />

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Clear Editor"
                    type="button"
                    className="text-foreground hover:text-foreground/80"
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive transition-colors" />
                  </Button>
                </DialogTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Clear Editor</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DialogContent className="sm:max-w-md">
            <DialogHeader className="gap-2">
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                <DialogTitle>Clear Editor Content</DialogTitle>
              </div>
              <DialogDescription className="text-left">
                Are you sure you want to clear the editor? All content will be
                lost and this action{" "}
                <span className="font-semibold">cannot be undone</span>.
              </DialogDescription>
            </DialogHeader>
            <div className="pt-4 pb-2">
              <div className="rounded-md bg-muted p-3 text-sm">
                <p className="text-muted-foreground">
                  Tip: You can use{" "}
                  <span className="font-mono bg-muted-foreground/20 px-1 rounded">
                    Ctrl+Z
                  </span>{" "}
                  to undo changes after editing, but clearing removes all
                  history.
                </p>
              </div>
            </div>
            <DialogFooter className="flex gap-2 pt-4 sm:justify-between">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={clearEditor}>
                Clear Editor
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
