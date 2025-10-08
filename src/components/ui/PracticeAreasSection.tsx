'use client';

import { useEffect, useState } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { PracticeArea } from '@/types';

const defaultPracticeAreas: PracticeArea[] = [
  {
    id: 1,
    slug: 'corporate-law',
    name: 'Corporate Law',
    description: 'Expert legal counsel for businesses of all sizes, from startups to established corporations.',
    icon: 'briefcase',
    active: true,
    created_at: ''
  },
  {
    id: 2,
    slug: 'litigation',
    name: 'Litigation',
    description: 'Aggressive representation in court proceedings, with a track record of successful outcomes for our clients.',
    icon: 'scale',
    active: true,
    created_at: ''
  },
  {
    id: 3,
    slug: 'estate-planning',
    name: 'Estate Planning',
    description: 'Comprehensive estate planning services to protect your assets and provide for your loved ones.',
    icon: 'document',
    active: true,
    created_at: ''
  },
  {
    id: 4,
    slug: 'real-estate',
    name: 'Real Estate Law',
    description: 'Legal guidance for residential and commercial real estate transactions, development, and disputes.',
    icon: 'home',
    active: true,
    created_at: ''
  },
  {
    id: 5,
    slug: 'family-law',
    name: 'Family Law',
    description: 'Compassionate representation for divorce, child custody, and other family legal matters.',
    icon: 'users',
    active: true,
    created_at: ''
  },
  {
    id: 6,
    slug: 'criminal-defense',
    name: 'Criminal Defense',
    description: 'Strategic defense for individuals facing criminal charges, protecting your rights and freedom.',
    icon: 'shield',
    active: true,
    created_at: ''
  }
];

function getIconSvg(iconName: string) {
  const icons: { [key: string]: JSX.Element } = {
    briefcase: (
      <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21H5a2 2 0 01-2-2V7a2 2 0 012-2h4l2-3 2 3h4a2 2 0 012 2v12a2 2 0 01-2 2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10h6M9 14h6" />
      </svg>
    ),
    scale: (
      <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M5 3h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6M9 16h6" />
      </svg>
    ),
    document: (
      <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21v-2a4 4 0 00-3-3.87M5 21v-2a4 4 0 013-3.87M13 14h8M13 10h8M13 6h8" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10V5a2 2 0 012-2h10" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14v7M12 3v2" />
      </svg>
    ),
    home: (
      <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8v4a4 4 0 008 0v-4" />
        <rect x="7" y="3" width="10" height="4" rx="2" strokeWidth={2} />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 14h10" />
      </svg>
    ),
    users: (
      <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 21v-7a4 4 0 014-4h8a4 4 0 014 4v7" />
        <circle cx="12" cy="7" r="4" strokeWidth={2} />
      </svg>
    ),
    shield: (
      <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 3v1a2 2 0 002 2h4v5" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13v6a2 2 0 002 2h8a2 2 0 002-2v-6" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6" />
      </svg>
    )
  };

  return icons[iconName] || icons.briefcase;
}

export default function PracticeAreasSection() {
  const [practiceAreas, setPracticeAreas] = useState<PracticeArea[]>(defaultPracticeAreas);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPracticeAreas() {
      try {
        const response = await fetch('/api/practice-areas?active=true');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data.length > 0) {
            setPracticeAreas(data.data);
          }
        }
      } catch (error) {
        console.error('Error fetching practice areas:', error);
        // Keep default areas on error
      } finally {
        setLoading(false);
      }
    }

    fetchPracticeAreas();
  }, []);

  const scrollToContact = () => {
    const element = document.getElementById('contact');
    if (element) {
      const offsetTop = element.offsetTop - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section id="practice-areas" className="py-5">
      <Container>
        <Row className="justify-content-center mb-5">
          <Col lg={8} className="text-center">
            <h2 className="display-4 fw-bold text-white mb-4">Our Practice Areas</h2>
            <p className="fs-5 text-gray-300 mb-0">
              MRB Law provides expert legal representation across a wide range of practice areas. 
              Our attorneys bring decades of experience to every case.
            </p>
          </Col>
        </Row>

        <Row className="g-4">
          {practiceAreas.map((area, index) => (
            <Col key={area.id} lg={4} md={6}>
              <Card 
                className="card-glass h-100 border-0 practice-card"
                style={{
                  animationDelay: `${index * 0.1}s`,
                  cursor: 'default'
                }}
              >
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="icon-box me-3">
                      {getIconSvg(area.icon)}
                    </div>
                    <h3 className="h4 text-white mb-0">{area.name}</h3>
                  </div>
                  
                  <p className="text-gray-200 mb-4 lh-base">
                    {area.description}
                  </p>
                  
                  <button
                    onClick={scrollToContact}
                    className="text-primary-400 fw-semibold text-decoration-none bg-transparent border-0 p-0 hover:text-primary-300 transition-colors"
                    style={{ color: '#818cf8' }}
                  >
                    Learn more →
                  </button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
}