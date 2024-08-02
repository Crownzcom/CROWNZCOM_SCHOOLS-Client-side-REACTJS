import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Button, Row, Col, Modal, Container, Alert } from 'react-bootstrap';
import moment from 'moment-timezone';
import PaymentMethods from './PaymentMethods';
import { serverUrl } from '../../../config';
import './Packages.css';

const Packages = () => {
    const [showModal, setShowModal] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [packages, setPackages] = useState([]);
    const cacheKey = 'packagesCache';
    const cacheDuration = 60; // Cache duration in milliseconds (e.g., 1 hour [60 * 60 * 1000])

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                const cachedData = localStorage.getItem(cacheKey);
                const cacheTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);

                if (cachedData && cacheTimestamp) {
                    const age = Date.now() - parseInt(cacheTimestamp, 10);
                    if (age < cacheDuration) {
                        setPackages(JSON.parse(cachedData));
                        return;
                    }
                }

                const response = await axios.get(`${serverUrl}/subscription/packages/return-packages`);
                const packagesData = response.data.map(pkg => ({
                    ...pkg,
                    expiryDate: pkg.staticDate
                        ? moment(pkg.expiryDate).toISOString()
                        : moment().tz('Africa/Nairobi').add(pkg.duration, 'days').toDate()
                }));

                setPackages(packagesData);
                localStorage.setItem(cacheKey, JSON.stringify(packagesData));
                localStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());
            } catch (error) {
                console.error('Error fetching packages:', error);
            }
        };

        fetchPackages();
    }, []);

    const handlePurchaseClick = (selectedPkg) => {
        setSelectedPackage(selectedPkg);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    return (
        <Container className="packages-container">
            <h2 className="text-center my-4">Choose Your Package</h2>
            {

                packages.length === 0 ? <Alert variant='primary'>No Subscription Packages Currently Available</Alert>
                    :

                    <Row className="justify-content-center">
                        {packages.map((pkg, idx) => (
                            <Col key={idx} md={4} className="mb-4">
                                <Card className={`package-card ${idx === 1 ? "highlight-card" : ""}`}>
                                    <Card.Body>
                                        <Card.Title className="package-tier">{pkg.tier}</Card.Title>
                                        <Card.Text className="package-price">UGX {pkg.price.toLocaleString()}</Card.Text>
                                        <ul className="package-features">
                                            {pkg.features.map((feature, featureIdx) => (
                                                <li key={featureIdx}>{feature}</li>
                                            ))}
                                        </ul>
                                        <Button
                                            variant="primary"
                                            onClick={() => handlePurchaseClick(pkg)}
                                        >
                                            Select Pack
                                        </Button>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
            }

            <Modal
                show={showModal}
                onHide={handleCloseModal}
                backdrop="static"
                size="lg"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Complete Your Purchase</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedPackage && (
                        <PaymentMethods
                            price={selectedPackage.price}
                            tier={selectedPackage.tier}
                            paymentFor={'exam-subscription'}
                            duration={selectedPackage.duration}
                            expiryDate={selectedPackage.expiryDate}
                            staticDate={selectedPackage.staticDate}
                        />
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Cancel
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Packages;
