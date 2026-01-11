import { List, ActionPanel, Action, Icon, Color, showToast, Toast, useNavigation } from "@raycast/api";
import { useEffect, useState } from "react";
import { getPreferenceValues } from "@raycast/api";

interface Preferences {
  apiUrl: string;
}

interface Task {
  task_id: string;
  status: string;
  progress: number;
  message: string;
  video_title?: string;
  url?: string;
  error?: string;
}

interface TasksResponse {
  tasks: Record<string, Task>;
  total: number;
}

export default function Command() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const preferences = getPreferenceValues<Preferences>();
  const apiUrl = preferences.apiUrl || "http://localhost:8000";

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/tasks`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: TasksResponse = await response.json();
      const taskList = Object.values(data.tasks).sort((a, b) => {
        // Sort by status: processing first, then completed, then error
        const statusOrder = { processing: 0, completed: 1, error: 2 };
        return (statusOrder[a.status as keyof typeof statusOrder] || 3) - (statusOrder[b.status as keyof typeof statusOrder] || 3);
      });
      setTasks(taskList);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      showToast({
        style: Toast.Style.Failure,
        title: "Failed to fetch tasks",
        message: error instanceof Error ? error.message : "Unknown error",
      });
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();

    // Auto-refresh every 3 seconds
    const interval = setInterval(fetchTasks, 3000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return { source: Icon.CheckCircle, tintColor: Color.Green };
      case "error":
        return { source: Icon.XMarkCircle, tintColor: Color.Red };
      case "processing":
        return { source: Icon.Circle, tintColor: Color.Orange };
      default:
        return { source: Icon.Circle, tintColor: Color.SecondaryText };
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`${apiUrl}/api/task/${taskId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      showToast({
        style: Toast.Style.Success,
        title: "Task deleted",
      });

      // Refresh tasks
      fetchTasks();
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "Failed to delete task",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const getAccessories = (task: Task) => {
    const accessories: List.Item.Accessory[] = [];

    if (task.status === "processing") {
      accessories.push({
        text: `${task.progress}%`,
        icon: Icon.Clock,
      });
    }

    accessories.push({
      icon: getStatusIcon(task.status),
      tooltip: task.status,
    });

    return accessories;
  };

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Search tasks...">
      {tasks.length === 0 && !isLoading ? (
        <List.EmptyView
          icon={Icon.List}
          title="No tasks found"
          description="Start a new transcription to see tasks here"
        />
      ) : (
        tasks.map((task) => (
          <List.Item
            key={task.task_id}
            title={task.video_title || "Untitled Video"}
            subtitle={task.message}
            accessories={getAccessories(task)}
            actions={
              <ActionPanel>
                <Action.Push
                  title="View Details"
                  icon={Icon.Eye}
                  target={<TaskDetail task={task} apiUrl={apiUrl} />}
                />
                <Action.CopyToClipboard
                  title="Copy Task ID"
                  content={task.task_id}
                  shortcut={{ modifiers: ["cmd"], key: "c" }}
                />
                {task.url && (
                  <Action.CopyToClipboard
                    title="Copy Video URL"
                    content={task.url}
                    shortcut={{ modifiers: ["cmd", "shift"], key: "c" }}
                  />
                )}
                <Action
                  title="Delete Task"
                  icon={Icon.Trash}
                  style={Action.Style.Destructive}
                  onAction={() => deleteTask(task.task_id)}
                  shortcut={{ modifiers: ["cmd"], key: "d" }}
                />
                <Action
                  title="Refresh"
                  icon={Icon.ArrowClockwise}
                  onAction={fetchTasks}
                  shortcut={{ modifiers: ["cmd"], key: "r" }}
                />
              </ActionPanel>
            }
          />
        ))
      )}
    </List>
  );
}

function TaskDetail({ task, apiUrl }: { task: Task; apiUrl: string }) {
  const [fullTask, setFullTask] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { pop } = useNavigation();

  useEffect(() => {
    const fetchTaskDetails = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/task-status/${task.task_id}`);
        if (response.ok) {
          const data = await response.json();
          setFullTask(data);
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching task details:", error);
        setIsLoading(false);
      }
    };

    fetchTaskDetails();

    // Auto-refresh for processing tasks
    let interval: NodeJS.Timeout | null = null;
    if (task.status === "processing") {
      interval = setInterval(fetchTaskDetails, 2000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [task.task_id, task.status]);

  const renderMarkdown = () => {
    if (isLoading || !fullTask) {
      return "# Loading...\n\nPlease wait while we fetch the task details.";
    }

    let markdown = `# ${fullTask.video_title || "Video Transcription"}\n\n`;

    // Progress bar
    const progress = fullTask.progress || 0;
    const barLength = 20;
    const filledLength = Math.round((progress / 100) * barLength);
    const progressBar = "█".repeat(filledLength) + "░".repeat(barLength - filledLength);

    markdown += `## Progress: ${progress}%\n\n`;
    markdown += `\`${progressBar}\` ${progress}%\n\n`;
    markdown += `**Status:** ${fullTask.message}\n\n`;

    if (fullTask.status === "error") {
      markdown += `## Error\n\n\`\`\`\n${fullTask.error}\n\`\`\`\n\n`;
    }

    if (fullTask.status === "completed") {
      markdown += `---\n\n`;

      if (fullTask.detected_language && fullTask.summary_language) {
        markdown += `**Detected Language:** ${fullTask.detected_language} | **Summary Language:** ${fullTask.summary_language}\n\n`;
      }

      if (fullTask.summary) {
        markdown += `## Summary\n\n${fullTask.summary}\n\n---\n\n`;
      }

      if (fullTask.translation) {
        markdown += `## Translation\n\n${fullTask.translation}\n\n---\n\n`;
      }

      if (fullTask.script) {
        markdown += `## Transcript\n\n${fullTask.script}\n\n`;
      }
    }

    return markdown;
  };

  const getDownloadActions = () => {
    if (!fullTask || fullTask.status !== "completed" || !fullTask.safe_title || !fullTask.short_id) {
      return null;
    }

    const safe_title = fullTask.safe_title;
    const short_id = fullTask.short_id;

    return (
      <>
        <Action.OpenInBrowser
          title="Download Transcript"
          url={`${apiUrl}/api/download/transcript_${safe_title}_${short_id}.md`}
          icon={Icon.Download}
        />
        <Action.OpenInBrowser
          title="Download Summary"
          url={`${apiUrl}/api/download/summary_${safe_title}_${short_id}.md`}
          icon={Icon.Download}
        />
        {fullTask.translation && (
          <Action.OpenInBrowser
            title="Download Translation"
            url={`${apiUrl}/api/download/translation_${safe_title}_${short_id}.md`}
            icon={Icon.Download}
          />
        )}
      </>
    );
  };

  const deleteTask = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/task/${task.task_id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      showToast({
        style: Toast.Style.Success,
        title: "Task deleted",
      });

      // Go back to the list
      pop();
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "Failed to delete task",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  return (
    <List isLoading={isLoading}>
      <List.Item
        title={fullTask?.video_title || "Task Details"}
        detail={<List.Item.Detail markdown={renderMarkdown()} />}
        actions={
          <ActionPanel>
            {fullTask?.summary && (
              <Action.CopyToClipboard
                title="Copy Summary"
                content={fullTask.summary}
                shortcut={{ modifiers: ["cmd", "shift"], key: "s" }}
              />
            )}
            {fullTask?.script && (
              <Action.CopyToClipboard
                title="Copy Transcript"
                content={fullTask.script}
                shortcut={{ modifiers: ["cmd", "shift"], key: "t" }}
              />
            )}
            <Action.CopyToClipboard
              title="Copy Task ID"
              content={task.task_id}
              shortcut={{ modifiers: ["cmd"], key: "c" }}
            />
            {getDownloadActions()}
            <Action
              title="Delete Task"
              icon={Icon.Trash}
              style={Action.Style.Destructive}
              onAction={deleteTask}
              shortcut={{ modifiers: ["cmd"], key: "d" }}
            />
            <Action
              title="Back"
              icon={Icon.ArrowLeft}
              onAction={pop}
              shortcut={{ modifiers: [], key: "escape" }}
            />
          </ActionPanel>
        }
      />
    </List>
  );
}
