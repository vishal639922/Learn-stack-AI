import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { McqBlockView } from "./mcq-block-view";

export interface McqBlockAttrs {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    mcqBlock: {
      insertMcqBlock: (attrs?: Partial<McqBlockAttrs>) => ReturnType;
    };
  }
}

export const McqBlock = Node.create({
  name: "mcqBlock",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      question: { default: "Apna question yahan likho..." },
      options: { default: ["Option A", "Option B", "Option C", "Option D"] },
      correctIndex: { default: 0 },
      explanation: { default: "" },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="mcq-block"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "mcq-block" }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(McqBlockView);
  },

  addCommands() {
    return {
      insertMcqBlock:
        (attrs) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              question: "Apna question yahan likho...",
              options: ["Option A", "Option B", "Option C", "Option D"],
              correctIndex: 0,
              explanation: "",
              ...attrs,
            },
          });
        },
    };
  },
});
