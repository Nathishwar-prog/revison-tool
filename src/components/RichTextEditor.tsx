"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { 
    Bold, 
    Italic, 
    List, 
    ListOrdered, 
    Code, 
    Heading1, 
    Heading2,
    Quote
} from 'lucide-react';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export const RichTextEditor = ({ value, onChange, placeholder }: RichTextEditorProps) => {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2],
                },
            }),
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm dark:prose-invert focus:outline-none min-h-[150px] max-w-none p-4',
            },
        },
    });

    if (!editor) return null;

    const MenuBar = () => {
        return (
            <div className="flex flex-wrap gap-1 p-2 border-b bg-zinc-50 dark:bg-zinc-800/50">
                <MenuButton 
                    onClick={() => editor.chain().focus().toggleBold().run()} 
                    active={editor.isActive('bold')}
                    icon={Bold}
                />
                <MenuButton 
                    onClick={() => editor.chain().focus().toggleItalic().run()} 
                    active={editor.isActive('italic')}
                    icon={Italic}
                />
                <MenuButton 
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} 
                    active={editor.isActive('heading', { level: 1 })}
                    icon={Heading1}
                />
                <MenuButton 
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} 
                    active={editor.isActive('heading', { level: 2 })}
                    icon={Heading2}
                />
                <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-700 mx-1 self-center" />
                <MenuButton 
                    onClick={() => editor.chain().focus().toggleBulletList().run()} 
                    active={editor.isActive('bulletList')}
                    icon={List}
                />
                <MenuButton 
                    onClick={() => editor.chain().focus().toggleOrderedList().run()} 
                    active={editor.isActive('orderedList')}
                    icon={ListOrdered}
                />
                <MenuButton 
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()} 
                    active={editor.isActive('codeBlock')}
                    icon={Code}
                />
                <MenuButton 
                    onClick={() => editor.chain().focus().toggleBlockquote().run()} 
                    active={editor.isActive('blockquote')}
                    icon={Quote}
                />
            </div>
        );
    };

    return (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden bg-white dark:bg-zinc-900">
            <MenuBar />
            <EditorContent editor={editor} />
        </div>
    );
};

const MenuButton = ({ onClick, active, icon: Icon }: any) => (
    <button
        type="button"
        onClick={onClick}
        className={`p-2 rounded-lg transition-colors ${
            active 
                ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' 
                : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
        }`}
    >
        <Icon className="w-4 h-4" />
    </button>
);
