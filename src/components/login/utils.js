import { serverUrl } from "../../config.js"
import db from '../../db'

/* Helper Funtions */

/* EXPORTED FUNCTIOMS */
//Clear selected IndexDB tables
export const clearAllTables = async () => {
    try {
        await db.transaction('rw', db.subjects, db.exams, db.examAnswers, db.students, db.classes, db.schoolData, async () => {
            await db.subjects.clear();
            await db.exams.clear();
            await db.examAnswers.clear();
            await db.students.clear();
            await db.classes.clear();
            await db.schoolData.clear();
        });
        console.log("All tables cleared successfully");
    } catch (error) {
        console.error("Error clearing all tables:", error);
    }
};



//Fetch appwrite data from server-side
export const fetchAppWriteData = async () => {
    try {
        const response = await fetch(`${serverUrl}/login/env`); // Make sure the URL matches your server's route
        if (!response.ok) {
            console.erro('Network response was not ok');
            throw new Error('Network response was not ok');
        }
        const data = response.json(); // Parse the JSON data
        console.log('from server: ', data);

        // Prepare data for IndexedDB
        const appwriteData = {
            endpoint: data.APPWRITE_ENDPOINT,
            project_Id: data.APPWRITE_PROJECT_ID,
            database_id: data.DATABASE_ID,
            studentTable_id: data.STUDENT_TABLE_ID,
            studentMarksTable_id: data.STUDENT_RESULTS_TABLE_ID,
            subjectsTable_id: data.SUBJECTS_TABLE_ID,
            examsTable_id: data.SET_EXAMS_TABLE_ID,
            classesTable_id: data.CLASSES_TABLE_ID
        };

        // Save to IndexedDB
        await db.appwriteData.clear(); // Clear any existing data (optional)
        await db.appwriteData.add(appwriteData);

        console.log('Appwrite data saved to IndexedDB:', appwriteData);
    } catch (error) {
        console.error('Error fetching AppWrite data:', error);
    }
};