// src/db.js
import Dexie from 'dexie';

const dbVersion = 7.2;

// Initialize the database with the exams store
const db = new Dexie('examAppDB');

db.version(dbVersion).stores({

    subjects: '++id, subjectName, examTableId',
    exams: '++id, className, stream, examID, subjectName, openingDate, closingDate, durationMINS', // will save only exams for a particular class and stream a student belongs to. Will return all the exams if user is an admin
    results: '++id, examID, resultsID, subjectName, dateTime, marks, finalPossibleMarks, durationMINS', // will only save past results for a student
    examAnswers: '++id, studID,	studInfo, subject, marks, dateTime, results, totalPossibleMarks', // Student's exam answers'.If user is admin, all student results are retur    ned
    students: "++id, userId, studName, firstName, lastName, otherName, gender, email, class, stream, userType, label, Results, accountCreationDate", //List of all students if user is admin, else will contain only a single data entry for the student
    classes: "++id, classID, streams",
    schoolData: "++id, schoolID, educationLevel, shollName, address, email, phone1, phone2, accountCreationDate",
    appwriteData: "++id, endpoint, project_Id, database_id, studentTable_id, studentMarksTable_id,subjectsTable_id, examsTable_id, classesTable_id",

});

export default db;
