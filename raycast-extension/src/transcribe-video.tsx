import { Action, ActionPanel, Form, showToast, Toast, useNavigation, Detail, Icon } from "@raycast/api";
import { useEffect, useState } from "react";
import { getPreferenceValues } from "@raycast/api";

interface Preferences {
  apiUrl: string;
  summaryLanguage: string;
}

interface TaskStatus {
  status: string;
  progress: number;
  message: string;
  video_title?: string;
  script?: string;
  summary?: string;
  translation?: string;
  error?: string;
  detected_language?: string;
  summary_language?: string;
  safe_title?: string;
  short_id?: string;
}

export default function Command() {
  const [videoUrl, setVideoUrl] = useState("");
  const [language, setLanguage] = useState("");
  const preferences = getPreferenceValues<Preferences>();

  useEffect(() => {
    setLanguage(preferences.summaryLanguage || "en");
  }, []);

  async function handleSubmit(values: { url: string; language: string }) {
    if (!values.url) {
      showToast({
        style: Toast.Style.Failure,
        title: "Please enter a video URL",
      });
      return;
    }

    const toast = await showToast({
      style: Toast.Style.Animated,
      title: "Starting transcription...",
    });

    try {
      const apiUrl = preferences.apiUrl || "http://localhost:8000";
      const formData = new FormData();
      formData.append("url", values.url);
      formData.append("summary_language", values.language);

      const response = await fetch(`${apiUrl}/api/process-video`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const taskId = data.task_id;

      toast.style = Toast.Style.Success;
      toast.title = "Transcription started!";
      toast.message = `Task ID: ${taskId.substring(0, 8)}`;

      // Navigate to task progress view
      const { push } = useNavigation();
      push(<TaskProgress taskId={taskId} apiUrl={apiUrl} />);
    } catch (error) {
      toast.style = Toast.Style.Failure;
      toast.title = "Failed to start transcription";
      toast.message = error instanceof Error ? error.message : "Unknown error";
    }
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Start Transcription" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField
        id="url"
        title="Video URL"
        placeholder="https://www.youtube.com/watch?v=..."
        value={videoUrl}
        onChange={setVideoUrl}
      />
      <Form.Dropdown id="language" title="Summary Language" value={language} onChange={setLanguage}>
        <Form.Dropdown.Item value="en" title="English" />
        <Form.Dropdown.Item value="zh" title="Chinese (Simplified)" />
        <Form.Dropdown.Item value="ja" title="Japanese" />
        <Form.Dropdown.Item value="ko" title="Korean" />
        <Form.Dropdown.Item value="es" title="Spanish" />
        <Form.Dropdown.Item value="fr" title="French" />
        <Form.Dropdown.Item value="de" title="German" />
        <Form.Dropdown.Item value="pt" title="Portuguese" />
        <Form.Dropdown.Item value="ru" title="Russian" />
        <Form.Dropdown.Item value="ar" title="Arabic" />
      </Form.Dropdown>
    </Form>
  );
}

function TaskProgress({ taskId, apiUrl }: { taskId: string; apiUrl: string }) {
  const [taskStatus, setTaskStatus] = useState<TaskStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let isMounted = true;

    const connectSSE = () => {
      eventSource = new EventSource(`${apiUrl}/api/task-stream/${taskId}`);

      eventSource.onmessage = (event) => {
        if (!isMounted) return;

        try {
          const data = JSON.parse(event.data);
          if (data.type !== "heartbeat") {
            setTaskStatus(data);
            setIsLoading(false);

            // If task is completed or failed, close the connection
            if (data.status === "completed" || data.status === "error") {
              eventSource?.close();
            }
          }
        } catch (error) {
          console.error("Error parsing SSE data:", error);
        }
      };

      eventSource.onerror = (error) => {
        console.error("SSE error:", error);
        eventSource?.close();

        // Fallback to polling if SSE fails
        if (isMounted) {
          pollTaskStatus();
        }
      };
    };

    const pollTaskStatus = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/task-status/${taskId}`);
        if (response.ok && isMounted) {
          const data = await response.json();
          setTaskStatus(data);
          setIsLoading(false);

          // Continue polling if not completed
          if (data.status !== "completed" && data.status !== "error") {
            setTimeout(pollTaskStatus, 2000);
          }
        }
      } catch (error) {
        console.error("Error polling task status:", error);
        if (isMounted) {
          setTimeout(pollTaskStatus, 5000);
        }
      }
    };

    // Try SSE first, fall back to polling
    connectSSE();

    return () => {
      isMounted = false;
      eventSource?.close();
    };
  }, [taskId, apiUrl]);

  const getProgressIcon = () => {
    if (!taskStatus) return Icon.Circle;

    switch (taskStatus.status) {
      case "completed":
        return Icon.CheckCircle;
      case "error":
        return Icon.XMarkCircle;
      default:
        return Icon.Circle;
    }
  };

  const getProgressColor = () => {
    if (!taskStatus) return undefined;

    switch (taskStatus.status) {
      case "completed":
        return "#00ff00";
      case "error":
        return "#ff0000";
      default:
        return "#ffaa00";
    }
  };

  const renderMarkdown = () => {
    if (isLoading) {
      return "# Loading...\n\nPlease wait while we fetch the task status.";
    }

    if (!taskStatus) {
      return "# Error\n\nFailed to load task status.";
    }

    let markdown = `# ${taskStatus.video_title || "Video Transcription"}\n\n`;

    // Progress bar
    const progress = taskStatus.progress || 0;
    const barLength = 20;
    const filledLength = Math.round((progress / 100) * barLength);
    const progressBar = "█".repeat(filledLength) + "░".repeat(barLength - filledLength);

    markdown += `## Progress: ${progress}%\n\n`;
    markdown += `\`${progressBar}\` ${progress}%\n\n`;
    markdown += `**Status:** ${taskStatus.message}\n\n`;

    if (taskStatus.status === "error") {
      markdown += `## Error\n\n\`\`\`\n${taskStatus.error}\n\`\`\`\n\n`;
    }

    if (taskStatus.status === "completed") {
      markdown += `---\n\n`;

      if (taskStatus.detected_language && taskStatus.summary_language) {
        markdown += `**Detected Language:** ${taskStatus.detected_language} | **Summary Language:** ${taskStatus.summary_language}\n\n`;
      }

      if (taskStatus.summary) {
        markdown += `## Summary\n\n${taskStatus.summary}\n\n---\n\n`;
      }

      if (taskStatus.translation) {
        markdown += `## Translation\n\n${taskStatus.translation}\n\n---\n\n`;
      }

      if (taskStatus.script) {
        markdown += `## Transcript\n\n${taskStatus.script}\n\n`;
      }
    }

    return markdown;
  };

  const getDownloadActions = () => {
    if (taskStatus?.status !== "completed" || !taskStatus.safe_title || !taskStatus.short_id) {
      return null;
    }

    const safe_title = taskStatus.safe_title;
    const short_id = taskStatus.short_id;

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
        {taskStatus.translation && (
          <Action.OpenInBrowser
            title="Download Translation"
            url={`${apiUrl}/api/download/translation_${safe_title}_${short_id}.md`}
            icon={Icon.Download}
          />
        )}
      </>
    );
  };

  return (
    <Detail
      markdown={renderMarkdown()}
      isLoading={isLoading}
      metadata={
        taskStatus && (
          <Detail.Metadata>
            <Detail.Metadata.TagList title="Status">
              <Detail.Metadata.TagList.Item
                text={taskStatus.status}
                color={getProgressColor()}
                icon={getProgressIcon()}
              />
            </Detail.Metadata.TagList>
            <Detail.Metadata.Label title="Progress" text={`${taskStatus.progress}%`} />
            {taskStatus.video_title && (
              <Detail.Metadata.Label title="Video Title" text={taskStatus.video_title} />
            )}
            <Detail.Metadata.Separator />
            <Detail.Metadata.Label title="Task ID" text={taskId} />
          </Detail.Metadata>
        )
      }
      actions={
        <ActionPanel>
          <Action.CopyToClipboard
            title="Copy Task ID"
            content={taskId}
            shortcut={{ modifiers: ["cmd"], key: "c" }}
          />
          {taskStatus?.summary && (
            <Action.CopyToClipboard
              title="Copy Summary"
              content={taskStatus.summary}
              shortcut={{ modifiers: ["cmd", "shift"], key: "s" }}
            />
          )}
          {taskStatus?.script && (
            <Action.CopyToClipboard
              title="Copy Transcript"
              content={taskStatus.script}
              shortcut={{ modifiers: ["cmd", "shift"], key: "t" }}
            />
          )}
          {getDownloadActions()}
        </ActionPanel>
      }
    />
  );
}
