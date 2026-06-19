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

  // Check if we have a direct GitHub token in localStorage
  const directToken = localStorage.getItem("gkm-pat");
  if (directToken) {
    try {
      const owner = "GKM563";
      const repo = "OS-Doc";
      
      // 1. Fetch file to get current SHA (required for GitHub Content updates)
      const getUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
      const getRes = await fetch(getUrl, {
        headers: {
          Authorization: `Bearer ${directToken}`,
          Accept: "application/vnd.github+json",
        },
      });
      
      let sha: string | undefined;
      if (getRes.status === 200) {
        const getJson = await getRes.json();
        sha = getJson.sha;
      }
      
      // 2. Commit updated contents (using safe base64 encoding for utf-8)
      const putUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
      
      // Safe base64 conversion for unicode characters (like Hindi translations)
      const base64Content = btoa(encodeURIComponent(content).replace(/%([0-9A-F]{2})/g, (_, p1) => {
        return String.fromCharCode(parseInt(p1, 16));
      }));

      const putBody = {
        message: `chore(cms): update ${filePath} from client admin panel`,
        content: base64Content,
        sha,
      };
      
      const putRes = await fetch(putUrl, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${directToken}`,
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(putBody),
      });
      
      if (!putRes.ok) {
        const putErr = await putRes.text();
        throw new Error(`GitHub direct write failed: ${putErr}`);
      }
      
      return true;
    } catch (error) {
      console.error("Direct GitHub write error:", error);
      alert(`GitHub CMS Commit Failed: ${error instanceof Error ? error.message : String(error)}`);
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
