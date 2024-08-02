import { useState, useEffect } from "react";
import {
  databases,
  database_id,
  studentTable_id,
  Query,
} from "../appwriteConfig";

const useLinkedStudents = (kinId) => {
  const [linkedStudents, setLinkedStudents] = useState([]);

  useEffect(() => {
    const fetchLinkedStudents = async () => {
      try {
        const response = await databases.listDocuments(
          database_id,
          studentTable_id,
          [Query.equal("kinID", [kinId])]
        );

        const students = response.documents;

        if (students.length > 0) {
          const formattedStudents = students.map((student) => ({
            studID: student.studID,
            Name: `${student.firstName} ${student.lastName}`,
            educationLevel: student.educationLevel,
          }));

          setLinkedStudents(formattedStudents);
        } else {
          setLinkedStudents([]);
        }
      } catch (error) {
        console.error("Error fetching linked students:", error);
      }
    };

    if (kinId) {
      fetchLinkedStudents();
    }
  }, [kinId]);

  return linkedStudents;
};

export default useLinkedStudents;
