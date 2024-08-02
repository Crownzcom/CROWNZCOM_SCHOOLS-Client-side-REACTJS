import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { Container, Row, Col, ButtonGroup, Button, Form, Alert, Card, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMobileAlt, faCreditCard } from '@fortawesome/free-solid-svg-icons';
import {
    databases,
    database_id,
    Query,
    ID
} from "../../../appwriteConfig.js";
import 'bootstrap/dist/css/bootstrap.min.css';
import { serverUrl } from '../../../config.js'
// import OrderSummery2 from './OrderSummery2';

import './PaymentMethods.css';

function PaymentMethods({ initialCoupon, price, paymentFor, tier, expiryDate, staticDate }) {

    const schoolInfo = {}
    const schoolId = '1234'

    const navigate = useNavigate();
    const originalPrice = price;

    const [stage, setStage] = useState('coupon'); // 'coupon', 'summary', or 'payment'
    const [coupon, setCoupon] = useState(initialCoupon || '');
    const [discountInfo, setDiscountInfo] = useState(null);
    const [couponError, setCouponError] = useState('');
    const [couponLoader, setCouponLoader] = useState(false)
    const finalPrice = price
    const [paymentMadeFor, setPaymentMadeFor] = useState(paymentFor)
    const [loader, setLoader] = useState(false);
    const handleApplyCoupon = async () => {
        try {
            // Make an API call to validate the coupon
            setCouponLoader(true);
            const response = await fetch(`${serverUrl}/query/validate-coupon?code=${coupon}&schoolId=${schoolId}`);
            const data = response.json();

            if (response.ok && data.couponDetails) {
                setDiscountInfo(data.couponDetails); // Set discount info from response
                setCouponError('');
            } else {
                // Reset discount info and final price to original when the coupon is invalid
                setDiscountInfo(null);
                // setFinalPrice(originalPrice);
                finalPrice = price;
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
        if (!discountInfo) return originalPrice;
        const discountValue = parseFloat(discountInfo.DiscountValue);
        switch (discountInfo.DiscountType) {
            case 'fixed':
                return Math.max(originalPrice - discountValue, 0);
            case 'percentage':
                return originalPrice * (1 - discountValue / 100);
            case 'points':

                return originalPrice
            default:
                return originalPrice; // No discount applied
        }
    };

    // Update the final price when discountInfo changes
    useEffect(() => {
        finalPrice = calculatePrice();
    }, [discountInfo]);

    const handleNext = async () => {
        console.log('Fianle Price: ', finalPrice);
        if (stage === 'coupon' && finalPrice > 0) {
            setStage('payment');
        }
        if (finalPrice === 0) {
            try {
                setLoader(true);
                console.log('Student Information: ' + JSON.stringify(schoolInfo))
                var currentDateTime = moment().format('MMMM Do YYYY, h:mm:ss a');
                console.log('Static date set: ', staticDate)
                let data = {
                    staticDate: staticDate,
                    created_at: currentDateTime,
                    paymentFor: paymentMadeFor,
                    transactionID: 'DISCOUNT-0000',
                    userId: schoolInfo.userId,
                    educationLevel: schoolInfo.educationLevel,
                    expiryDate: expiryDate ? expiryDate : null,
                    message: `Subscribed on discount.`
                }

                //UPDATE subscription code and transaction table
                try {
                    //Code here ...
                } catch (err) {
                    console.error('Failed to updated subscription code or transaction table: ', err);
                }
            } catch (err) {
                console.error('Failed to top-up points: ', err);
            } finally {
                setLoader(false);
                navigate(-1)
            }
        }
    };

    const handlePaymentSelection = (method, network) => {
        console.log('Fianle Price: ', finalPrice);
        navigate(`/payment/${method.toLowerCase()}`, { state: { price: finalPrice, paymentFor: paymentMadeFor, schoolInfo: schoolInfo, network: network } });
    };

    return (
        <div>
            {/* Stage 1: Order Summery and Apply Coupon */}
            {stage === 'coupon' && (
                <Row className="justify-content-md-center order-summary">
                    <Col md={8} lg={9} className='justify-content-md-center'>
                        <Card className="content-center" >
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
                                        {
                                            !couponLoader ? <Button
                                                className=''
                                                size='sm'
                                                variant="outline-primary" onClick={handleApplyCoupon}>Apply</Button> :
                                                <>
                                                    <Spinner animation="grow" variant="primary" />
                                                    <Spinner animation="grow" variant="secondary" />
                                                    <Spinner animation="grow" variant="success" />
                                                </>
                                        }
                                    </Form.Group>
                                    {couponError && <Alert variant="danger">{couponError}</Alert>}
                                </Form>
                                <div>
                                    <p>Original Price: UGX. {originalPrice}</p>
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

            {/* Stage 2: Select Payment Method */}
            {stage === 'payment' && (
                <Row className="justify-content-center my-5">
                    <h2 className="text-center mb-4 w-100">Select Payment Method</h2>

                    {/* MTN-MoMo */}
                    {/* <Col lg={4} className="d-flex justify-content-center">
                        <Card border="warning" className={`text-center package-card shadow-lg`} style={{ width: '18rem' }} onClick={() => handlePaymentSelection('mtn-momo', 'MTN')}>
                            <Card.Header style={{ backgroundColor: 'orange', color: 'white' }}>
                                MTN Mobile Money
                            </Card.Header>
                            <Card.Body className="justify-content-center">
                                <Card.Img variant="top" src={`img/images/mtnmomo.png`} className="card-img-centered" />
                            </Card.Body>
                        </Card>
                    </Col> */}

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
                        {/* <Card border="danger" className={`text-center package-card shadow-lg`} style={{ width: '18rem' }} onClick={() => handlePaymentSelection('airtel-money', 'AIRTEL')}> */}
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
                    <Button className='btn-cancel' variant="dark" onClick={() => navigate('/')}>
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