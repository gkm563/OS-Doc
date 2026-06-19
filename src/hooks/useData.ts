import { useQuery } from "@tanstack/react-query";
import type {
  Contribution,
  Reviewer,
  Achievement,
  GithubPR,
  GerritChange,
  GitlabMR,
  WikimediaEdit,
  PhabricatorTask,
} from "../types";

const fetchJSON = async <T>(url: string): Promise<T> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${url}`);
  }
  return response.json();
};

export const useContributions = () => {
  return useQuery<Contribution[]>({
    queryKey: ["contributions"],
    queryFn: () => fetchJSON<Contribution[]>("data/contributions.json"),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useReviewers = () => {
  return useQuery<Reviewer[]>({
    queryKey: ["reviewers"],
    queryFn: () => fetchJSON<Reviewer[]>("data/reviewers.json"),
    staleTime: 5 * 60 * 1000,
  });
};

export const useAchievements = () => {
  return useQuery<Achievement[]>({
    queryKey: ["achievements"],
    queryFn: () => fetchJSON<Achievement[]>("data/achievements.json"),
    staleTime: 5 * 60 * 1000,
  });
};

export const useGithubData = () => {
  return useQuery<GithubPR[]>({
    queryKey: ["github-raw"],
    queryFn: () => fetchJSON<GithubPR[]>("data/github.json"),
    staleTime: 5 * 60 * 1000,
  });
};

export const useGerritData = () => {
  return useQuery<GerritChange[]>({
    queryKey: ["gerrit-raw"],
    queryFn: () => fetchJSON<GerritChange[]>("data/gerrit.json"),
    staleTime: 5 * 60 * 1000,
  });
};

export const useGitlabData = () => {
  return useQuery<GitlabMR[]>({
    queryKey: ["gitlab-raw"],
    queryFn: () => fetchJSON<GitlabMR[]>("data/gitlab.json"),
    staleTime: 5 * 60 * 1000,
  });
};

export const useWikimediaData = () => {
  return useQuery<WikimediaEdit[]>({
    queryKey: ["wikimedia-raw"],
    queryFn: () => fetchJSON<WikimediaEdit[]>("data/wikimedia.json"),
    staleTime: 5 * 60 * 1000,
  });
};

export const usePhabricatorData = () => {
  return useQuery<PhabricatorTask[]>({
    queryKey: ["phabricator-raw"],
    queryFn: () => fetchJSON<PhabricatorTask[]>("data/phabricator.json"),
    staleTime: 5 * 60 * 1000,
  });
};

export const useJournalEntry = (date: string | null | undefined) => {
  return useQuery<string>({
    queryKey: ["journal-entry", date],
    queryFn: async () => {
      if (!date) return "";
      const response = await fetch(`data/journal/${date}.md`);
      if (response.status === 404) {
        return `*No learning journal entry recorded for ${date}.*`;
      }
      if (!response.ok) {
        throw new Error(`Failed to fetch journal entry for ${date}`);
      }
      return response.text();
    },
    enabled: !!date,
    staleTime: 5 * 60 * 1000,
  });
};
