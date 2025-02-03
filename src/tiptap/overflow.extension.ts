/* eslint-disable @typescript-eslint/no-unused-vars */
import { Extension, Mark } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Fragment, Node as ProsemirrorNode } from 'prosemirror-model';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    overflow: {
      setOverflow: () => ReturnType;
      unsetOverflow: () => ReturnType;
    };
  }
}

export interface OverflowOptions {
  max: number;
  overflowClass: string;
}

const OverflowMark = Mark.create({
  name: 'overflowMark',
  inclusive: false,
  addOptions() {
    return {
      overflowClass: 'overflow',
    };
  },
  renderHTML() {
    return ['span', { class: this.options.overflowClass }, 0];
  },
  parseHTML() {
    return [{
      tag: `span.${this.options.overflowClass}`,
    }];
  },
});

export const OverflowExtension = Extension.create<OverflowOptions>({
  name: 'overflowExtension',

  addOptions() {
    return {
      max: 100,
      overflowClass: 'overflow',
    };
  },

  addExtensions() {
    return [
      OverflowMark.configure({
        overflowClass: this.options.overflowClass
      })
    ];
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('overflow'),
        appendTransaction: (_transactions, _oldState, newState) => {
          const schema = newState.schema;
          const overflowMark = schema.marks.overflowMark;
          
          if (!overflowMark) return null;

          const { max } = this.options;
          const { doc, tr } = newState;
          let totalLength = 0;

          // Calculate total text length including whitespace
          doc.descendants(node => {
            if (node.isText) totalLength += node.text?.length ?? 0;
            return true;
          });

          // Remove marks if under limit
          if (totalLength <= max) {
            let modified = false;
            doc.descendants((node, pos) => {
              if (node.isText && node.marks.some(m => m.type === overflowMark)) {
                tr.removeMark(pos, pos + node.nodeSize, overflowMark);
                modified = true;
              }
              return true;
            });
            return modified ? tr : null;
          }

          // Process text nodes
          let cumulative = 0;
          const changes: Array<{ pos: number; node: ProsemirrorNode }> = [];

          doc.descendants((node, pos) => {
            if (node.isText) {
              const text = node.text || '';
              const words = text.split(/(\s+)/); // Preserve whitespace
              let modified = false;
              const newNodes: ProsemirrorNode[] = [];

              for (const word of words) {
                if (word === '') continue;
                
                const isWhitespace = /\s+/.test(word);
                const wordLength = word.length;
                const previousCumulative = cumulative;
                cumulative += wordLength;

                // Skip existing overflow marks
                const existingMarks = node.marks.filter(m => m.type !== overflowMark);

                if (previousCumulative < max && cumulative > max && !isWhitespace) {
                  // Split word at overflow point
                  const splitIndex = max - previousCumulative;
                  const before = word.slice(0, splitIndex);
                  const after = word.slice(splitIndex);

                  newNodes.push(
                    schema.text(before, existingMarks),
                    schema.text(after, [...existingMarks, overflowMark.create()])
                  );
                  modified = true;
                } else if (previousCumulative >= max && !isWhitespace) {
                  // Full overflow
                  newNodes.push(schema.text(word, [...existingMarks, overflowMark.create()]));
                  modified = true;
                } else {
                  // Preserve original
                  newNodes.push(schema.text(word, existingMarks));
                }
              }

              if (modified) {
                changes.push({ pos, node });
                tr.replaceWith(pos, pos + node.nodeSize, Fragment.from(newNodes));
              }
            }
            return true;
          });

          return tr.steps.length > 0 ? tr : null;
        }
      })
    ];
  }
});