import { useState } from "react";
import { Project, ProjectCategory } from "@/types";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import ProjectForm, { ProjectFormData, ProjectStatus } from "./ProjectForm";

interface EditProjectModalProps {
    project: Project;
    categories: ProjectCategory[];
    onClose: () => void;
    onSuccess: () => void;
}

export default function EditProjectModal({
    project,
    categories,
    onClose,
    onSuccess,
}: EditProjectModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleUpdateProject = async (data: ProjectFormData) => {
        setLoading(true);
        setError("");

        try {
            const response = await fetch(`/api/projects/${project.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (response.ok) {
                onSuccess();
            } else {
                setError(result.error || "Failed to update project");
            }
        } catch (err) {
            setError("An error occurred while updating the project");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Project</DialogTitle>
                    <DialogDescription>
                        Update the project details.
                    </DialogDescription>
                </DialogHeader>
                <ProjectForm
                    initialData={{
                        name: project.name,
                        description: project.description || "",
                        status: project.status as ProjectStatus,
                        color: project.color || "#3B82F6",
                        categoryId: project.category?.id || "",
                    }}
                    categories={categories}
                    onSubmit={handleUpdateProject}
                    onCancel={onClose}
                    loading={loading}
                    submitLabel="Update Project"
                    loadingLabel="Updating..."
                    error={error}
                    onCategoryCreated={(newCategory) => {
                        // Maintain original behavior if it existed, or just update local validation
                        categories.push(newCategory);
                    }}
                />
            </DialogContent>
        </Dialog>
    );
}
