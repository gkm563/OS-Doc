export const writeDataFile = async (filePath: string, data: any): Promise<boolean> => {
  const content = typeof data === "string" ? data : JSON.stringify(data, null, 2);

  // If local development, write directly to filesystem via Vite middleware
  if (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  ) {
    try {
      const response = await fetch("/api/write-local", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ filePath, content }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to write local file");
      }
      return true;
    } catch (error) {
      console.error("Local write error:", error);
      alert(`Local Write Failed: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }

  // Production path: Write to GitHub via Netlify Function endpoint
  try {
    const response = await fetch("/.netlify/functions/commit-writer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ filePath, content }),
    });
    if (!response.ok) {
      throw new Error("Failed to commit changes via serverless helper");
    }
    return true;
  } catch (error) {
    console.error("Production commit error:", error);
    alert(`Production Commit Failed: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
};
