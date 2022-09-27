import React from "react";
import { ParseDuplicate } from "../../../classes";

export interface DuplicatesNotificationDetailProps {
  /** The duplicate records in question */
  duplicates: ParseDuplicate[];
}

/** Component displaying actions for the user to take about a Duplicates notification */
const DuplicatesNotificationDetail = ({
  duplicates,
}: DuplicatesNotificationDetailProps) => {
  return (
    <>
      {duplicates.map((duplicate) => (
        <div>
          <span>{JSON.stringify(duplicate)}</span>
        </div>
      ))}
    </>
  );
};

export default DuplicatesNotificationDetail;
