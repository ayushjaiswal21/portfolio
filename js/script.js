
        // Smooth scrolling for navigation
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                document.querySelector(this.getAttribute('href')).scrollIntoView({
                    behavior: 'smooth'
                });
            });
        });

        // Scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        document.querySelectorAll('section').forEach(section => {
            observer.observe(section);
        });

        // Header background on scroll
        window.addEventListener('scroll', () => {
            const header = document.querySelector('header');
            if (window.scrollY > 100) {
                header.style.background = 'rgba(0, 0, 0, 0.8)';
                header.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.4)';
            } else {
                header.style.background = 'rgba(0, 0, 0, 0.4)';
                header.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
            }
        });

        // Typing effect for hero title (modified)
        const heroTitle = document.querySelector('.hero-content h1');
        const originalText = heroTitle.textContent;
        heroTitle.textContent = '';
        
        setTimeout(() => {
            let i = 0;
            const typeWriter = () => {
                if (i < originalText.length) {
                    heroTitle.textContent += originalText.charAt(i);
                    i++;
                    setTimeout(typeWriter, 80);
                }
            };
            heroTitle.style.opacity = '1';
            typeWriter();
        }, 800);

        // Particle animation for floating shapes - adjusted for new animation
        const shapes = document.querySelectorAll('.shape');
        shapes.forEach((shape, index) => {
            shape.style.top = Math.random() * 100 + '%';
            shape.style.left = Math.random() * 100 + '%';
            shape.style.animationDelay = Math.random() * 8 + 's';
        });

        // Dynamic background gradient - Adjusted to match new base gradient
        let gradientAngle = 135;
        setInterval(() => {
            gradientAngle = (gradientAngle + 0.2) % 360;
            document.body.style.background = `linear-gradient(${gradientAngle}deg, #4b6cb7 0%, #182848 100%)`;
        }, 80);

        // Scroll progress indicator
        window.addEventListener('scroll', () => {
            const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
            document.querySelector('.scroll-progress').style.width = scrolled + '%';
        });

        // Section navigation dots
        const sectionDots = document.querySelectorAll('.section-dot');
        const sections = document.querySelectorAll('section');
        
        sectionDots.forEach(dot => {
            dot.addEventListener('click', () => {
                const targetSection = document.getElementById(dot.dataset.section);
                targetSection.scrollIntoView({ behavior: 'smooth' });
            });
        });

        // Update active dot based on scroll position
        window.addEventListener('scroll', () => {
            let current = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                // Consider the middle of the screen for more accurate active section
                if (window.scrollY + window.innerHeight / 2 >= sectionTop && window.scrollY + window.innerHeight / 2 < sectionTop + sectionHeight) {
                    current = section.getAttribute('id');
                }
            });
            
            sectionDots.forEach(dot => {
                dot.classList.remove('active');
                if (dot.dataset.section === current) {
                    dot.classList.add('active');
                }
            });
        });

        // Enhanced card interactions (refinement)
        const cards = document.querySelectorAll('.project-card, .hackathon-card, .volunteer-card, .cert-card, .skill-category, .stat-item, .contact-item, .contact-link'); // Apply to all relevant cards
        cards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'scale(1.02)';
                this.style.boxShadow = '0 20px 50px rgba(0, 0, 0, 0.4)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'scale(1)';
                this.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.2)';
            });
        });

        // Professional loading animation (modified)
        window.addEventListener('load', () => {
            // Apply a fade-in to the body after everything loads
            document.body.style.opacity = '0';
            document.body.style.transition = 'opacity 0.8s ease-out';
            setTimeout(() => {
                document.body.style.opacity = '1';
            }, 200);
        });

        // No need for separate stat-item hover, unified with general card hover

const hamburger = document.querySelector(".hamburger");
const navLinks = document.querySelector(".nav-links");

hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navLinks.classList.toggle("active");
});

document.querySelectorAll(".nav-links a").forEach(n => n.addEventListener("click", () => {
    hamburger.classList.remove("active");
    navLinks.classList.remove("active");
}));
