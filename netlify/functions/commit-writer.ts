import { Handler } from "@netlify/functions";

// Netlify serverless function to write commits to GitHub Contents API
export const handler: Handler = async (event, context) => {
  // Reject non-POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const token = process.env.GITHUB_TOKEN;
  const owner = "GKM563";
  const repo = "OS-Doc"; // Assuming the repository name is OS or same name

  if (!token) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Missing GITHUB_TOKEN environment secret" }),
    };
  }

  try {
    const { filePath, content } = JSON.parse(event.body || "{}");
    if (!filePath || !content) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing filePath or content payload" }),
      };
    }

    // 1. Fetch current file to retrieve its SHA (required for GitHub Content updates)
    const getUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
    const getRes = await fetch(getUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "GKM-Journey-CMS",
      },
    });

    let sha: string | undefined;
    if (getRes.status === 200) {
      const getJson = await getRes.json();
      sha = getJson.sha;
    }

    // 2. Commit the updated contents via PUT
    const putUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
    const putBody = {
      message: `chore(cms): update ${filePath} from admin dashboard`,
      content: Buffer.from(content).toString("base64"),
      sha,
    };

    const putRes = await fetch(putUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
        "User-Agent": "GKM-Journey-CMS",
      },
      body: JSON.stringify(putBody),
    });

    if (!putRes.ok) {
      const putErr = await putRes.text();
      throw new Error(`GitHub PUT failed: ${putErr}`);
    }

    const putJson = await putRes.json();
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, commit: putJson.commit.sha }),
    };
  } catch (error: any) {
    console.error("Netlify Function Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || "Internal server error" }),
    };
  }
};
