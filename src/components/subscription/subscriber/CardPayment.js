import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Container, Form, Button, Alert, Spinner } from 'react-bootstrap';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid'; // UUID generation for unique identifiers
import { serverUrl, rootUrl } from '../../../config';
import './CardPayment.css'

function CardPayment({ propPrice, propPaymentFor, propStudentInfo }) {

    const navigate = useNavigate();
    const location = useLocation();
    let { price, paymentFor, schoolInfo, network, couponCode, duration, numberOfStudents, expiryDate } = location.state || { price: null, paymentFor: 'points', points: 0, schoolInfo: { id: '', name: '', educationLevel: '', address: '', phone: '', email: '' }, network: null, couponCode: null, duration: 366, numberOfStudents: 1, expiryDate: moment().format('MMMM Do YYYY, h:mm:ss a') }; // Set default

    useEffect(() => {
        // console.log('Price passed to MTN: ', price)
        if (!price) {
            navigate(-1);
        }
    }, []);

    // Extract the root URL (protocol + hostname + port)
    // var rootUrl = window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : '');

    const [phone, setPhone] = useState(schoolInfo.phone || '');
    const [email, setEmail] = useState(schoolInfo.email);
    const [name, setName] = useState(schoolInfo.name);
    const [phoneError, setPhoneError] = useState(false);
    const [amount, setAmount] = useState(price);
    const [paymentStatus, setPaymentStatus] = useState(null);
    const [message, setMessage] = useState('');
    const [submit, setSubmit] = useState(false);

    // Phone number validation function
    const validatePhoneNumber = (phoneNumber) => {
        return phoneNumber && !isValidPhoneNumber(phoneNumber);
    };

    const initiatePayment = async () => {
        try {
            const dataToSend = {
                tx_ref: `${uuidv4()}`,
                amount: amount,
                currency: 'UGX',
                redirect_url: `${rootUrl}/payment/verification`,
                payment_options: 'card',
                customer: {
                    email: email,
                    phonenumber: phone,
                    name: name
                },
                meta: {
                    price: price,
                    description: `Exam subscription for ${schoolInfo.name}`,
                    service: `${paymentFor}`,
                    couponCode: couponCode,
                    duration: `${duration}`,
                    numberOfStudents: `${numberOfStudents}`,
                    expiryDate: `${expiryDate}`,
                    ...({ schoolName: schoolInfo.name, schoolId: schoolInfo.id, educationLevel: schoolInfo.educationLevel }), // Conditional spread operator for adding school information
                },
                customizations: {
                    title: 'Crownzcom',
                    description: `Exam subscription ${schoolInfo.name}`,
                    logo: `${serverUrl}/images/logo.png`
                }
            }

            // console.log('Data to send to flutterwave: ', dataToSend)

            let response

            try {
                response = await fetch(`${serverUrl}/subscription/flw/card-payment`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(
                        dataToSend
                    ),
                });
            } catch (e) {
                // console.log('Error initiating flutterwave serverside: ', e.message);
            }

            const data = response.json();
            // console.log('Data: ', data)
            if (data && data.status === 'success') {
                window.location.href = data.data.link;
                // window.open(data.data.link, '_blank'); // Open the payment link in a new tab
            } else {
                setPaymentStatus('Error initiating payment. Please try again.');
            }
        } catch (error) {
            console.error('Error initiating payment:', error);
            setPaymentStatus('Error initiating payment. Please try again.');
        }
    };

    const handleSubmit = async (e) => {
        setSubmit(true);
        e.preventDefault();
        setPaymentStatus(null);

        // Validate phone number
        if (validatePhoneNumber(phone)) {
            setPhoneError(true);
            setSubmit(false);
            return;
        }

        await initiatePayment();

        setSubmit(false);
    };

    return (
        <div style={{ backgroundColor: ' background-color: hsl(236, 72%, 79%), hsl(237, 63%, 64%)' }}>
            <Container className="card-payment-container">
                <Row className="w-100  justify-content-center">
                    <Col>
                        <Card className="w-100  shadow">

                            <Card.Header>
                                <Card.Title className="text-center mb-3">Card Payment
                                </Card.Title>
                                <Card.Text className="text-center">
                                    Enter your details to proceed with card payment.
                                </Card.Text>
                            </Card.Header>

                            <Card.Body>
                                <Form onSubmit={handleSubmit} className="card-payment-form">
                                    <Form.Group className='mb-3'>
                                        <Form.Label>Name*</Form.Label>
                                        <Form.Control
                                            type='text'
                                            placeholder='Enter your name'
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                        />
                                    </Form.Group>

                                    <Form.Group className='mb-3'>
                                        <Form.Label>Email*</Form.Label>
                                        <Form.Control
                                            type='email'
                                            placeholder='Enter your email'
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </Form.Group>

                                    <Form.Group className='mb-3'>
                                        <Form.Label>Phone Number*</Form.Label>
                                        <PhoneInput
                                            className={`form-control ${phoneError ? 'is-invalid' : ''}`}
                                            placeholder='Enter phone number'
                                            international
                                            defaultCountry='UG'
                                            value={phone}
                                            onChange={setPhone}
                                            required
                                        />
                                        {phoneError && (
                                            <Form.Control.Feedback type='invalid'>
                                                Invalid phone number
                                            </Form.Control.Feedback>
                                        )}
                                    </Form.Group>


                                    <Button
                                        variant='primary'
                                        type='submit'
                                        disabled={submit}
                                        className="w-100 mb-3 payment-submit-btn"
                                    >
                                        {submit ? 'Processing...' : 'Proceed to Payment'}
                                    </Button>

                                </Form>
                            </Card.Body>

                            <Card.Footer>
                                {paymentStatus && (
                                    <Alert variant='info' className='mt-3'>{paymentStatus}</Alert>
                                )}
                                {message && <p className="mt-3 text-center">{message}</p>}
                            </Card.Footer>

                        </Card>
                    </Col >
                </Row >
            </Container >
        </div>
    );
}

// CardPayment.propTypes = {
//     price: PropTypes.number
// };

// CardPayment.defaultProps = {
//     price: 2000
// };

export default CardPayment;
