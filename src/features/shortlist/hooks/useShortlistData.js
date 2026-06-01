import { useState, useEffect, useMemo } from "react";
import { fetchShortlistForJob } from "../services/shortlist.service";
import { useParams } from "react-router-dom";

export const useShortlistData = (jobs) => {
  const [selectedJobId, setSelectedJobId] = useState("");
  const [shortlistEntries, setShortlistEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCandidateIds, setSelectedCandidateIds] = useState([]);
  const params = useParams()
  // Initialize selected job to the first active job if not set
  useEffect(() => {
    if (jobs && jobs.length > 0 && !selectedJobId) {
      setSelectedJobId(jobs[0].id);
    }
  }, [jobs, selectedJobId]);

  useEffect(() => {
    if (params.jobId) {
      setSelectedJobId(() => params.jobId)
    }
  }, [params])


  // Fetch shortlist when selected job changes
  useEffect(() => {
    const loadShortlist = async () => {
      if (!selectedJobId) return;
      setLoading(true);
      try {
        const data = await fetchShortlistForJob(selectedJobId);
        setShortlistEntries(data || []);

        // Auto-select the top 2 candidates for comparison by default
        if (data && data.length > 0) {
          setSelectedCandidateIds(data.slice(0, 2).map(e => e.applications.id));
        } else {
          setSelectedCandidateIds([]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadShortlist();
  }, [selectedJobId]);

  const selectedJob = jobs?.find(j => j.id === selectedJobId);

  // Toggle selection for comparison
  const handleToggleSelect = (applicationId) => {
    setSelectedCandidateIds(prev => {
      if (prev.includes(applicationId)) {
        return prev.filter(id => id !== applicationId);
      }
      // Limit to max 4 comparisons for UI sanity
      if (prev.length >= 4) {
        return [...prev.slice(1), applicationId];
      }
      return [...prev, applicationId];
    });
  };

  // Compute the selected candidates objects in the order of selectedCandidateIds
  const selectedCandidates = useMemo(() => {
    if (!shortlistEntries.length) return [];

    return selectedCandidateIds
      .map(id => shortlistEntries.find(entry => entry.applications.id === id)?.applications)
      .filter(Boolean); // filter out undefined if somehow mismatched
  }, [selectedCandidateIds, shortlistEntries]);

  // Handle reordering from drag and drop
  const handleReorder = (reorderedCandidates) => {
    setSelectedCandidateIds(reorderedCandidates.map(c => c.id));
  };

  return {
    selectedJobId,
    setSelectedJobId,
    selectedJob,
    shortlistEntries,
    loading,
    selectedCandidateIds,
    handleToggleSelect,
    selectedCandidates,
    handleReorder
  };
};
