import { useState } from "react";
import { ProjectCategory } from "@/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export type ProjectStatus = "ACTIVE" | "ON_HOLD" | "COMPLETED" | "ARCHIVED";

export interface ProjectFormData {
    name: string;
    description: string;
    status: ProjectStatus;
    color: string;
    categoryId: string;
}

interface ProjectFormProps {
    initialData?: ProjectFormData;
    categories: ProjectCategory[];
    onSubmit: (data: ProjectFormData) => Promise<void>;
    onCancel: () => void;
    loading?: boolean;
    submitLabel: string;
    loadingLabel?: string;
    error?: string;
    // Callback to update categories list when a new one is created
    onCategoryCreated?: (newCategory: ProjectCategory) => void;
}

const COLOR_OPTIONS = [
    "#3B82F6",
    "#10B981",
    "#8B5CF6",
    "#F59E0B",
    "#EF4444",
    "#06B6D4",
    "#EC4899",
    "#84CC16",
];

export default function ProjectForm({
    initialData,
    categories,
    onSubmit,
    onCancel,
    loading = false,
    submitLabel,
    loadingLabel = "Saving...",
    error,
    onCategoryCreated,
}: ProjectFormProps) {
    const [formData, setFormData] = useState<ProjectFormData>(
        initialData || {
            name: "",
            description: "",
            status: "ACTIVE",
            color: "#3B82F6",
            categoryId: "",
        }
    );

    const [localCategories, setLocalCategories] = useState<ProjectCategory[]>(categories);
    const [showCreateCategory, setShowCreateCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [newCategoryColor, setNewCategoryColor] = useState("#3B82F6");
    const [creatingCategory, setCreatingCategory] = useState(false);
    const [categoryError, setCategoryError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
    };

    const handleCreateCategory = async () => {
        if (!newCategoryName.trim()) return;

        setCreatingCategory(true);
        setCategoryError("");
        try {
            const response = await fetch("/api/project-categories", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: newCategoryName.trim(),
                    color: newCategoryColor,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                const newCategory = data.category;
                setLocalCategories((prev) => [...prev, newCategory]);

                if (onCategoryCreated) {
                    onCategoryCreated(newCategory);
                }
                setFormData({ ...formData, categoryId: newCategory.id });
                setShowCreateCategory(false);
                setNewCategoryName("");
                setNewCategoryColor("#3B82F6");
            } else {
                setCategoryError(data.error || "Failed to create category");
            }
        } catch (err) {
            setCategoryError("An error occurred while creating the category");
        } finally {
            setCreatingCategory(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4 text-sm">
                    {error}
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="name">Project Name *</Label>
                <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Enter project name"
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Enter project description"
                    rows={3}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                        value={formData.status}
                        onValueChange={(value) =>
                            setFormData({ ...formData, status: value as ProjectStatus })
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ACTIVE">Active</SelectItem>
                            <SelectItem value="ON_HOLD">On Hold</SelectItem>
                            <SelectItem value="COMPLETED">Completed</SelectItem>
                            <SelectItem value="ARCHIVED">Archived</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Color</Label>
                    <div className="flex gap-2 flex-wrap">
                        {COLOR_OPTIONS.map((color) => (
                            <button
                                key={color}
                                type="button"
                                onClick={() => setFormData({ ...formData, color })}
                                className={`w-6 h-6 rounded-full border-2 transition-all ${formData.color === color
                                        ? "border-gray-600 scale-110"
                                        : "border-gray-200 hover:scale-105"
                                    }`}
                                style={{ backgroundColor: color }}
                                title={color}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <Label>Category</Label>
                <Select
                    value={formData.categoryId}
                    onValueChange={(value) => {
                        if (value === "create-new") {
                            setShowCreateCategory(true);
                        } else {
                            setFormData({ ...formData, categoryId: value });
                        }
                    }}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="no-category">No Category</SelectItem>
                        {localCategories?.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                                {category.name}
                            </SelectItem>
                        ))}
                        <SelectItem
                            value="create-new"
                            className="text-blue-600 font-medium"
                        >
                            + Create New Category
                        </SelectItem>
                    </SelectContent>
                </Select>

                {/* Create Category Section */}
                {showCreateCategory && (
                    <div className="mt-2 p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-3 animate-in fade-in slide-in-from-top-2">
                        <div className="flex justify-between items-center">
                            <h4 className="font-medium text-sm text-gray-900">
                                Create New Category
                            </h4>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => {
                                    setShowCreateCategory(false);
                                    setCategoryError("");
                                }}
                            >
                                <span className="sr-only">Close</span>
                                <span aria-hidden="true">&times;</span>
                            </Button>
                        </div>

                        {categoryError && (
                            <div className="text-red-500 text-xs">{categoryError}</div>
                        )}

                        <div className="space-y-3">
                            <div>
                                <Input
                                    placeholder="Category name"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    className="bg-white"
                                />
                            </div>
                            <div>
                                <Label className="text-xs text-gray-600 mb-1 block">
                                    Color
                                </Label>
                                <div className="flex gap-2 flex-wrap">
                                    {COLOR_OPTIONS.map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => setNewCategoryColor(color)}
                                            className={`w-5 h-5 rounded-full border-2 ${newCategoryColor === color
                                                    ? "border-gray-500 scale-110"
                                                    : "border-gray-200"
                                                }`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-2 justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setShowCreateCategory(false);
                                        setNewCategoryName("");
                                        setNewCategoryColor("#3B82F6");
                                        setCategoryError("");
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={handleCreateCategory}
                                    disabled={creatingCategory || !newCategoryName.trim()}
                                >
                                    {creatingCategory ? "Creating..." : "Create"}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex gap-3 pt-4 justify-end">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                    {loading ? loadingLabel : submitLabel}
                </Button>
            </div>
        </form>
    );
}
