import Link from 'next/link';
import { Container, Row, Col } from 'react-bootstrap';

export default function Footer() {
  return (
    <footer className="bg-gray-900 py-5 mt-5">
      <Container>
        <Row>
          <Col md={6} className="text-center text-md-start mb-3 mb-md-0">
            <p className="text-gray-400 mb-0">
              &copy; 2024 MRB Law Firm. All rights reserved.
            </p>
          </Col>
          <Col md={6} className="text-center text-md-end">
            <div className="d-flex justify-content-center justify-content-md-end gap-4">
              <Link href="#" className="text-gray-400 hover:text-white transition-colors text-decoration-none">
                Privacy Policy
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors text-decoration-none">
                Terms of Service
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors text-decoration-none">
                Disclaimer
              </Link>
            </div>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}