/*MOBILE MONEY FLUTTERWAVE: For both MTN and Airtel*/
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';
import moment from 'moment';
import { isValidPhoneNumber } from 'react-phone-number-input';
import PropTypes from 'prop-types';
import { serverUrl, rootUrl } from '../../../config.js';
import './MobileMoney.css'

function MobileMoney({ propPrice, propPaymentFor, propStudentInfo }) {

    const navigate = useNavigate();
    const location = useLocation();
    let { price, paymentFor, schoolInfo, network, couponCode, duration, numberOfStudents, expiryDate } = location.state || { price: null, paymentFor: 'points', points: 0, schoolInfo: { id: '', name: '', educationLevel: '', address: '', phone: '', email: '' }, network: null, couponCode: null, duration: 366, numberOfStudents: 1, expiryDate: moment().add(40, 'days').toDate().format('MMMM Do YYYY, h:mm:ss a') }; // Set default

    // Extract the root URL (protocol + hostname + port)
    var rootURL = rootUrl;

    //TESTING
    let origPrice = price;

    const [email, setEmail] = useState(schoolInfo.email);
    const [message, setMessage] = useState('A page will load shortly after, requesting you to enter the  MOMO validation OTP sent to you via SMS and Whatsapp to complete this transaction.');
    const [phoneError, setPhoneError] = useState(false); // Error flag for user's phone
    const [amount, setAmount] = useState(price);
    const [phone, setPhone] = useState(schoolInfo.phone || '');
    const [submit, setSubmit] = useState(false);

    const [formData, setFormData] = useState({
        phone_number: phone,
        network: network,
        amount: amount,
        currency: 'UGX',
        email: email,
        name: schoolInfo.name,
        redirect_url: `${rootURL}/payment/verification`,
        meta: {
            price: origPrice,
            description: `Exam subscription for ${schoolInfo.name}`,
            service: `${paymentFor}`,
            couponCode: `${couponCode}`,
            duration: `${duration}`,
            numberOfStudents: `${numberOfStudents}`,
            expiryDate: expiryDate,
            ...({ schoolName: schoolInfo.name, schoolId: schoolInfo.id, educationLevel: schoolInfo.educationLevel }), // Conditional spread operator for adding school information
        }
    });

    const [paymentStatus, setPaymentStatus] = useState(null);

    useEffect(() => {
        setFormData((prevData) => ({
            ...prevData,
            phone_number: phone,
        }));
    }, [phone]);

    useEffect(() => {
        // console.log('Price passed to MTN: ', price)
        if (!price) {
            navigate(-1);
        }
    }, []);

    // Phone number validation function
    const validatePhoneNumber = (phoneNumber) => {
        return phoneNumber && !isValidPhoneNumber(phoneNumber);
    };

    const handlePhoneChange = (value) => {
        setPhone(value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setPhoneError(false);
        setPaymentStatus(null);
        setSubmit(true);

        setFormData({ ...formData, phone_number: phone });
        // setFormData({ ...formData, phone_number: '256121212121' });


        if (!formData.phone_number) {
            setMessage('Please enter phone number.');
            setSubmit(false);
            return;
        }

        // Validate phone numbers
        const isUserPhoneValid = !validatePhoneNumber(phone);

        if (!isUserPhoneValid) {
            setPhoneError(true);
            setSubmit(false);
            return;

        }

        try {

            const response = await fetch(`${serverUrl}/subscription/flw/mobile-money-pay`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            // console.log('Pay response Data:\n', data);
            if (data.response.status === 'success' && data.response.meta.authorization.mode === 'redirect') {
                window.location.href = data.response.meta.authorization.redirect;
                setPaymentStatus('A page will load shortly requesting you to enter the  MOMO validation OTP sent to you via SMS and Whatsapp to complete this transaction.')
            } else {
                setPaymentStatus(data.response.message);
                setSubmit(false);
            }
        } catch (error) {
            console.error('Error making payment:', error);
            setPaymentStatus('Error making payment. Please try again.');
            setSubmit(false);
        } finally {
            setMessage(null)
        }
    };

    return (
        <div className='mt-4' style={{ marginTop: "100px", backgroundColor: ' background-color: hsl(236, 72%, 79%), hsl(237, 63%, 64%)' }}>
            <Form onSubmit={handleSubmit}>
                <Card className="payment-card">
                    <Card.Header className="payment-card-header" style={{ backgroundColor: `${network === 'AIRTEL' && '#c2ecf3'} ` }}>
                        <h3 style={{ color: `${network === 'MTN' ? 'orange' : '#ff0000'} ` }}>{network} Mobile Money Payment</h3>
                        <p style={{ color: `${network === 'AIRTEL' && '#854a12'} ` }}>Securely complete your payment via Mobile Money.</p>
                    </Card.Header>

                    <Card.Body>

                        <Form.Group className='mb-3'>
                            <Card.Subtitle>
                                <Form.Label>Phone Number*</Form.Label>
                            </Card.Subtitle>
                            <PhoneInput
                                className={`form-control ${phoneError ? 'is-invalid' : ''}`}
                                placeholder='Enter phone number'
                                international
                                defaultCountry='UG'
                                value={phone}
                                onChange={handlePhoneChange}
                                required
                            />
                            {phoneError && (
                                <Form.Control.Feedback type='invalid'>
                                    Invalid phone number
                                </Form.Control.Feedback>
                            )}
                        </Form.Group>

                        {paymentStatus && (
                            <Alert className='mt-3' variant='info'>{paymentStatus}</Alert>
                        )}

                        <Button
                            variant='primary'
                            type='submit'
                            className="w-100 mt-3 payment-submit-btn"
                            disabled={!phone || submit}
                        >
                            {submit ?
                                <>
                                    <Spinner
                                        as="span"
                                        animation="grow"
                                        size="sm"
                                        role="status"
                                        aria-hidden="true"
                                    />
                                    Processing...
                                </>
                                :
                                'Pay with Mobile Money'}
                        </Button>

                    </Card.Body>

                    <Card.Footer>
                        {message && <p className="payment-message">{message}</p>}
                    </Card.Footer>
                </Card>
            </Form>
        </div>
    );
}

MobileMoney.propTypes = {
    price: PropTypes.number
};

MobileMoney.defaultProps = {
    price: 2000
};

export default MobileMoney;
