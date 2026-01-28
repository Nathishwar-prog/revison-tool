"use client";

import React, { useState, useEffect } from 'react';
import { 
    Folder, 
    Plus, 
    Trash2, 
    Book, 
    ChevronRight,
} from 'lucide-react';
import { LoadingState } from '@/components/LoadingState';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle,
    DialogTrigger 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function getAuthToken() {
    return typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
}

export default function CollectionsPage() {
    const [collections, setCollections] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newColl, setNewColl] = useState({ name: '', description: '' });
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const fetchCollections = async () => {
        try {
            const token = getAuthToken();
            const res = await fetch('/api/collections', {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {},
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                setCollections(data);
            }
        } catch (err) {
            console.error("Failed to fetch collections:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCollections();
    }, []);

    const handleCreate = async () => {
        if (!newColl.name) return;
        try {
            const token = getAuthToken();
            const res = await fetch('/api/collections', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify(newColl)
            });
            if (res.ok) {
                setNewColl({ name: '', description: '' });
                setIsCreateOpen(false);
                fetchCollections();
            }
        } catch (err) {
            console.error("Failed to create collection:", err);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const token = getAuthToken();
            const res = await fetch(`/api/collections?id=${id}`, {
                method: 'DELETE',
                headers: token ? { 'Authorization': `Bearer ${token}` } : {},
            });
            if (res.ok) {
                setCollections(prev => prev.filter(c => c.id !== id));
                setDeleteId(null);
            }
        } catch (err) {
            console.error("Failed to delete collection:", err);
        }
    };

    if (loading) return <LoadingState />;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                        My Collections
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400">
                        Group your knowledge into organized sets.
                    </p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
                            <Plus className="w-4 h-4" />
                            New Collection
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create Collection</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Name</label>
                                <Input 
                                    placeholder="e.g. System Design Interview" 
                                    value={newColl.name}
                                    onChange={(e) => setNewColl({...newColl, name: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Description</label>
                                <Textarea 
                                    placeholder="Optional description..." 
                                    value={newColl.description}
                                    onChange={(e) => setNewColl({...newColl, description: e.target.value})}
                                />
                            </div>
                            <Button onClick={handleCreate} className="w-full bg-indigo-600 text-white">
                                Create Collection
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900">
                        <h3 className="text-lg font-bold mb-4">Delete Collection?</h3>
                        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                            This will permanently delete this collection. Knowledge items will not be deleted.
                        </p>
                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setDeleteId(null)}>
                                Cancel
                            </Button>
                            <Button 
                                className="bg-red-600 text-white hover:bg-red-700"
                                onClick={() => handleDelete(deleteId)}
                            >
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {collections.map((coll) => (
                    <div 
                        key={coll.id} 
                        className="group relative rounded-3xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm transition-all hover:shadow-md hover:border-indigo-100 dark:hover:border-indigo-900/30 overflow-hidden"
                    >
                        <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-indigo-50 dark:bg-indigo-900/10 transition-transform group-hover:scale-110" />
                        
                        <div className="relative space-y-4">
                            <div className="flex items-start justify-between">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600">
                                    <Folder className="w-6 h-6" />
                                </div>
                                <button 
                                    onClick={() => setDeleteId(coll.id)}
                                    className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-zinc-900 dark:text-white group-hover:text-indigo-600 transition-colors line-clamp-1">
                                    {coll.name}
                                </h3>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1">
                                    {coll.description || 'No description provided.'}
                                </p>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-400">
                                    <Book className="w-3.5 h-3.5" />
                                    <span>{coll.knowledge?.length || 0} items</span>
                                </div>
                                <Link 
                                    href={`/collections/${coll.id}`}
                                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                                >
                                    Open
                                    <ChevronRight className="w-3 h-3" />
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}

                {collections.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 bg-zinc-50/50 dark:bg-zinc-950/50 rounded-3xl border-2 border-dashed border-zinc-100 dark:border-zinc-800">
                        <Folder className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mb-4" />
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">No collections yet</h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs text-center mt-1">
                            Start by creating your first collection to group related concepts.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
