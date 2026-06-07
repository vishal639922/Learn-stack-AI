"use client";

import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { HelpCircle, Plus, Trash2, GripVertical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { McqBlockAttrs } from "./mcq-block";
import { McqQuiz } from "../mcq-quiz";

export function McqBlockView({ node, updateAttributes, deleteNode, editor }: NodeViewProps) {
  const attrs = node.attrs as McqBlockAttrs;

  if (!editor.isEditable) {
    return (
      <NodeViewWrapper>
        <McqQuiz attrs={attrs} />
      </NodeViewWrapper>
    );
  }

  const options = Array.isArray(attrs.options) ? attrs.options : [];

  const updateOption = (index: number, value: string) => {
    const next = [...options];
    next[index] = value;
    updateAttributes({ options: next });
  };

  const addOption = () => {
    if (options.length >= 6) return;
    updateAttributes({ options: [...options, `Option ${String.fromCharCode(65 + options.length)}`] });
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) return;
    const next = options.filter((_, i) => i !== index);
    const correctIndex =
      attrs.correctIndex >= next.length
        ? Math.max(0, next.length - 1)
        : attrs.correctIndex > index
          ? attrs.correctIndex - 1
          : attrs.correctIndex;
    updateAttributes({ options: next, correctIndex });
  };

  return (
    <NodeViewWrapper className="mcq-block-editor my-6">
      <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-primary font-semibold text-sm">
            <GripVertical className="h-4 w-4 opacity-50 cursor-grab" data-drag-handle />
            <HelpCircle className="h-4 w-4" />
            MCQ Block
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={deleteNode}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs">Question</Label>
            <Textarea
              value={attrs.question}
              onChange={(e) => updateAttributes({ question: e.target.value })}
              rows={2}
              className="bg-background"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Options (correct answer select karo)</Label>
            {options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`mcq-correct-${node.attrs.id || "block"}`}
                  checked={attrs.correctIndex === index}
                  onChange={() => updateAttributes({ correctIndex: index })}
                  className="accent-primary"
                />
                <Input
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  className="bg-background flex-1"
                  placeholder={`Option ${String.fromCharCode(65 + index)}`}
                />
                {options.length > 2 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => removeOption(index)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
            {options.length < 6 && (
              <Button type="button" variant="outline" size="sm" onClick={addOption} className="gap-1">
                <Plus className="h-3 w-3" /> Option add karo
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Explanation (optional)</Label>
            <Textarea
              value={attrs.explanation}
              onChange={(e) => updateAttributes({ explanation: e.target.value })}
              rows={2}
              className="bg-background"
              placeholder="Sahi answer ke baad explanation dikhega..."
            />
          </div>
        </div>
      </div>
    </NodeViewWrapper>
  );
}
