import { useJobContext } from "../contexts/JobContext";

/** Get jobs that have an image file attached */
const useImageJobs = (albumId?: string) => {
  const { jobInfo } = useJobContext();
  const albumJobs = albumId
    ? Object.values(jobInfo).filter(
        (job) => job.albumId === albumId && !!job.file
      )
    : Object.values(jobInfo).filter((job) => !!job.file);

  return albumJobs;
};

export default useImageJobs;
