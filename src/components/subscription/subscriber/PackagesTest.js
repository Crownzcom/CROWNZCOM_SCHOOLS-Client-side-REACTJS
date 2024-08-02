import React, { useState } from 'react';
import { Card, Button, Container, Row, Col, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGem } from '@fortawesome/free-solid-svg-icons';
// import moment from 'moment';
import moment from 'moment-timezone';
import PaymentMethods from './PaymentMethods_2';
import './Packages.css';
// import OrderSummery2 from './OrderSummery2'

const Packages = ({ studentInfo }) => {
    const [showModal, setShowModal] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState(null);

    // Calculate the date 30 days from now
    const currentDatePlus30Days = moment().add(30, 'days').tz('Africa/Nairobi').format('YYYY-MM-DD HH:mm:ss.SSS');

    // Convert to a Date object
    const expiryDate = moment.tz(currentDatePlus30Days, 'YYYY-MM-DD HH:mm:ss.SSS', 'Africa/Nairobi').toDate();

    console.log(`Expiry date: ${expiryDate}`);



    const calculateDaysLeft = (endDate) => {
        // Parse the end date
        const endMoment = moment.tz(endDate, 'YYYY-MM-DDTHH:mm:ss.SSSZ', 'Africa/Nairobi');

        // Get the current date in the same timezone
        const currentMoment = moment.tz('Africa/Nairobi');

        // Calculate the difference in days
        const daysLeft = endMoment.diff(currentMoment, 'days');

        console.log('Days left:', daysLeft);

        return daysLeft;
    }

    const packages = [
        {
            tier: 'Starter Pack',
            points: 1000,
            price: 20000,
            staticDate: false,
            // quizzes: 17,
            duration: 30,
            expiryDate: expiryDate,
            features: [
                // '340 points',
                // `Attempt up to 17 exams`,
                'Valid for 30 days',
            ],
        },
        {
            tier: 'Limited Pack',
            points: 1000,
            price: 70000,
            staticDate: true,
            duration: calculateDaysLeft('2024-12-31T23:59:59.999+03:00'),
            expiryDate: moment('2024-12-31T23:59:59.999+03:00').toISOString(),
            features: [
                'Valid until 31st December, 2024',
            ],
        },
        {
            tier: 'Annual Pack',
            points: 10000,
            price: 100000,
            staticDate: false,
            // quizzes: 'unlimited',
            duration: 366,
            expiryDate: moment().tz('Africa/Nairobi').add(366, 'days').toDate(),
            features: [
                // `Attempt up unlimited exams`,
                'Valid for a year - 366 Days',
            ],
        },
    ];

    const handlePurchaseClick = (selectedPkg) => {
        setSelectedPackage(selectedPkg);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    return (
        <div className="justify-content-center"
            style={{ backgroundColor: 'hsl(240, 78%, 98%)' }}
        >
            <Row className="justify-content-md-center">
                <h2 className="text-center" style={{ paddingTop: '30px' }}>Choose Your Package</h2>
                <div className="packages-container">
                    {packages.map((pkg, idx) => (
                        <Col key={idx} md={3} className="mb-3">
                            <Card
                                key={pkg.name}
                                className={`text-center package-card ${idx === 1 ? "middle-card" : ""}`}
                            >
                                <Card.Body className="card-body">
                                    <Card.Title
                                        className="package-tier"
                                        style={{
                                            color: `${idx === 1 ? 'white' : ''}`
                                        }}
                                    >
                                        {pkg.tier}
                                    </Card.Title>
                                    <Card.Text
                                        className="package-price"
                                        style={{
                                            color: `${idx === 1 ? 'white' : ''}`
                                        }}
                                    >
                                        UGX.{pkg.price}
                                    </Card.Text>
                                    <ul className="package-features">
                                        {pkg.features.map((feature, featureIdx) => (
                                            <li key={featureIdx} className="feature-item">
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                    <Button
                                        variant='outline-primary'
                                        className={`package-learn-more ${idx === 1 ? ' middle-button' : ''}`}
                                        onClick={() => handlePurchaseClick(pkg)}
                                    >
                                        Select Pack
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </div>
            </Row>

            {/* Modal for PaymentMethods */}
            <Modal
                show={showModal}
                onHide={handleCloseModal}
                size="lg"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Complete Your Purchase</Modal.Title>
                </Modal.Header>
                <Modal.Body >
                    {selectedPackage && (
                        <>
                            <PaymentMethods
                                price={selectedPackage.price}
                                points={selectedPackage.points}
                                tier={selectedPackage.tier}
                                paymentFor={'points'}
                                studentInfo={studentInfo}
                                duration={selectedPackage.duration}
                                expiryDate={selectedPackage.expiryDate}
                                staticDate={selectedPackage.staticDate}
                            />
                        </>

                    )}
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default Packages;
