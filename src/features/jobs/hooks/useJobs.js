import { useState, useEffect } from "react";
import { addJob, fetchAllJobs } from "../services/jobs.service";

export const useJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllJobs();
      setJobs(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createJob = async (job) => {
    try {
      const newJob = await addJob(job);
      return newJob; // returns { id, ...jobData }
    } catch (error) {
      console.log(error.message);
      throw error;
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  return {
    jobs,
    loading,
    error,
    createJob,
    reload: loadJobs,
  };
};
