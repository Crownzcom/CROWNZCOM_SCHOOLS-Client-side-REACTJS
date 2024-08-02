//This component is only meant to run after a transaction is made for ONLY FLUTTERWAVE transactions
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Button, Container, Spinner, Alert, ListGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle, faWarning } from '@fortawesome/free-solid-svg-icons';
import { formatDate } from "../../../utilities/otherUtils.js"
import { saveTransactionData } from '../utils.js'
import './PaymentResult.css'; // Path to your custom CSS file
import { serverUrl } from '../../../config.js';

const PaymentResult = () => {
    const navigate = useNavigate();
    const location = useLocation();

    //Extract response from url
    const queryParams = new URLSearchParams(location.search);

    const [transactionData, setTransactionData] = useState({});
    const [paymentStatus, setPaymentStatus] = useState('Verifying...');
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(true);

    const [subscriptionCode, setSubscriptionCode] = useState('')
    const [subCodeExpiry, setSubCodeExpiry] = useState('')
    const [subCodeNoOfStudents, setSubCodeNoOfStudents] = useState(null)

    const transactionId = queryParams.get('transaction_id') || parseTransactionIdFromResp(queryParams.get('resp'));
    const statusForPayment = queryParams.get('status');
    const tx_ref = queryParams.get('tx_ref');
    const statusMessage = parseMessageFromResp(queryParams.get('resp'))

    useEffect(() => {
        const verifyPayment = async () => {
            setMessage(statusMessage)
            setPaymentStatus(statusForPayment);

            // console.log('Verifying payment status: ', statusForPayment);
            if (statusForPayment === 'cancelled') {
                setMessage('Transaction cancelled')
                setPaymentStatus('Transaction is canceled.');
                setLoading(false);
            }
            else if (transactionId) {
                try {

                    const response = await fetch(`${serverUrl}/subscription/flw/verify-payment/${transactionId}`);
                    const data = await response.json();

                    console.log('Verified Data from Flutterwave: ', data);

                    //Saving to database
                    try {
                        setMessage('Payment Successful!');

                        const subCodeResp = await saveTransactionData(data.transactionData);

                        setSubscriptionCode(subCodeResp)

                        setSubCodeNoOfStudents(parseInt(data.transactionData.meta.numberOfStudents))
                        setSubCodeExpiry(data.transactionData.meta.expiryDate)

                    } catch (err) {
                        console.error(err);
                    }

                    setPaymentStatus(data.status);

                    //Checking for coupon usage and update
                    if (data.transactionData.meta.couponCode !== undefined || data.transactionData.meta.couponCode !== null) {
                        try {
                            const couponCode = data.transactionData.meta.couponCode
                            console.log('FLW-Coupon--UPDATE');
                        } catch (e) { console.error('Failed to update coupon table:', e) }
                    } else {
                        // console.log('No coupon provided');
                    }

                    try {
                        // Data to send to receipt
                        const receiptData = {
                            tx_ref: data.transactionData.tx_ref,
                            id: data.transactionData.id,
                            charged_amount: data.transactionData.amount,
                            currency: data.transactionData.currency,
                            payment_type: data.transactionData.payment_type,
                            name: data.transactionData.customer.name,
                            email: data.transactionData.customer.email,
                            phone: data.transactionData.customer.phone_number,
                            created_at: data.transactionData.customer.created_at,
                            card: data.transactionData.card || {},
                            description: data.transactionData.meta.description,
                            paymentFor: data.transactionData.meta.service,
                            duration: data.transactionData.meta.duration,

                            //RECEIPT DATA
                            addressSender: {
                                person: "Crownzcom LTD",
                                building: "101, Block C, Swan Residency",
                                street: "Heritage Road, Kireka",
                                city: "Kampala, Uganda",
                                email: "crownzom@gmail.com",
                                phone: "+123-456-7890"
                            },
                            address: {
                                company: `${data.transactionData.schoolName}`,
                                person: `${data.transactionData.name}`,
                                street: `${data.transactionData.address}`,
                                city: "",
                            },
                            personalInfo: {
                                website: '',
                                bank: {
                                    person: "Crownzcom LTD",
                                    name: "Flutterwave Inc.",
                                    paymentMethod: `${data.transactionData.payment_type}`,
                                    cardOrPhoneNumber: `${data.transactionData.payment_type === 'card' ? '****' + data.transactionData.card.last_4digits : data.transactionData.customer.phone_number}`,
                                    IBAN: `-`
                                },
                                taxoffice: {
                                    name: '',
                                    number: ''
                                }
                            },
                            label: {
                                invoicenumber: `Transaction Number`,
                                invoice: `Receipt`,
                                tableItems: "Item",
                                tableDescription: "Description",
                                tableQty: "Qty",
                                tableSinglePrice: "Unit Price",
                                tableSingleTotal: "Total Price",
                                totalGrand: "Grand Total",
                                contact: "Contact Information",
                                bank: "Payment Gateway Information",
                                taxinfo: "TAX Information"
                            },
                            invoice: {
                                number: `${data.transactionData.id}`,
                                date: `${data.transactionData.customer.created_at}`,
                                subject: "Exam Prep Tutor Payment Transaction",
                                total: `${data.transactionData.currency}. ${data.transactionData.amount}`,
                                text: "Payment rendered in March 2024."
                            },
                            items: {
                                1: {
                                    title: "Examination",
                                    description: `Payment transaction made by ${data.transactionData.customer.schoolName}`,
                                    amount: `${data.transactionData.currency}. ${data.transactionData.amount}`,
                                    qty: `${data.transactionData.meta.numberOfStudents}`,
                                    total: `${data.transactionData.currency}. ${data.transactionData.amount}`,
                                }
                            }
                        }

                        setTransactionData(receiptData);

                    }
                    catch (e) {
                        console.error("error in recepit ..", e)
                        setMessage('Failed to generate receipt')
                    }

                } catch (error) {
                    setMessage(statusMessage)
                    console.error('Verification failed. Please contact support.... ', error)
                    setPaymentStatus('Verification failed. Please contact support.');
                } finally {
                    setLoading(false);
                }
            } else {
                setMessage(statusMessage)
                setPaymentStatus('Transaction Failed.');
                setLoading(false);
            }
        };

        verifyPayment();
    }, []);

    // Function to parse and extract transactionId from 'resp'
    function parseTransactionIdFromResp(resp) {
        if (!resp) return null;
        try {
            const decodedResp = JSON.parse(decodeURIComponent(resp));
            return decodedResp?.data?.id || null;
        } catch (error) {
            console.error('Error parsing resp:', error);
            return null;
        }
    }

    // Function to parse and extract message from 'resp'
    function parseMessageFromResp(resp) {
        if (!resp) return null;
        try {
            const decodedResp = JSON.parse(decodeURIComponent(resp));
            // console.log('message respo: ', decodedResp)
            return JSON.stringify(decodedResp?.message) || null;
        } catch (error) {
            console.error('Error parsing resp:', error);
            return null;
        }
    }

    const exitPage = () => {
        navigate(`/subscribe`);
    };

    return (
        <Container className="mt-4" style={{ backgroundColor: ' background-color: hsl(236, 72%, 79%), hsl(237, 63%, 64%)' }}>
            <Row className="justify-content-center">
                <Col md={6}>
                    <Card className="shadow">
                        <Card.Header className="payment-card-header">
                            <Card.Title className="text-center mb-4">Exam Prep Tutor Online Payment</Card.Title>
                            <Card.Text className="text-center">
                                Transaction Verification Status.
                            </Card.Text>
                        </Card.Header>
                        <Card.Body>
                            {
                                loading ? (
                                    <div className="text-center">
                                        <Spinner animation="grow" variant="primary" className="sr-only" />
                                        <Spinner animation="grow" variant="secondary" className="sr-only" />
                                        <Spinner animation="grow" variant="success" className="sr-only" />
                                        <p className="sr-only">Loading...</p>
                                    </div>
                                )
                                    :
                                    <>

                                        {paymentStatus === "success" ? (
                                            <div className="text-center mt-4">
                                                <Alert className="text-left" variant='success'>
                                                    <FontAwesomeIcon icon={faCheckCircle} size="3x" className="text-success" />
                                                    <ListGroup.Item className="mt-2"><b>Payment Successful!</b></ListGroup.Item>
                                                    <ListGroup>
                                                        <ListGroup.Item className="mt-2"><b>Service:</b> Payment for exams</ListGroup.Item>
                                                        <ListGroup.Item className="mt-2"><b>Subscription Code:</b> {subscriptionCode}</ListGroup.Item>
                                                        <ListGroup.Item className="mt-2"><b>Date of Expiry:</b> {formatDate(subCodeExpiry)}</ListGroup.Item>
                                                        <ListGroup.Item className="mt-2"><b>Number of students eligible: </b> {subCodeNoOfStudents}</ListGroup.Item>
                                                        <ListGroup.Item className="mt-2"><b>Price:</b> {transactionData.currency + '. ' + transactionData.charged_amount}</ListGroup.Item>
                                                    </ListGroup>
                                                </Alert>
                                                <Button variant="dark" onClick={() => { }}>Print Receipt as PDF</Button>
                                            </div>
                                        ) :
                                            statusForPayment === "cancelled" ? (
                                                <div className="text-center mt-4">
                                                    <Alert variant='warning'>
                                                        <FontAwesomeIcon icon={faWarning} size="3x" className="text-danger" />
                                                        <p className="mt-2"><b>Transaction cancelled!</b></p>
                                                    </Alert>
                                                    <Button variant="dark" onClick={() => exitPage()}>Exit</Button>
                                                </div>
                                            ) : (
                                                <div className="text-center mt-4">
                                                    <Alert variant={paymentStatus === 'success' ? 'success' : '-primary'}>
                                                        <FontAwesomeIcon icon={faTimesCircle} size="3x" className='text-danger' />
                                                        <p className="mt-2"><b>{message}</b></p>
                                                        <p className="mt-2">
                                                            {paymentStatus}
                                                        </p>
                                                    </Alert>
                                                    <Button variant="dark" onClick={() => exitPage()}>Exit</Button>
                                                </div>
                                            )
                                        }
                                    </>
                            }
                        </Card.Body>
                        <Card.Footer>
                            <Button
                                variant="primary"
                                onClick={() => { navigate('/subscribe') }}
                                disabled={paymentStatus === "success" ? false : true}
                                hidden={paymentStatus === "success" ? false : true}
                                className="w-100 mt-3 payment-submit-btn"
                            >
                                Back To Dahsboard
                            </Button>
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default PaymentResult;
