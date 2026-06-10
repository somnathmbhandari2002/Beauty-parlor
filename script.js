/* ==========================================================================
   AURA MAISON DE BEAUTÉ - INTERACTIVE CORE LOGIC
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       1. STICKY HEADER SCROLL STATE
       ========================================================================== */
    const header = document.getElementById('main-header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    /* ==========================================================================
       2. MOBILE NAVIGATION HAMBURGER MENU
       ========================================================================== */
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    const toggleMenu = () => {
        mobileToggle.classList.toggle('open');
        navMenu.classList.toggle('open');
    };

    const closeMenu = () => {
        mobileToggle.classList.remove('open');
        navMenu.classList.remove('open');
    };

    mobileToggle.addEventListener('click', toggleMenu);
    
    // Close menu when clicking navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // Close menu when clicking outside of nav menu on mobile
    document.addEventListener('click', (e) => {
        if (navMenu.classList.contains('open') && 
            !navMenu.contains(e.target) && 
            !mobileToggle.contains(e.target)) {
            closeMenu();
        }
    });

    /* ==========================================================================
       3. INTERSECTION OBSERVER FOR SCROLL REVEAL ANIMATIONS
       ========================================================================== */
    const revealElements = document.querySelectorAll('[data-reveal]');
    
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target); // Animates only once
            }
        });
    }, {
        threshold: 0.12, // Element is 12% visible before triggering
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(element => {
        revealObserver.observe(element);
    });

    /* ==========================================================================
       4. SERVICES FILTER FUNCTIONALITY
       ========================================================================== */
    const tabButtons = document.querySelectorAll('.tab-btn');
    const serviceCards = document.querySelectorAll('.service-card');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active state from all tabs
            tabButtons.forEach(btn => btn.classList.remove('active'));
            // Add active state to clicked tab
            button.classList.add('active');
            
            const filterValue = button.getAttribute('data-filter');

            serviceCards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');
                
                if (filterValue === 'all' || filterValue === cardCategory) {
                    card.classList.add('show-card');
                } else {
                    card.classList.remove('show-card');
                }
            });
        });
    });

    /* ==========================================================================
       5. INTERACTIVE BEFORE & AFTER COMPARISON SLIDER
       ========================================================================== */
    const slider = document.getElementById('comparison-slider');
    
    if (slider) {
        const afterContainer = document.getElementById('after-img-container');
        const afterImg = document.querySelector('.after-img');
        const divider = document.getElementById('slider-divider');
        
        let isDragging = false;

        const setSliderPosition = (x) => {
            const rect = slider.getBoundingClientRect();
            let position = ((x - rect.left) / rect.width) * 100;
            
            // Constrain between 0% and 100%
            if (position < 0) position = 0;
            if (position > 100) position = 100;
            
            afterContainer.style.width = `${position}%`;
            divider.style.left = `${position}%`;
        };

        const resizeSliderImage = () => {
            afterImg.style.width = `${slider.offsetWidth}px`;
        };

        // Event listeners for desktop mouse
        divider.addEventListener('mousedown', (e) => {
            isDragging = true;
            slider.style.cursor = 'ew-resize';
            e.preventDefault();
        });

        window.addEventListener('mouseup', () => {
            isDragging = false;
            if (slider) slider.style.cursor = 'default';
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            setSliderPosition(e.clientX);
        });

        // Event listeners for mobile touch
        divider.addEventListener('touchstart', (e) => {
            isDragging = true;
            e.preventDefault();
        });

        window.addEventListener('touchend', () => {
            isDragging = false;
        });

        window.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            setSliderPosition(e.touches[0].clientX);
        });

        // Initialize slider image size and center slider
        window.addEventListener('resize', resizeSliderImage);
        
        // Wait for images to load to measure slider width correctly
        window.addEventListener('load', () => {
            resizeSliderImage();
            const initialX = slider.getBoundingClientRect().left + (slider.offsetWidth / 2);
            setSliderPosition(initialX);
        });

        // Fallback initial call in case DOM loads slowly
        setTimeout(() => {
            resizeSliderImage();
            const initialX = slider.getBoundingClientRect().left + (slider.offsetWidth / 2);
            setSliderPosition(initialX);
        }, 1000);
    }

    /* ==========================================================================
       6. INTERACTIVE BUNDLE CALCULATOR
       ========================================================================== */
    const calcCheckboxes = document.querySelectorAll('.calc-service');
    const calcSubtotalEl = document.getElementById('calc-subtotal');
    const calcDiscountEl = document.getElementById('calc-discount');
    const calcTotalEl = document.getElementById('calc-total');
    const bookCustomBtn = document.getElementById('book-custom-btn');
    const notesField = document.getElementById('booking-notes');
    const serviceSelect = document.getElementById('booking-service');

    const updateCalculator = () => {
        let subtotal = 0;
        let selectedCount = 0;
        const selectedServices = [];

        calcCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                subtotal += parseFloat(checkbox.value);
                selectedCount++;
                selectedServices.push(checkbox.getAttribute('data-name'));
            }
        });

        const discountRate = 0.15; // 15% discount for custom bundles
        const discount = selectedCount > 1 ? subtotal * discountRate : 0;
        const total = subtotal - discount;

        // Update elements
        calcSubtotalEl.textContent = `₹${Math.round(subtotal).toLocaleString("en-IN")}`;
        calcDiscountEl.textContent = `-₹${Math.round(discount).toLocaleString("en-IN")}`;
        calcTotalEl.textContent = `₹${Math.round(total).toLocaleString("en-IN")}`;

        // Manage button state
        if (selectedCount > 0) {
            bookCustomBtn.removeAttribute('disabled');
        } else {
            bookCustomBtn.setAttribute('disabled', 'true');
        }

        return {
            services: selectedServices,
            total: total.toFixed(2)
        };
    };

    calcCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateCalculator);
    });

    if (bookCustomBtn) {
        bookCustomBtn.addEventListener('click', () => {
            const data = updateCalculator();
            
            // Set service select to Custom
            serviceSelect.value = "Custom Builder Bundle";
            
            // Inject selected services into notes field
            notesField.value = `Custom Bundle Selected:\n- ${data.services.join('\n- ')}\nEstimated Cost: $${data.total}`;
            
            // Scroll to booking form
            document.getElementById('booking').scrollIntoView({ behavior: 'smooth' });
        });
    }

    /* ==========================================================================
       7. ACTIVE FAST-BOOKING SERVICE BUTTONS
       ========================================================================== */
    const bookServiceButtons = document.querySelectorAll('.book-service-btn');
    const bookPackageButtons = document.querySelectorAll('.book-package-btn');
    const bookBridalButtons = document.querySelectorAll('.book-bridal-btn');

    const prefillBooking = (serviceName) => {
        // Find option that contains serviceName
        let found = false;
        for (let i = 0; i < serviceSelect.options.length; i++) {
            const opt = serviceSelect.options[i];
            if (opt.value.toLowerCase().includes(serviceName.toLowerCase())) {
                serviceSelect.value = opt.value;
                found = true;
                break;
            }
        }
        
        // If not found in standard values, reset notes and set custom
        if (!found) {
            serviceSelect.value = "Custom Builder Bundle";
            notesField.value = `Requested Treatment: ${serviceName}`;
        } else {
            notesField.value = ""; // Clear notes if standard
        }
        
        // Scroll to form
        document.getElementById('booking').scrollIntoView({ behavior: 'smooth' });
    };

    bookServiceButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const service = btn.getAttribute('data-service');
            prefillBooking(service);
        });
    });

    bookPackageButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const pkg = btn.getAttribute('data-package');
            prefillBooking(pkg);
        });
    });

    bookBridalButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const bridal = btn.getAttribute('data-bridal');
            prefillBooking(bridal);
        });
    });

    /* ==========================================================================
       8. OFFERS DISCOUNT COUNTDOWN TIMER
       ========================================================================== */
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    // Simple countdown timer that resets daily to keep promotion alive
    const updateCountdown = () => {
        const now = new Date();
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
        
        const diff = endOfDay - now; // Time difference in ms
        
        const hrs = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);

        if (hoursEl) hoursEl.textContent = String(hrs).padStart(2, '0');
        if (minutesEl) minutesEl.textContent = String(mins).padStart(2, '0');
        if (secondsEl) secondsEl.textContent = String(secs).padStart(2, '0');
    };

    setInterval(updateCountdown, 1000);
    updateCountdown();

    /* ==========================================================================
       9. CLIPBOARD COPY COUPON CODE
       ========================================================================== */
    const copyBtn = document.getElementById('copy-coupon-btn');
    const couponInput = document.getElementById('coupon-input');
    const successMsg = document.getElementById('copy-success-msg');

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            couponInput.select();
            couponInput.setSelectionRange(0, 99999); // For mobile devices
            
            navigator.clipboard.writeText(couponInput.value).then(() => {
                successMsg.classList.add('show');
                
                setTimeout(() => {
                    successMsg.classList.remove('show');
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy text: ', err);
            });
        });
    }

    /* ==========================================================================
       10. FAQ ACCORDION ACCORDION INTERACTION
       ========================================================================== */
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const trigger = item.querySelector('.faq-trigger');
        const content = item.querySelector('.faq-content');

        trigger.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all items
            faqItems.forEach(faq => {
                faq.classList.remove('active');
                faq.querySelector('.faq-content').style.maxHeight = null;
            });

            // If it wasn't active, open it
            if (!isActive) {
                item.classList.add('active');
                content.style.maxHeight = content.scrollHeight + 'px';
            }
        });
    });

    /* ==========================================================================
       11. WHATSAPP BOOKING INTEGRATION & FORM COMPILER
       ========================================================================== */
    const bookingForm = document.getElementById('appointment-form');
    const successAlert = document.getElementById('booking-success');
    const successText = document.getElementById('booking-success-text');

    // Set minimum date to today
    const dateInput = document.getElementById('booking-date');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);
    }

    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Extract form values
            const name = document.getElementById('booking-name').value.trim();
            const phone = document.getElementById('booking-phone').value.trim();
            const service = document.getElementById('booking-service').value;
            const stylist = document.getElementById('booking-stylist').value;
            const date = document.getElementById('booking-date').value;
            const time = document.getElementById('booking-time').value;
            const notes = document.getElementById('booking-notes').value.trim();
            const useWhatsApp = document.getElementById('whatsapp-redirect').checked;

            // Simple validation
            if (!name || !phone || !service || !date || !time) {
                alert('Please fill out all required fields.');
                return;
            }

            // Compile Booking Details
            const bookingText = `Hello Aura Salon! I would like to reserve an appointment:
- *Name:* ${name}
- *Phone:* ${phone}
- *Service/Package:* ${service}
- *Preferred Stylist:* ${stylist}
- *Date:* ${date}
- *Time:* ${time}
${notes ? `- *Special Notes:* ${notes}` : ''}`;

            if (useWhatsApp) {
                successText.textContent = "Your details are ready! Opening WhatsApp to send your request...";
                successAlert.style.display = 'block';

                // Format WhatsApp API url: 15557892872 is salon simulated phone number
                const waUrl = `https://wa.me/15557892872?text=${encodeURIComponent(bookingText)}`;
                
                // Redirect after brief visual delay
                setTimeout(() => {
                    window.open(waUrl, '_blank');
                    bookingForm.reset();
                    successAlert.style.display = 'none';
                    
                    // Reset calculator checkboxes
                    calcCheckboxes.forEach(cb => cb.checked = false);
                    updateCalculator();
                }, 1500);

            } else {
                // Local booking simulation
                successText.textContent = "Thank you! Your VIP request has been submitted. Our concierge will call you shortly.";
                successAlert.style.display = 'block';

                setTimeout(() => {
                    bookingForm.reset();
                    successAlert.style.display = 'none';
                    
                    // Reset calculator checkboxes
                    calcCheckboxes.forEach(cb => cb.checked = false);
                    updateCalculator();
                }, 3500);
            }
        });
    }

    /* ==========================================================================
       12. HERO SLIDESHOW AUTOSCROLL
       ========================================================================== */
    const heroSlides = document.querySelectorAll('.hero-slide');
    if (heroSlides.length > 0) {
        let currentSlide = 0;
        const slideInterval = 5000; // Switch slide every 5 seconds

        const nextSlide = () => {
            heroSlides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % heroSlides.length;
            heroSlides[currentSlide].classList.add('active');
        };

        setInterval(nextSlide, slideInterval);
    }
});
