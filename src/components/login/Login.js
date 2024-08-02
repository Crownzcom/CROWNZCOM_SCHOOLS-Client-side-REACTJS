import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom"; // Use Link from react-router-dom for navigation
import { Form, Button, Container, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from "../../context/AuthContext.js";
import { fetchAndUpdateResults } from "../../utilities/resultsUtil";
import { fetchAndProcessStudentData, initiateIndexDB, fetchSetExams, updateSubjectsData, updateClassData, updateResultsData } from "../../utilities/fetchStudentData";
import storageUtil from '../../utilities/storageUtil.js';
import db from '../../db.js';
import { clearAllTables, fetchAppWriteData } from './utils.js'
import {
    account
} from "../../appwriteConfig.js";
import { serverUrl } from "../../config.js"

const Login = () => {
    const { handleLogin } = useAuth();
    const navigate = useNavigate();

    const [emailError, setEmailError] = useState('')
    const [userType, setUserType] = useState('');
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [emailLoginLoader, setEmailLoginLoader] = useState(false);

    //LOGOUT FUNCTION

    const handleLogout = async () => {
        let sessionInfo = storageUtil.getItem("sessionInfo");
        if (sessionInfo && sessionInfo.$id) {
            try {
                const response = await account.deleteSession(sessionInfo.$id); // Clears the session on Client's and Appwrite's side
                // console.log('session deleted: ', response);
                // Clear rest of stored data
                sessionInfo = storageUtil.getItem("sessionInfo");
                localStorage.clear();
                // console.log('session cleared: ', sessionInfo);
            } catch (error) {
                console.error("Logout failed", error);
            }
        } else {
            console.error("No session to logout");
        }

        // Clear userPoints from context and storage
        storageUtil.removeItem("userPoints");

        // Clear all tables in IndexedDB
        try {
            await clearAllTables();
        } catch (error) {
            console.error("Error clearing all tables:", error);
        }

        // Clear rest of stored data
        storageUtil.clear();

        // Clear session storage
        sessionStorage.clear();
    };

    // Logout user in case they are already logged in on component mount
    useEffect(() => {

        //Clear session data
        const clearSession = async () => {
            await handleLogout();
            localStorage.clear();
        };

        clearSession();

        // Clear session storage
        sessionStorage.clear();
    }, []);

    // Fetch new appwrite data
    useEffect(() => {
        fetchAppWriteData();
    }, []);

    const handleUserLogin = async (e) => {
        e.preventDefault();
        setError('')
        setEmailError('')
        if (!userType || !userId || !password) {
            setError('Please fill in all fields');
            return;
        }

        try {
            const response = await fetch("http://localhost:3001/login/getEmail", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId, userType })
            });

            if (!response.ok) {
                console.error('Network response was not ok');
                throw new Error('Network response was not ok');
            }

            const data = response.json();
            console.log('Fetching Email Response: ', data);
            setEmail(data.email);

            // Complete the login process with the email address
            await completeLogin(data.email, password, data.userInfo)

        } catch (error) {
            console.error('Failed to fetch email address', error);
            setError('Failed to fetch email address', error);
        }
    };

    const completeLogin = async (email, password, userInfo) => {
        // Reset error messages
        setEmailError("");

        let userDetails = null

        try {
            setEmailLoginLoader(true);

            console.log('Setting up email session. email: ', email, ' passwords: ', password);
            const sessionData = await account.createEmailPasswordSession(email, password);
            console.log('Email session created: ', sessionData);

            userDetails = userInfo
            console.log('user info: ', userInfo)

            console.log('AuthContext Handling Login Session')
            await handleLogin(sessionData, userInfo); // Pass the session data to App.js

            // //Save data to indexDb
            // await initiateIndexDB(userInfo)

            if (userInfo.userType === "student") {
                //Fetch student(s) results
                console.log("Fetching student updated results");
                await updateResultsData(userInfo.userID)
                await fetchAndUpdateResults(userInfo.userID);

            }

            //Check if admin and fetch the required data
            if (userInfo.userType === "admin") {
                try {
                    console.log("Is admin");
                    //FETCH ALL STUDENTS DATA -STORE IN INDEXDB
                    await initiateIndexDB(userInfo);

                } catch (e) { console.error('Failed to retrieve student data', e); }
            }

            //Fetch exam data
            const setExamsSaved = await fetchSetExams(userInfo)
            if (setExamsSaved) {
                console.log('Exams set: ', setExamsSaved)
            }

            //Fetch Subjects data
            await updateSubjectsData();

            //Update classes data
            await updateClassData();

            // Redirect to home page
            console.log('Successfully logged in');
            window.location.href = '/';
            // navigate("/");

        } catch (error) {
            console.error("Login failed:", error.message);
            setEmailError(error.message);
            // TODO: Handle errors such as showing an error message to the user
        } finally {
            setEmailLoginLoader(false);
        }
    };

    return (
        <Container>
            <Row className="justify-content-md-center">
                <Col md={6}>
                    <h3 className="text-center">Login</h3>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form onSubmit={handleUserLogin}>
                        <Form.Group controlId="userType">
                            <Form.Label>User Type</Form.Label>
                            <Form.Control
                                as="select"
                                value={userType}
                                onChange={(e) => setUserType(e.target.value)}
                            >
                                <option value="">Select user type</option>
                                <option value="admin">Admin</option>
                                <option value="student">Student</option>
                            </Form.Control>
                        </Form.Group>
                        <Form.Group controlId="userId">
                            <Form.Label>User ID</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter user ID"
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group controlId="password">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </Form.Group>
                        {
                            emailError && (
                                <Alert variant="danger">{emailError}</Alert>
                            )
                        }
                        <Button variant="primary" type="submit" className="w-100 mt-3">
                            {
                                emailLoginLoader ?
                                    (
                                        <Spinner as="span" animation="border" size="sm" />
                                    )
                                    :
                                    (
                                        <>
                                            <FontAwesomeIcon icon={faLock} />
                                            Login
                                        </>
                                    )
                            }
                        </Button>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
};

export default Login;
