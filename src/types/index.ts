import type { Contribution } from "../../schemas/contribution.schema";
import type { Reviewer, ReviewerFeedback } from "../../schemas/reviewer.schema";
import type { Achievement } from "../../schemas/achievement.schema";

export type { Contribution, Reviewer, ReviewerFeedback, Achievement };

export interface GithubPR {
  number: number;
  title: string;
  repository: string;
  state: string;
  merged: boolean;
  merged_at: string;
  created_at: string;
  html_url: string;
  reviewers: string[];
}

export interface GerritChange {
  change_id: string;
  number: number;
  project: string;
  subject: string;
  status: string;
  owner: string;
  created: string;
  updated: string;
  reviewers: string[];
}

export interface GitlabMR {
  iid: number;
  title: string;
  project: string;
  state: string;
  created_at: string;
  web_url: string;
  assignee: string;
  reviewers: string[];
}

export interface WikimediaEdit {
  revid: number;
  title: string;
  page: string;
  summary: string;
  timestamp: string;
  comment: string;
}

export interface PhabricatorTask {
  id: string;
  phid: string;
  name: string;
  status: string;
  uri: string;
  dateCreated: number;
  priority: string;
  projects: string[];
}
