'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar, Nav, Container } from 'react-bootstrap';

export default function NavigationBar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offsetTop = element.offsetTop - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  };

  return (
    <Navbar 
      expand="lg" 
      variant="dark" 
      fixed="top"
      className={`transition-all duration-300 ${
        scrolled 
          ? 'bg-black bg-opacity-95 backdrop-blur-md shadow-lg' 
          : 'bg-transparent'
      }`}
      style={{ 
        borderBottom: scrolled ? '1px solid rgba(55, 65, 81, 0.5)' : 'none',
        zIndex: 1050 
      }}
    >
      <Container>
        <Navbar.Brand 
          as={Link} 
          href="/" 
          className="fw-bold fs-4 text-white"
          style={{ letterSpacing: '0.05em' }}
        >
          MRB LAW
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link 
              onClick={() => scrollToSection('home')}
              className="text-gray-300 hover:text-white transition-colors cursor-pointer mx-2"
            >
              Home
            </Nav.Link>
            <Nav.Link 
              onClick={() => scrollToSection('about')}
              className="text-gray-300 hover:text-white transition-colors cursor-pointer mx-2"
            >
              About Us
            </Nav.Link>
            <Nav.Link 
              onClick={() => scrollToSection('practice-areas')}
              className="text-gray-300 hover:text-white transition-colors cursor-pointer mx-2"
            >
              Practice Areas
            </Nav.Link>
            <Nav.Link 
              onClick={() => scrollToSection('testimonials')}
              className="text-gray-300 hover:text-white transition-colors cursor-pointer mx-2"
            >
              Testimonials
            </Nav.Link>
            <Nav.Link 
              onClick={() => scrollToSection('contact')}
              className="text-gray-300 hover:text-white transition-colors cursor-pointer mx-2"
            >
              Contact
            </Nav.Link>
          </Nav>
          
          <div className="ms-3">
            <Link href="/appointment" className="btn-gradient text-decoration-none">
              Schedule Consultation
            </Link>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}