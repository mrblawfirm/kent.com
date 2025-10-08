import Link from 'next/link';
import { Container, Row, Col } from 'react-bootstrap';

const contactInfo = {
  address: '123 Legal Ave, Justice City, Lawland',
  email: 'MRBLAW@gmail.com',
  phone: '0967942489',
  businessHours: {
    weekdays: 'Monday - Friday: 9:00 AM - 6:00 PM',
    weekend: 'Weekend: Closed'
  }
};

function ContactItem({ 
  icon, 
  title, 
  children 
}: { 
  icon: JSX.Element; 
  title: string; 
  children: React.ReactNode; 
}) {
  return (
    <div className="d-flex align-items-start mb-4">
      <div className="text-primary me-3 flex-shrink-0" style={{ color: '#818cf8' }}>
        {icon}
      </div>
      <div>
        <h4 className="h6 text-white fw-semibold mb-2">{title}</h4>
        <div className="text-gray-300">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function ContactSection() {
  return (
    <section id="contact" className="py-5 bg-black bg-opacity-90">
      <Container>
        <Row className="justify-content-center mb-5">
          <Col lg={8} className="text-center">
            <h2 className="display-4 fw-bold text-white mb-4">Contact Us</h2>
            <p className="fs-5 text-gray-300">
              Ready to discuss your legal needs? Get in touch with our experienced team today.
            </p>
          </Col>
        </Row>

        <Row className="justify-content-center">
          <Col lg={10}>
            <Row className="g-4">
              <Col md={6}>
                <ContactItem
                  icon={
                    <svg width="40" height="40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10c0 6-7 12-9 12S3 16 3 10a9 9 0 0118 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10a3 3 0 100-6 3 3 0 000 6z" />
                    </svg>
                  }
                  title="Address"
                >
                  <p className="mb-0">{contactInfo.address}</p>
                </ContactItem>
              </Col>

              <Col md={6}>
                <ContactItem
                  icon={
                    <svg width="40" height="40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" strokeWidth={2} />
                    </svg>
                  }
                  title="Email"
                >
                  <a 
                    href={`mailto:${contactInfo.email}`}
                    className="text-primary hover:text-primary-300 text-decoration-none"
                    style={{ color: '#818cf8' }}
                  >
                    {contactInfo.email}
                  </a>
                </ContactItem>
              </Col>

              <Col md={6}>
                <ContactItem
                  icon={
                    <svg width="40" height="40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                    </svg>
                  }
                  title="Phone Number"
                >
                  <a 
                    href={`tel:+${contactInfo.phone}`}
                    className="text-primary hover:text-primary-300 text-decoration-none"
                    style={{ color: '#818cf8' }}
                  >
                    {contactInfo.phone}
                  </a>
                </ContactItem>
              </Col>

              <Col md={6}>
                <ContactItem
                  icon={
                    <svg width="40" height="40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" strokeWidth={2} />
                      <polyline points="12,6 12,12 16,14" strokeWidth={2} />
                    </svg>
                  }
                  title="Business Hours"
                >
                  <p className="mb-1">{contactInfo.businessHours.weekdays}</p>
                  <p className="mb-0">{contactInfo.businessHours.weekend}</p>
                </ContactItem>
              </Col>
            </Row>
          </Col>
        </Row>

        {/* Call to Action */}
        <Row className="justify-content-center mt-5">
          <Col lg={6} className="text-center">
            <div className="p-4 rounded-3" style={{ background: 'rgba(79, 70, 229, 0.1)' }}>
              <h3 className="h4 text-white mb-3">Ready to Get Started?</h3>
              <p className="text-gray-300 mb-4">
                Schedule your consultation today and take the first step towards resolving your legal matters.
              </p>
              <Link href="/appointment" className="btn-gradient text-decoration-none fs-5 px-4 py-3">
                Schedule Your Consultation Today
              </Link>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
}