import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Dashboard } from "./pages/Dashboard";
import { Timeline } from "./pages/Timeline";
import { ContributionDetail } from "./pages/ContributionDetail";
import { PlatformSection } from "./pages/PlatformSection";
import { LearningJournal } from "./pages/LearningJournal";
import { Reviewers } from "./pages/Reviewers";
import { ReviewerDetail } from "./pages/ReviewerDetail";
import { Analytics } from "./pages/Analytics";
import { Achievements } from "./pages/Achievements";
import { Resume } from "./pages/Resume";
import { Admin } from "./pages/Admin";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/timeline" element={<Timeline />} />
            <Route path="/contributions" element={<Dashboard />} /> {/* Fallback database view */}
            <Route path="/contributions/:id" element={<ContributionDetail />} />
            <Route path="/platforms/:platform" element={<PlatformSection />} />
            <Route path="/journal" element={<LearningJournal />} />
            <Route path="/reviewers" element={<Reviewers />} />
            <Route path="/reviewers/:name" element={<ReviewerDetail />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/resume" element={<Resume />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
