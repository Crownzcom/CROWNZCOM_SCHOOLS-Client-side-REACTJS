import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';
import { Row, Col, ButtonGroup, Button, Form, Alert, Card, Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { serverUrl } from '../../../config';

import './PaymentMethods.css';

function PaymentMethods({ initialCoupon, price, paymentFor, tier, expiryDate, staticDate, duration }) {
    const [stage, setStage] = useState('schoolId'); // 'schoolId', 'coupon', 'summary', or 'payment'
    const [schoolId, setSchoolId] = useState('');
    const [schoolInfo, setSchoolInfo] = useState({});
    const [schoolIdError, setSchoolIdError] = useState('');
    const [schoolIdLoader, setSchoolIdLoader] = useState(false);

    const [numberOfStudents, setNumberOfStudents] = useState(1);

    const navigate = useNavigate();
    const originalPrice = price;

    const [coupon, setCoupon] = useState(initialCoupon || '');
    const [discountInfo, setDiscountInfo] = useState(null);
    const [couponError, setCouponError] = useState('');
    const [couponLoader, setCouponLoader] = useState(false);
    const [loader, setLoader] = useState(false);
    const [paymentMadeFor, setPaymentMadeFor] = useState(paymentFor);
    const [finalPrice, setFinalPrice] = useState(price);

    const handleValidateSchoolId = async () => {
        try {
            setSchoolIdLoader(true);
            const response = await fetch(`${serverUrl}/school/info/retrieve?schoolID=${schoolId}`);
            const data = await response.json();
            console.log('school data: ', data);

            if (response.ok && data.valid) {
                setSchoolInfo(data.schoolDetails); // Set school info from response
                setSchoolIdError('');
                setStage('coupon'); // Move to the next stage
            } else {
                setSchoolInfo({});
                setSchoolIdError(data.message || 'The provided school ID does not exist');
            }
            setSchoolIdLoader(false);
        } catch (error) {
            console.error('Error validating school ID:', error);
            setSchoolIdError('Error validating school ID. Please try again.');
            setSchoolIdLoader(false);
        }
    };

    const handleApplyCoupon = async () => {
        try {
            setCouponLoader(true);
            const response = await fetch(`${serverUrl}/query/validate-coupon?code=${coupon}&schoolId=${schoolId}`);
            const data = response.json();

            if (response.ok && data.couponDetails) {
                setDiscountInfo(data.couponDetails); // Set discount info from response
                setCouponError('');
            } else {
                setDiscountInfo(null);
                setFinalPrice(originalPrice * numberOfStudents);
                setCouponError(data.message || 'Invalid coupon code');
            }
            setCouponLoader(false);
        } catch (error) {
            console.error('Error validating coupon:', error);
            setCouponError('Error validating coupon. Please try again.');
            setCouponLoader(false);
        }
    };

    const calculatePrice = () => {
        const basePrice = originalPrice * numberOfStudents;
        if (!discountInfo) return basePrice;
        const discountValue = parseFloat(discountInfo.DiscountValue);
        let discountedPrice;
        switch (discountInfo.DiscountType) {
            case 'fixed':
                discountedPrice = Math.max(basePrice - discountValue, 0);
                break;
            case 'percentage':
                discountedPrice = basePrice * (1 - discountValue / 100);
                break;
            case 'points':
                discountedPrice = basePrice;
                break;
            default:
                discountedPrice = basePrice; // No discount applied
        }
        return discountedPrice;
    };

    // Update the final price when discountInfo or numberOfStudents changes
    useEffect(() => {
        setFinalPrice(calculatePrice());
    }, [discountInfo, numberOfStudents]);

    const handleNext = async () => {
        if (stage === 'coupon' && finalPrice > 0) {
            setStage('payment');
        }
        if (finalPrice === 0) {
            try {
                setLoader(true);
                var currentDateTime = moment().format('MMMM Do YYYY, h:mm:ss a');
                let data = {
                    staticDate: staticDate,
                    schoolId: schoolId,
                    created_at: currentDateTime,
                    paymentFor: paymentMadeFor,
                    transactionID: 'DISCOUNT-0000',
                    userschoolInfoId: schoolInfo.id,
                    educationLevel: schoolInfo.educationLevel,
                    expiryDate: expiryDate ? expiryDate : moment().add(40, 'days').toDate().format('MMMM Do YYYY, h:mm:ss a'),
                    message: `Subscribed on discount.`
                };

                // UPDATE subscription code and transaction table
                try {
                    // Code here for generating subscription code ...
                } catch (err) {
                    console.error('Failed to update subscription code or transaction table: ', err);
                }
            } catch (err) {
                console.error('Failed to top-up points: ', err);
            } finally {
                setLoader(false);
                navigate(-1);
            }
        }
    };

    const handlePaymentSelection = (method, network) => {
        navigate(`/payment/${method.toLowerCase()}`, { state: { price: finalPrice, paymentFor: paymentMadeFor, schoolInfo: schoolInfo, network: network, numberOfStudents: numberOfStudents, duration: duration, expiryDate: expiryDate ?? moment().add(40, 'days').toDate().format('MMMM Do YYYY, h:mm:ss a') } });
    };

    return (
        <div>
            {/* Stage 1: Enter School ID */}
            {stage === 'schoolId' && (
                <Row className="justify-content-md-center">
                    <Col md={8} lg={6}>
                        <Card className="text-center">
                            <Card.Header as="h2">Enter School ID</Card.Header>
                            <Card.Body>
                                <Form>
                                    <Form.Group className="mb-3">
                                        <Form.Label>School ID</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={schoolId}
                                            onChange={(e) => setSchoolId(e.target.value)}
                                            placeholder="Enter school ID"
                                        />
                                        {schoolIdError && <Alert variant="danger">{schoolIdError}</Alert>}
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Number of Students</Form.Label>
                                        <Form.Control
                                            type="number"
                                            value={numberOfStudents}
                                            onChange={(e) => setNumberOfStudents(e.target.value)}
                                            placeholder="Enter number of students"
                                            min="1"
                                        />
                                    </Form.Group>
                                    {!schoolIdLoader ? (
                                        <Button variant="primary" onClick={handleValidateSchoolId}>Next</Button>
                                    ) : (
                                        <>
                                            <Spinner animation="grow" variant="primary" />
                                            <Spinner animation="grow" variant="secondary" />
                                            <Spinner animation="grow" variant="success" />
                                        </>
                                    )}
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}

            {/* Stage 2: Order Summary and Apply Coupon */}
            {stage === 'coupon' && (
                <Row className="justify-content-md-center order-summary">
                    <Col md={8} lg={9} className='justify-content-md-center'>
                        <Card className="content-center">
                            <Card.Header as="h2">Order Summary</Card.Header>
                            <Card.Body>
                                <Card.Text>
                                    You are about to subscribe.
                                    <br />
                                    <strong>Package:</strong> {tier}
                                    <br />
                                    <strong>Price: </strong>{finalPrice}
                                </Card.Text>
                                <Card.Title>Apply Coupon</Card.Title>
                                <Form>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Coupon/Token Code</Form.Label>
                                        <Form.Control type="text" value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="Enter coupon code" />
                                        {!couponLoader ? (
                                            <Button size="sm" variant="outline-primary" onClick={handleApplyCoupon}>Apply</Button>
                                        ) : (
                                            <>
                                                <Spinner animation="grow" variant="primary" />
                                                <Spinner animation="grow" variant="secondary" />
                                                <Spinner animation="grow" variant="success" />
                                            </>
                                        )}
                                    </Form.Group>
                                    {couponError && <Alert variant="danger">{couponError}</Alert>}
                                </Form>
                                <div>
                                    <p>Original Price: UGX. {originalPrice * numberOfStudents}</p>
                                    <p>Discount:
                                        {' '}
                                        {discountInfo && discountInfo.DiscountType === 'fixed' && 'UGX. '}
                                        {discountInfo ? discountInfo.DiscountValue : 0}
                                        {discountInfo && discountInfo.DiscountType === 'percentage' ? '%' : (discountInfo && discountInfo.DiscountType === 'points' ? 'points' : null)}
                                    </p>
                                    <p>Final Price: UGX. {finalPrice}</p>
                                </div>
                            </Card.Body>
                            <Card.Footer className="text-muted">
                            </Card.Footer>
                        </Card>
                    </Col>
                </Row>
            )}

            {/* Stage 3: Select Payment Method */}
            {stage === 'payment' && (
                <Row className="justify-content-center my-5">
                    <h2 className="text-center mb-4 w-100">Select Payment Method</h2>
                    {/* Flutterwave: MTN-MoMo */}
                    <Col lg={4} className="d-flex justify-content-center">
                        <Card border="warning" className={`text-center package-card shadow-lg`} style={{ width: '18rem' }} onClick={() => handlePaymentSelection('mobile-money', 'MTN')}>
                            <Card.Header style={{ backgroundColor: 'orange', color: 'white' }}>
                                MTN Mobile Money
                            </Card.Header>
                            <Card.Body className="justify-content-center">
                                <Card.Img variant="top" src={`img/images/mtnmomo.png`} className="card-img-centered" />
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Flutterwave: Airtel-MoMo */}
                    <Col lg={4} className="d-flex justify-content-center">
                        <Card border="danger" className={`text-center package-card shadow-lg`} style={{ width: '18rem' }} onClick={() => handlePaymentSelection('mobile-money', 'AIRTEL')}>
                            <Card.Header style={{ backgroundColor: 'red', color: 'white' }}>
                                Airtel Money
                            </Card.Header>
                            <Card.Body className="justify-content-center">
                                <Card.Img variant="top" src={`img/images/airtel-money.png`} className="card-img-centered" />
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Flutterwave: Card-MoMo */}
                    <Col lg={4} className="d-flex justify-content-center">
                        <Card border="info" className={`text-center package-card shadow-lg`} style={{ width: '18rem' }} onClick={() => handlePaymentSelection('card-payment', 'card')}>
                            <Card.Header style={{ backgroundColor: '#2a9d8f', color: 'white' }}>
                                Card
                            </Card.Header>
                            <Card.Body className="justify-content-center">
                                <Card.Img variant="top" src={`img/images/credit-card.png`} className="card-img-centered" />
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={8} style={{ paddingTop: '15px' }}>
                    </Col>
                </Row>
            )}

            <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                <ButtonGroup style={{ width: '75%' }}>
                    <Button className='btn-cancel' variant="dark" onClick={() => navigate('/subscribe')}>
                        Cancel
                    </Button>

                    {stage === 'payment' && (
                        <Button variant="secondary" onClick={() => setStage('coupon')}>Back to Order Summary</Button>
                    )}

                    {stage === 'coupon' && (
                        !loader ?
                            <Button variant="success" onClick={handleNext}>{finalPrice === 0 ? 'Complete Purchase' : 'Proceed to Payment'}</Button>
                            :
                            <Button variant="success" disabled>
                                <Spinner
                                    as="span"
                                    animation="grow"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                />
                                Processing...
                            </Button>
                    )}
                </ButtonGroup>
            </div>
        </div>
    );
}

export default PaymentMethods;
