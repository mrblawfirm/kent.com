import Link from 'next/link';
import { Container, Row, Col } from 'react-bootstrap';
import NavigationBar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AppointmentForm from '@/components/forms/AppointmentForm';

export const metadata = {
  title: 'Schedule Consultation - MRB Law Firm',
  description: 'Schedule a consultation with MRB Law Firm. Book your appointment online for expert legal representation across all practice areas.',
  keywords: 'schedule consultation, book appointment, legal consultation, MRB Law Firm',
};

export default function AppointmentPage() {
  return (
    <main className="bg-black text-white min-vh-100">
      <NavigationBar />
      
      {/* Header Section */}
      <section 
        className="py-5 text-center"
        style={{
          paddingTop: '120px',
          background: 'linear-gradient(135deg, #000000 0%, #1f2937 100%)'
        }}
      >
        <Container>
          <Row className="justify-content-center">
            <Col lg={8}>
              <h1 className="display-4 fw-bold text-white mb-4">
                Schedule Your Consultation
              </h1>
              <p className="fs-5 text-gray-300 mb-0">
                Take the first step towards expert legal representation. Schedule a consultation with our experienced attorneys.
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Form Section */}
      <section className="py-5">
        <AppointmentForm />
      </section>

      {/* Additional Information */}
      <section className="py-5 bg-gray-900">
        <Container>
          <Row className="justify-content-center">
            <Col lg={8} className="text-center">
              <h2 className="h3 text-white mb-4">What to Expect</h2>
              
              <Row className="g-4 mt-4">
                <Col md={4}>
                  <div className="card-glass p-4 h-100">
                    <div className="icon-box mx-auto mb-3">
                      <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="h5 text-white mb-3">Quick Response</h3>
                    <p className="text-gray-300 mb-0">
                      We'll contact you within 24 hours to confirm your appointment and provide further details.
                    </p>
                  </div>
                </Col>

                <Col md={4}>
                  <div className="card-glass p-4 h-100">
                    <div className="icon-box mx-auto mb-3">
                      <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="h5 text-white mb-3">Expert Review</h3>
                    <p className="text-gray-300 mb-0">
                      Our experienced attorneys will review your case details before the consultation.
                    </p>
                  </div>
                </Col>

                <Col md={4}>
                  <div className="card-glass p-4 h-100">
                    <div className="icon-box mx-auto mb-3">
                      <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <h3 className="h5 text-white mb-3">Confidential</h3>
                    <p className="text-gray-300 mb-0">
                      All information shared is completely confidential and protected by attorney-client privilege.
                    </p>
                  </div>
                </Col>
              </Row>

              <div className="mt-5 pt-4 border-top border-gray-600">
                <p className="text-gray-400 mb-3">
                  Have questions about our services?
                </p>
                <Link href="/#about" className="text-primary text-decoration-none me-4" style={{ color: '#818cf8' }}>
                  Learn More About Us
                </Link>
                <Link href="/#contact" className="text-primary text-decoration-none" style={{ color: '#818cf8' }}>
                  Contact Information
                </Link>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <Footer />
    </main>
  );
}