import React from 'react';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();

    const subscribe = () => {
        navigate('/subscribe')
    }

    const addPackage = () => {
        navigate('/mgt/subscribe/add-package')
    }

    return (
        <>
            <div style={styles.container}>
                <h1 style={styles.title}>Welcome to My Application</h1>
                <p style={styles.description}>
                    This is the home page of my awesome application built with ReactJS.
                </p>
                <Button onClick={subscribe}>Subscribe</Button>

                <Button variant='secondary' onClick={addPackage}>Add Package</Button>
            </div>
        </>
    );
};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f0f0f0',
        textAlign: 'center',
        padding: '20px',
    },
    title: {
        fontSize: '2.5em',
        color: '#333',
        marginBottom: '20px',
    },
    description: {
        fontSize: '1.2em',
        color: '#666',
    },
};

export default Home;
