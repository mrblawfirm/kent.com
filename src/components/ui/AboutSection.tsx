import { Container, Row, Col } from 'react-bootstrap';

export default function AboutSection() {
  return (
    <section id="about" className="py-5">
      <Container>
        <Row className="justify-content-center">
          <Col lg={10} xl={8}>
            <div className="text-center mb-5">
              <h2 className="display-4 fw-bold text-white mb-4">About Us</h2>
            </div>
            
            <div className="text-gray-300 fs-5 lh-lg">
              <p className="mb-4">
                At <strong className="text-white">MRB Law Filing System</strong>, we specialize in streamlining legal documentation through an organized, secure,
                and user-friendly platform. Our innovative system offers law firms, legal departments, and individual
                practitioners a comprehensive solution for document filing, appointment booking, and schedule management — all in
                one place.
              </p>
              
              <p className="mb-4">
                With a focus on efficiency and compliance, MRB simplifies the legal process by enabling clients to schedule
                appointments, track case progress, and access legal files anytime, anywhere. We are committed to improving client experience and
                legal operations through smart automation and reliable support.
              </p>

              <div className="row g-4 mt-4">
                <div className="col-md-6">
                  <div className="d-flex align-items-start">
                    <div className="icon-box me-3 flex-shrink-0">
                      <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="h5 text-white mb-2">Expert Legal Team</h4>
                      <p className="text-gray-300 mb-0">Decades of combined experience across all practice areas</p>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="d-flex align-items-start">
                    <div className="icon-box me-3 flex-shrink-0">
                      <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="h5 text-white mb-2">Secure Platform</h4>
                      <p className="text-gray-300 mb-0">State-of-the-art security for all your legal documents</p>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="d-flex align-items-start">
                    <div className="icon-box me-3 flex-shrink-0">
                      <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="h5 text-white mb-2">Fast Response</h4>
                      <p className="text-gray-300 mb-0">Quick turnaround times and immediate case updates</p>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="d-flex align-items-start">
                    <div className="icon-box me-3 flex-shrink-0">
                      <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="h5 text-white mb-2">Client-Focused</h4>
                      <p className="text-gray-300 mb-0">Personalized attention and dedicated support for every client</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
}