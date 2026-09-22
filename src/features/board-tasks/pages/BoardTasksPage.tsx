import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, Search, CheckSquare, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { usePageHeader } from "@/hooks/usePageHeader";
import { EmptyState } from "@/components/common";
import { useAppSelector } from "@/app/hooks";
import { ROLE_CODE } from "@/constants/roleCodes";
import {
  useGetBoardTasksQuery,
  useGetBoardTaskByIdQuery,
  useGetAdminAssociationsQuery,
} from "../api/boardTasksApi";
import {
  BoardTaskCard,
  BoardTaskFormModal,
  BoardTaskDetailView,
} from "../components";
import type { BoardTask, BoardTaskStatus } from "../types";

export interface BoardTasksPageProps {
  selectedAssociationId?: string | number;
  adminAssociations?: Array<{ id: string | number; name: string }>;
}

export const BoardTasksPage: React.FC<BoardTasksPageProps> = ({
  selectedAssociationId: passedSelectedAssociationId,
  adminAssociations: passedAdminAssociations = [],
}) => {
  const { taskId } = useParams<{ taskId?: string }>();
  const navigate = useNavigate();
  const { account } = useAuth();
  const globalActiveAssocId = useAppSelector(
    (state) => state.ui.activeAssociationId
  );

  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormModalOpen, setFormModalOpen] = useState(false);

  const userRoleCode = account?.role_code;
  const isAdmin = userRoleCode === ROLE_CODE.SUPER_ADMIN || userRoleCode === ROLE_CODE.ADMIN;
  const isBoardMember = userRoleCode === ROLE_CODE.BOARD_MEMBER;
  const canCreateTask = isAdmin || isBoardMember;

  // Fetch associations if Admin / Super Admin (used for task creation modal)
  const { data: fetchedAssocs = [] } = useGetAdminAssociationsQuery(undefined, {
    skip: !isAdmin || passedAdminAssociations.length > 0,
  });

  const effectiveAdminAssociations =
    passedAdminAssociations.length > 0 ? passedAdminAssociations : fetchedAssocs;

  const effectiveAssocFilter =
    passedSelectedAssociationId && String(passedSelectedAssociationId) !== "ALL"
      ? String(passedSelectedAssociationId)
      : globalActiveAssocId && globalActiveAssocId !== "ALL"
      ? globalActiveAssocId
      : "ALL";

  // RTK Query for fetching board tasks
  const associationQueryParam =
    effectiveAssocFilter !== "ALL" ? effectiveAssocFilter : undefined;

  const {
    data: tasks = [],
    isLoading: isTasksLoading,
    refetch,
  } = useGetBoardTasksQuery(associationQueryParam);

  const taskFromList = useMemo(() => {
    if (!taskId) return null;
    return tasks.find((t) => String(t.id) === String(taskId)) || null;
  }, [tasks, taskId]);

  const {
    data: singleTask,
    isLoading: isSingleTaskLoading,
    isError: isSingleTaskError,
  } = useGetBoardTaskByIdQuery(taskId || "", {
    skip: !taskId || !!taskFromList,
    refetchOnMountOrArgChange: true,
  });

  const activeTask = taskFromList || singleTask || null;

  usePageHeader({
    title: "Board Tasks",
    description: "Track common area work, maintenance initiatives, and responsibilities assigned to board members.",
  });

  // Filter tasks based on status tab and search query
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Status filter
      if (statusFilter !== "ALL" && task.status !== statusFilter) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = task.title?.toLowerCase().includes(query);
        const matchesDesc = task.description?.toLowerCase().includes(query);
        const matchesSupervisor = task.supervised_by_name
          ?.toLowerCase()
          .includes(query);
        const matchesCreator = task.created_by_name
          ?.toLowerCase()
          .includes(query);
        const matchesAssociation = task.association_name
          ?.toLowerCase()
          .includes(query);

        if (
          !matchesTitle &&
          !matchesDesc &&
          !matchesSupervisor &&
          !matchesCreator &&
          !matchesAssociation
        ) {
          return false;
        }
      }

      return true;
    });
  }, [tasks, statusFilter, searchQuery]);

  // Counts for tabs
  const counts = useMemo(() => {
    return {
      ALL: tasks.length,
      New: tasks.filter((t) => t.status === "New").length,
      "In Progress": tasks.filter((t) => t.status === "In Progress").length,
      Completed: tasks.filter((t) => t.status === "Completed").length,
      Cancelled: tasks.filter((t) => t.status === "Cancelled").length,
    };
  }, [tasks]);

  // If taskId param is in the URL, render Detail View or Loading/Not Found State
  if (taskId) {
    if (isTasksLoading || isSingleTaskLoading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400 gap-3">
          <Loader2 size={32} className="animate-spin text-indigo-600" />
          <p className="text-sm font-medium text-slate-600">Loading board task details...</p>
        </div>
      );
    }

    if (!activeTask || isSingleTaskError) {
      return (
        <div className="space-y-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/board-tasks")}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft size={16} /> Back to Board Tasks
          </Button>
          <EmptyState
            icon={<CheckSquare size={36} className="text-slate-400" />}
            title="Board Task Not Found"
            description="The board task you are looking for does not exist or you do not have permission to view it."
            actionText="View All Tasks"
            onAction={() => navigate("/board-tasks")}
          />
        </div>
      );
    }

    return (
      <div className="h-full flex flex-col animate-in fade-in duration-200">
        <BoardTaskDetailView
          task={activeTask}
          onBack={() => {
            navigate("/board-tasks");
            refetch();
          }}
          onStatusChange={() => {
            refetch();
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Action and Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <Input
              type="text"
              placeholder="Search tasks by title, supervisor, or scope..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-1 rounded-xl border-slate-200 bg-white text-sm shadow-xs focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500"
            />
          </div>
        </div>

        {canCreateTask && (
          <Button
            onClick={() => setFormModalOpen(true)}
          >
            <Plus size={16} className="mr-2" />
            Create Board Task
          </Button>
        )}
      </div>

      <div className="overflow-x-auto pb-1">
        <Tabs
          value={statusFilter}
          onValueChange={setStatusFilter}
          className="w-auto inline-block"
        >
          <TabsList className="bg-slate-100/80 p-1 rounded-2xl h-auto flex flex-wrap gap-1">
            <TabsTrigger
              value="ALL"
              className="rounded-xl px-4 py-2 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-xs"
            >
              All Tasks ({counts.ALL})
            </TabsTrigger>
            <TabsTrigger
              value="New"
              className="rounded-xl px-4 py-2 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-xs"
            >
              New ({counts.New})
            </TabsTrigger>
            <TabsTrigger
              value="In Progress"
              className="rounded-xl px-4 py-2 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-xs"
            >
              In Progress ({counts["In Progress"]})
            </TabsTrigger>
            <TabsTrigger
              value="Completed"
              className="rounded-xl px-4 py-2 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-xs"
            >
              Completed ({counts.Completed})
            </TabsTrigger>
            <TabsTrigger
              value="Cancelled"
              className="rounded-xl px-4 py-2 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-xs"
            >
              Cancelled ({counts.Cancelled})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isTasksLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[350px] text-slate-400 gap-3">
          <Loader2 size={32} className="animate-spin text-indigo-600" />
          <p className="text-sm font-medium text-slate-600">Loading board tasks...</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          icon={<CheckSquare size={36} className="text-slate-400" />}
          title="No board tasks found"
          description={
            searchQuery
              ? `No board tasks matching "${searchQuery}".`
              : statusFilter !== "ALL"
              ? `There are currently no tasks with status "${statusFilter}".`
              : "No board tasks have been assigned yet."
          }
          actionText={canCreateTask ? "Create First Task" : undefined}
          onAction={canCreateTask ? () => setFormModalOpen(true) : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTasks.map((task) => (
            <BoardTaskCard
              key={task.id}
              task={task}
              onClick={(clickedTask) => navigate(`/board-tasks/${clickedTask.id}`)}
            />
          ))}
        </div>
      )}

      <BoardTaskFormModal
        isOpen={isFormModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSuccess={() => refetch()}
        adminAssociations={effectiveAdminAssociations}
        defaultAssociationId={
          effectiveAssocFilter !== "ALL"
            ? effectiveAssocFilter
            : effectiveAdminAssociations[0]?.id
            ? String(effectiveAdminAssociations[0].id)
            : undefined
        }
        isBoardMember={isBoardMember}
      />
    </div>
  );
};

export default BoardTasksPage;
