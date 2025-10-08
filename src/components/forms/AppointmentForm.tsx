'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Container, Row, Col, Form, Button, Alert, Card } from 'react-bootstrap';
import { AppointmentFormData, PracticeArea } from '@/types';

interface AppointmentFormProps {
  onSuccess?: () => void;
}

export default function AppointmentForm({ onSuccess }: AppointmentFormProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [practiceAreas, setPracticeAreas] = useState<PracticeArea[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<AppointmentFormData>();

  // Fetch practice areas on component mount
  useEffect(() => {
    async function fetchPracticeAreas() {
      try {
        const response = await fetch('/api/practice-areas?active=true');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setPracticeAreas(data.data);
          }
        }
      } catch (error) {
        console.error('Error fetching practice areas:', error);
      }
    }

    fetchPracticeAreas();
  }, []);

  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0];

  const onSubmit = async (data: AppointmentFormData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        reset();
        onSuccess?.();
        
        // Scroll to success message
        setTimeout(() => {
          const successElement = document.getElementById('success-message');
          if (successElement) {
            successElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      } else {
        setError(result.error || 'Failed to schedule appointment. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col lg={8} xl={6}>
          <Card className="card-glass border-0">
            <Card.Body className="p-4 p-md-5">
              
              {/* Success Message */}
              {success && (
                <Alert 
                  variant="success" 
                  id="success-message"
                  className="d-flex align-items-center mb-4"
                  style={{
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    borderColor: 'rgba(34, 197, 94, 0.3)',
                    color: '#22c55e'
                  }}
                >
                  <svg className="me-3" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Your consultation request has been submitted successfully! We'll contact you within 24 hours.
                </Alert>
              )}

              {/* Error Message */}
              {error && (
                <Alert 
                  variant="danger"
                  className="d-flex align-items-center mb-4"
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderColor: 'rgba(239, 68, 68, 0.3)',
                    color: '#ef4444'
                  }}
                >
                  <svg className="me-3" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit(onSubmit)} noValidate>
                
                {/* Personal Information */}
                <div className="mb-4">
                  <h3 className="h4 text-white mb-3">Personal Information</h3>
                  
                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="text-gray-300 fw-medium">
                          First Name <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          {...register('firstName', { 
                            required: 'First name is required',
                            minLength: { value: 2, message: 'First name must be at least 2 characters' }
                          })}
                          isInvalid={!!errors.firstName}
                          className="form-control"
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.firstName?.message}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="text-gray-300 fw-medium">
                          Last Name <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          {...register('lastName', { 
                            required: 'Last name is required',
                            minLength: { value: 2, message: 'Last name must be at least 2 characters' }
                          })}
                          isInvalid={!!errors.lastName}
                          className="form-control"
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.lastName?.message}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="text-gray-300 fw-medium">
                          Email Address <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="email"
                          {...register('email', { 
                            required: 'Email is required',
                            pattern: {
                              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                              message: 'Please enter a valid email address'
                            }
                          })}
                          isInvalid={!!errors.email}
                          className="form-control"
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.email?.message}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="text-gray-300 fw-medium">
                          Phone Number <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="tel"
                          {...register('phone', { 
                            required: 'Phone number is required',
                            pattern: {
                              value: /^[+]?[\d\s\-\(\)]+$/,
                              message: 'Please enter a valid phone number'
                            },
                            minLength: { value: 10, message: 'Phone number must be at least 10 digits' }
                          })}
                          isInvalid={!!errors.phone}
                          className="form-control"
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.phone?.message}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>
                </div>

                {/* Legal Matter Information */}
                <div className="mb-4">
                  <h3 className="h4 text-white mb-3">Legal Matter Information</h3>
                  
                  <Row className="g-3">
                    <Col md={12}>
                      <Form.Group>
                        <Form.Label className="text-gray-300 fw-medium">
                          Practice Area <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Select
                          {...register('practiceArea', { required: 'Please select a practice area' })}
                          isInvalid={!!errors.practiceArea}
                          className="form-select"
                        >
                          <option value="">Select a practice area</option>
                          {practiceAreas.map((area) => (
                            <option key={area.id} value={area.slug}>
                              {area.name}
                            </option>
                          ))}
                          <option value="other">Other</option>
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                          {errors.practiceArea?.message}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="text-gray-300 fw-medium">
                          Preferred Date <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="date"
                          min={today}
                          {...register('preferredDate', { 
                            required: 'Please select a preferred date',
                            validate: (value) => {
                              const selectedDate = new Date(value);
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);
                              return selectedDate >= today || 'Date cannot be in the past';
                            }
                          })}
                          isInvalid={!!errors.preferredDate}
                          className="form-control"
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.preferredDate?.message}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="text-gray-300 fw-medium">
                          Preferred Time <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Select
                          {...register('preferredTime', { required: 'Please select a preferred time' })}
                          isInvalid={!!errors.preferredTime}
                          className="form-select"
                        >
                          <option value="">Select a time</option>
                          <option value="09:00">9:00 AM</option>
                          <option value="10:00">10:00 AM</option>
                          <option value="11:00">11:00 AM</option>
                          <option value="12:00">12:00 PM</option>
                          <option value="13:00">1:00 PM</option>
                          <option value="14:00">2:00 PM</option>
                          <option value="15:00">3:00 PM</option>
                          <option value="16:00">4:00 PM</option>
                          <option value="17:00">5:00 PM</option>
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                          {errors.preferredTime?.message}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    <Col md={12}>
                      <Form.Group>
                        <Form.Label className="text-gray-300 fw-medium">
                          Brief Description of Your Case <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={4}
                          placeholder="Please provide a brief description of your legal matter..."
                          {...register('caseDescription', { 
                            required: 'Please provide a case description',
                            minLength: { value: 20, message: 'Please provide at least 20 characters' }
                          })}
                          isInvalid={!!errors.caseDescription}
                          className="form-control"
                          style={{ resize: 'none' }}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.caseDescription?.message}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>
                </div>

                {/* Consultation Type */}
                <div className="mb-4">
                  <Form.Label className="text-gray-300 fw-medium mb-3">
                    Consultation Type <span className="text-danger">*</span>
                  </Form.Label>
                  
                  <Row className="g-3">
                    {[
                      { value: 'in-person', label: 'In-Person', description: 'Meet at our office' },
                      { value: 'video-call', label: 'Video Call', description: 'Online meeting' },
                      { value: 'phone-call', label: 'Phone Call', description: 'Phone consultation' }
                    ].map((type) => (
                      <Col md={4} key={type.value}>
                        <Form.Check
                          type="radio"
                          id={`consultation-${type.value}`}
                          value={type.value}
                          {...register('consultationType', { required: 'Please select a consultation type' })}
                          isInvalid={!!errors.consultationType}
                          className="d-none"
                        />
                        <Form.Label
                          htmlFor={`consultation-${type.value}`}
                          className={`card-glass p-3 d-block text-center cursor-pointer transition-all ${
                            watch('consultationType') === type.value ? 'border-primary' : ''
                          }`}
                          style={{
                            cursor: 'pointer',
                            borderColor: watch('consultationType') === type.value ? '#4f46e5' : 'rgba(255, 255, 255, 0.1)'
                          }}
                        >
                          <div className="fw-semibold text-white mb-1">{type.label}</div>
                          <div className="text-gray-400 small">{type.description}</div>
                        </Form.Label>
                      </Col>
                    ))}
                  </Row>
                  
                  {errors.consultationType && (
                    <div className="text-danger small mt-2">
                      {errors.consultationType.message}
                    </div>
                  )}
                </div>

                {/* Agreement */}
                <div className="mb-4">
                  <Form.Check
                    type="checkbox"
                    id="agreement"
                    {...register('agreement', { required: 'You must agree to the terms' })}
                    isInvalid={!!errors.agreement}
                    label={
                      <span className="text-gray-300 small">
                        I agree to the{' '}
                        <a href="#" className="text-primary text-decoration-none" style={{ color: '#818cf8' }}>
                          Terms of Service
                        </a>{' '}
                        and{' '}
                        <a href="#" className="text-primary text-decoration-none" style={{ color: '#818cf8' }}>
                          Privacy Policy
                        </a>
                        . I understand that this consultation request does not create an attorney-client relationship.
                      </span>
                    }
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.agreement?.message}
                  </Form.Control.Feedback>
                </div>

                {/* Submit Button */}
                <div className="text-center">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="btn-gradient border-0 px-4 py-3 fs-5"
                    style={{ minWidth: '200px' }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner me-2" />
                        Scheduling...
                      </>
                    ) : (
                      'Schedule Consultation'
                    )}
                  </Button>
                </div>

                {/* Contact Info */}
                <div className="text-center mt-4 pt-4 border-top border-gray-600">
                  <p className="text-gray-400 mb-2">Need immediate assistance? Call us directly at</p>
                  <a 
                    href="tel:+0967942489" 
                    className="text-primary fw-semibold fs-5 text-decoration-none"
                    style={{ color: '#818cf8' }}
                  >
                    0967942489
                  </a>
                  <p className="text-gray-500 small mt-2 mb-0">
                    Business Hours: Monday - Friday, 9:00 AM - 6:00 PM
                  </p>
                </div>

              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}