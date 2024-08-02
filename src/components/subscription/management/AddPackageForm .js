import React, { useState } from 'react';
import { Container, Form, Row, Col, Button, InputGroup, Alert } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import { serverUrl } from '../../../config.js';
import './AddPackageForm.css';  // Custom CSS for additional styling

const AddPackageForm = () => {
    const [tier, setTier] = useState('');
    const [price, setPrice] = useState('');
    const [staticDate, setStaticDate] = useState(false);
    const [duration, setDuration] = useState('');
    const [expiryDate, setExpiryDate] = useState(new Date());
    const [features, setFeatures] = useState(['']);
    const [message, setMessage] = useState('');

    const handleFeatureChange = (index, value) => {
        const newFeatures = [...features];
        newFeatures[index] = value;
        setFeatures(newFeatures);
    };

    const handleAddFeature = () => {
        setFeatures([...features, '']);
    };

    const handleRemoveFeature = (index) => {
        const newFeatures = features.filter((_, i) => i !== index);
        setFeatures(newFeatures);
    };

    const resetForm = () => {
        setTier('');
        setPrice('');
        setStaticDate(false);
        setDuration('');
        setExpiryDate(new Date());
        setFeatures(['']);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const newPackage = {
                tier,
                price: parseFloat(price),
                staticDate,
                duration: staticDate ? null : parseInt(duration),
                expiryDate: staticDate ? expiryDate : null,
                features: features.filter(f => f !== ''), // Remove empty features
            };

            await axios.post(`${serverUrl}/subscription/packages/add-package`, newPackage);
            setMessage('Package added successfully!');
            resetForm();
        } catch (error) {
            setMessage('Failed to add package. Please try again.');
        }
    };

    return (
        <Container className="add-package-container">
            <h2 className="my-4 text-center">Create a New Subscription Package</h2>
            <Form onSubmit={handleSubmit} className="add-package-form">
                <Form.Group as={Row} className="mb-3" controlId="formTier">
                    <Form.Label column sm={2}>Tier Name</Form.Label>
                    <Col sm={10}>
                        <Form.Control
                            type="text"
                            value={tier}
                            onChange={(e) => setTier(e.target.value)}
                            placeholder="Enter the name of the package tier"
                            required
                        />
                        <Form.Text className="text-muted">
                            This is the name of the subscription package (e.g., Starter Pack, Premium Pack).
                        </Form.Text>
                    </Col>
                </Form.Group>

                <Form.Group as={Row} className="mb-3" controlId="formPrice">
                    <Form.Label column sm={2}>Price (UGX)</Form.Label>
                    <Col sm={10}>
                        <Form.Control
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="Enter price in Uganda Shillings"
                            required
                        />
                        <Form.Text className="text-muted">
                            The cost of the subscription package in Uganda Shillings.
                        </Form.Text>
                    </Col>
                </Form.Group>

                <Form.Group as={Row} className="mb-3" controlId="formStaticDate">
                    <Form.Label column sm={2}>Static Date</Form.Label>
                    <Col sm={10}>
                        <Form.Check
                            type="checkbox"
                            label="Does this package have a fixed expiry date?"
                            checked={staticDate}
                            onChange={(e) => setStaticDate(e.target.checked)}
                        />
                        <Form.Text className="text-muted">
                            Check this box if the package expires on a specific date, otherwise specify the duration in days.
                        </Form.Text>
                    </Col>
                </Form.Group>

                {!staticDate && (
                    <Form.Group as={Row} className="mb-3" controlId="formDuration">
                        <Form.Label column sm={2}>Duration (Days)</Form.Label>
                        <Col sm={10}>
                            <Form.Control
                                type="number"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                placeholder="Enter duration in days"
                                required
                            />
                            <Form.Text className="text-muted">
                                The duration for which the package will be valid (e.g., 30 days, 60 days).
                            </Form.Text>
                        </Col>
                    </Form.Group>
                )}

                {staticDate && (
                    <Form.Group as={Row} className="mb-3" controlId="formExpiryDate">
                        <Form.Label column sm={2}>Expiry Date</Form.Label>
                        <Col sm={10}>
                            <DatePicker
                                selected={expiryDate}
                                onChange={(date) => setExpiryDate(date)}
                                showTimeSelect
                                timeFormat="HH:mm"
                                timeIntervals={15}
                                dateFormat="Pp"
                                className="form-control"
                                required
                            />
                            <Form.Text className="text-muted">
                                Select the date and time when the package will expire.
                            </Form.Text>
                        </Col>
                    </Form.Group>
                )}

                <Form.Group as={Row} className="mb-3" controlId="formFeatures">
                    <Form.Label column sm={2}>Features</Form.Label>
                    <Col sm={10}>
                        {features.map((feature, index) => (
                            <InputGroup className="mb-2" key={index}>
                                <Form.Control
                                    type="text"
                                    value={feature}
                                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                                    placeholder="Enter a feature of the package"
                                />
                                <InputGroup.Text>
                                    {features.length > 1 && (
                                        <Button variant="outline-danger" onClick={() => handleRemoveFeature(index)}>
                                            <FontAwesomeIcon icon={faMinus} />
                                        </Button>
                                    )}
                                    {index === features.length - 1 && (
                                        <Button variant="outline-success" onClick={handleAddFeature}>
                                            <FontAwesomeIcon icon={faPlus} />
                                        </Button>
                                    )}
                                </InputGroup.Text>
                            </InputGroup>
                        ))}
                        <Form.Text className="text-muted">
                            Add one or more features that are included in this package. Click the "+" button to add more.
                        </Form.Text>
                    </Col>
                </Form.Group>

                <Form.Group as={Row} className="mb-3">
                    <Col sm={{ span: 10, offset: 2 }}>
                        <Button type="submit" variant="primary">Add Package</Button>
                    </Col>
                </Form.Group>

                {message && (
                    <Form.Group as={Row} className="mb-3">
                        <Col sm={{ span: 10, offset: 2 }}>
                            <Alert variant={message.includes('successfully') ? 'success' : 'danger'}>
                                {message}
                            </Alert>
                        </Col>
                    </Form.Group>
                )}
            </Form>
        </Container>
    );
};

export default AddPackageForm;
