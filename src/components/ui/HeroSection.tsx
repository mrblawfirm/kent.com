import Link from 'next/link';
import { Container, Row, Col } from 'react-bootstrap';

export default function HeroSection() {
  return (
    <section 
      id="home"
      className="position-relative d-flex align-items-center justify-content-center text-center"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #000000 0%, #1f2937 100%)',
        paddingTop: '120px',
        paddingBottom: '80px'
      }}
    >
      {/* Background overlay */}
      <div 
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{
          background: 'radial-gradient(circle at center, rgba(79, 70, 229, 0.1) 0%, transparent 70%)',
          zIndex: 1
        }}
      />
      
      <Container className="position-relative" style={{ zIndex: 2 }}>
        <Row className="justify-content-center">
          <Col lg={10} xl={8}>
            <div className="card-glass p-4 p-md-5 animate-fade-in">
              <h1 
                className="display-2 fw-bold text-white mb-4 text-shadow"
                style={{ 
                  fontSize: 'clamp(2.5rem, 8vw, 4rem)',
                  lineHeight: '1.1'
                }}
              >
                MRB<br />LAW FIRM
              </h1>
              
              <p className="fs-4 text-gray-100 mb-3 text-shadow">
                Files Management with Appointment Scheduling
              </p>
              
              <p className="fs-6 text-gray-200 mb-5 mx-auto" style={{ maxWidth: '600px' }}>
                Expert legal representation with innovative case management and seamless client communication.
              </p>
              
              <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center align-items-center">
                <Link href="/appointment" className="btn-gradient fs-5 px-4 py-3 text-decoration-none">
                  Schedule a Consultation Now
                </Link>
                
                <a 
                  href="tel:+0967942489" 
                  className="text-gray-300 hover:text-white transition-colors text-decoration-none d-flex align-items-center gap-2"
                >
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                  </svg>
                  Call Now: 0967942489
                </a>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
      
      {/* Scroll indicator */}
      <div 
        className="position-absolute bottom-0 start-50 translate-middle-x mb-4 animate-bounce-slow"
        style={{ zIndex: 2 }}
      >
        <svg 
          width="24" 
          height="24" 
          fill="none" 
          stroke="currentColor" 
          className="text-gray-400"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
}