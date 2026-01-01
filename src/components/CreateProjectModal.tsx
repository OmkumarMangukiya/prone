import { useState } from "react";
import { ProjectCategory } from "@/types";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import ProjectForm, { ProjectFormData } from "./ProjectForm";

interface CreateProjectModalProps {
    onClose: () => void;
    onSuccess: () => void;
    categories: ProjectCategory[];
}

export default function CreateProjectModal({
    onClose,
    onSuccess,
    categories,
}: CreateProjectModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleCreateProject = async (data: ProjectFormData) => {
        setLoading(true);
        setError("");

        try {
            const response = await fetch("/api/projects", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (response.ok) {
                onSuccess();
            } else {
                setError(result.error || "Failed to create project");
            }
        } catch (err) {
            setError("An error occurred while creating the project");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                    <DialogDescription>
                        Start a new project to collaborate with your team.
                    </DialogDescription>
                </DialogHeader>
                <ProjectForm
                    categories={categories}
                    onSubmit={handleCreateProject}
                    onCancel={onClose}
                    loading={loading}
                    submitLabel="Create Project"
                    loadingLabel="Creating..."
                    error={error}
                    onCategoryCreated={(newCategory) => {
                        // Maintain original behavior of updating the prop array
                        // Although typically we should avoid mutating props
                        categories.push(newCategory);
                    }}
                />
            </DialogContent>
        </Dialog>
    );
}
