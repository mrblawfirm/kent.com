'use client';

import { useEffect, useState } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import Image from 'next/image';
import { Testimonial } from '@/types';

const defaultTestimonials: Testimonial[] = [
  {
    id: 1,
    name: 'James Manayon',
    image_url: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/5373c3f8-62e8-484a-b65d-34b6bd3ac762.png',
    rating: 5,
    review: 'I recommend this law firm so approachable and so kind.',
    active: true,
    created_at: ''
  },
  {
    id: 2,
    name: 'Blast Kasi',
    image_url: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/afdcac29-51e5-4fd6-a864-93d24e2872e7.png',
    rating: 5,
    review: 'I suggest this firm, they give you good service.',
    active: true,
    created_at: ''
  },
  {
    id: 3,
    name: 'Marlou Agadelo',
    image_url: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/7d2da713-75cd-4e8b-a5a3-e1a4041ee7a9.png',
    rating: 5,
    review: 'The staff is kind and approachable.',
    active: true,
    created_at: ''
  }
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="d-flex justify-content-center gap-1 mb-2">
      {[...Array(5)].map((_, index) => (
        <svg
          key={index}
          width="20"
          height="20"
          fill={index < rating ? '#facc15' : '#374151'}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.962a1 1 0 00.95.69h4.166c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.961c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.783.57-1.838-.197-1.54-1.118l1.287-3.96a1 1 0 00-.364-1.118L2.03 9.39c-.783-.57-.38-1.81.588-1.81h4.166a1 1 0 00.95-.69l1.286-3.963z" />
        </svg>
      ))}
    </div>
  );
}

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(defaultTestimonials);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTestimonials() {
      try {
        const response = await fetch('/api/testimonials?active=true&limit=3');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data.length > 0) {
            setTestimonials(data.data);
          }
        }
      } catch (error) {
        console.error('Error fetching testimonials:', error);
        // Keep default testimonials on error
      } finally {
        setLoading(false);
      }
    }

    fetchTestimonials();
  }, []);

  return (
    <section id="testimonials" className="py-5 bg-gray-900">
      <Container>
        <Row className="justify-content-center mb-5">
          <Col lg={8} className="text-center">
            <h2 className="display-4 fw-bold text-white mb-4">What Our Clients Say</h2>
            <p className="fs-5 text-gray-300">
              Don't just take our word for it. Here's what our satisfied clients have to say about our legal services.
            </p>
          </Col>
        </Row>

        <Row className="g-4">
          {testimonials.map((testimonial, index) => (
            <Col key={testimonial.id} lg={4} md={6}>
              <Card 
                className="card-glass h-100 border-0 testimonial-card text-center"
                style={{
                  animationDelay: `${index * 0.2}s`
                }}
              >
                <Card.Body className="p-4 d-flex flex-column align-items-center">
                  <div className="position-relative mb-3">
                    <Image
                      src={testimonial.image_url}
                      alt={`Portrait of ${testimonial.name}`}
                      width={80}
                      height={80}
                      className="rounded-circle"
                      style={{
                        objectFit: 'cover',
                        border: '3px solid #4f46e5'
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://placehold.co/80x80?text=${testimonial.name.split(' ').map(n => n[0]).join('')}`;
                      }}
                    />
                  </div>
                  
                  <h4 className="h5 text-white fw-semibold mb-2">
                    {testimonial.name}
                  </h4>
                  
                  <StarRating rating={testimonial.rating} />
                  
                  <blockquote className="text-gray-300 mb-0 fst-italic">
                    "{testimonial.review}"
                  </blockquote>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Call to Action */}
        <Row className="justify-content-center mt-5">
          <Col lg={6} className="text-center">
            <p className="text-gray-300 mb-3">
              Ready to experience our exceptional legal services?
            </p>
            <a href="#contact" className="btn-gradient text-decoration-none">
              Get Your Free Consultation
            </a>
          </Col>
        </Row>
      </Container>
    </section>
  );
}