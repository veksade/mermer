document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Navigation Scroll Effect
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 2. Mobile Menu Toggle
    const mobileMenu = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenu) {
        mobileMenu.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // Close menu when clicking a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });

    // 3. Before/After Slider Logic
    const slider = document.querySelector('.ba-slider');
    const beforeImage = document.querySelector('.ba-image.before');
    const handle = document.querySelector('.ba-handle');
    
    if (slider && beforeImage && handle) {
        let isResizing = false;

        const setSliderPosition = (clientX) => {
            const rect = slider.getBoundingClientRect();
            let x = clientX - rect.left;
            let percent = (x / rect.width) * 100;
            
            percent = Math.max(1, Math.min(99, percent));
            
            beforeImage.style.width = `${percent}%`;
            handle.style.left = `${percent}%`;
        };

        const onMove = (e) => {
            if (!isResizing) return;
            let x;
            if (e.type.includes('touch')) {
                x = e.touches[0].clientX;
            } else {
                x = e.clientX;
            }
            if (x !== undefined) setSliderPosition(x);
        };

        const onStart = (e) => {
            isResizing = true;
            let x;
            if (e.type.includes('touch')) {
                x = e.touches[0].clientX;
            } else {
                x = e.clientX;
            }
            if (x !== undefined) setSliderPosition(x);
            if (e.cancelable) e.preventDefault();
        };

        const onEnd = () => isResizing = false;

        slider.addEventListener('mousedown', onStart);
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onEnd);

        slider.addEventListener('touchstart', onStart, { passive: false });
        window.addEventListener('touchmove', onMove, { passive: false });
        window.addEventListener('touchend', onEnd);
        
        const centerSlider = () => {
            const rect = slider.getBoundingClientRect();
            if (rect.width > 0) setSliderPosition(rect.left + rect.width / 2);
        };
        
        window.addEventListener('load', centerSlider);
        window.addEventListener('resize', centerSlider);
        setTimeout(centerSlider, 800);
    }

    // 4. Reveal Animations on Scroll
    const reveals = document.querySelectorAll('.reveal, .reveal-up, .reveal-scale');
    
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15
    });

    reveals.forEach(reveal => {
        revealObserver.observe(reveal);
    });

    // iOS Safari / Failsafe: Eğer 1.5 saniye içinde animasyon tetiklenmezse zorla göster
    window.addEventListener('load', () => {
        setTimeout(() => {
            document.querySelectorAll('.reveal, .reveal-up, .reveal-scale').forEach(el => {
                if (!el.classList.contains('active')) {
                    el.classList.add('active');
                }
            });
        }, 1500);
    });

    // Add animation classes to reveal-up manually for effect
    document.querySelectorAll('.reveal-up').forEach((el, index) => {
        el.style.transitionDelay = `${index * 0.1}s`;
    });

    // 5. Gallery Tab Filtering
    const tabBtns = document.querySelectorAll('.tab-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    if (tabBtns.length > 0 && galleryItems.length > 0) {
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const category = btn.getAttribute('data-category');
                galleryItems.forEach(item => {
                    if (category === 'all' || item.getAttribute('data-category') === category) {
                        item.style.display = 'block';
                        item.classList.remove('hidden');
                    } else {
                        item.style.display = 'none';
                        item.classList.add('hidden');
                    }
                });
            });
        });
    }

    // 6. Lightbox Functionality
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxVideo = document.getElementById('lightbox-video');
    const closeLightbox = document.querySelector('.close-lightbox');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const galleryGrid = document.querySelector('.gallery-grid');

    let currentItems = []; 
    let currentIndex = 0;

    const updateLightboxMedia = (index) => {
        if (!currentItems[index]) return;
        currentIndex = index;
        const item = currentItems[currentIndex];
        const isVideo = item.classList.contains('video');
        
        let mediaSrc = "";
        if (isVideo) {
            const videoElem = item.querySelector('video');
            const sourceElem = item.querySelector('source');
            mediaSrc = sourceElem ? sourceElem.src : (videoElem ? videoElem.src : "");
        } else {
            mediaSrc = item.querySelector('img').src;
        }

        if (isVideo) {
            lightboxVideo.style.display = 'block';
            lightboxImg.style.display = 'none';
            lightboxVideo.src = mediaSrc;
            lightboxVideo.load();
            
            // Try to play - handle potential browser blocks
            const playPromise = lightboxVideo.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.log("Auto-play was prevented. Providing controls.");
                    lightboxVideo.muted = true;
                    lightboxVideo.play();
                });
            }
        } else {
            if (lightboxVideo) lightboxVideo.pause();
            lightboxVideo.style.display = 'none';
            lightboxImg.style.display = 'block';
            lightboxImg.src = mediaSrc;
        }
    };

    // Use a combined approach: Delegation + direct check
    if (galleryGrid && lightbox) {
        lightbox.style.zIndex = '9999';
        galleryGrid.addEventListener('click', (e) => {
            const targetItem = e.target.closest('.gallery-item');
            if (targetItem) {
                const activeCategoryBtn = document.querySelector('.tab-btn.active');
                const activeCategory = activeCategoryBtn ? activeCategoryBtn.getAttribute('data-category') : 'all';
                currentItems = Array.from(galleryItems).filter(i => 
                    activeCategory === 'all' || i.getAttribute('data-category') === activeCategory
                );
                
                const itemIdx = currentItems.indexOf(targetItem);
                if (itemIdx !== -1) {
                    updateLightboxMedia(itemIdx);
                    lightbox.classList.add('active');
                    document.body.style.overflow = 'hidden'; 
                }
            }
        });
    }

    const closeLightboxFunc = () => {
        if (lightbox) {
            lightbox.classList.remove('active');
            lightboxVideo.pause();
            document.body.style.overflow = 'auto'; 
        }
    };

    if (prevBtn) prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        let newIndex = currentIndex - 1;
        if (newIndex < 0) newIndex = currentItems.length - 1;
        updateLightboxMedia(newIndex);
    });

    if (nextBtn) nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        let newIndex = currentIndex + 1;
        if (newIndex >= currentItems.length) newIndex = 0;
        updateLightboxMedia(newIndex);
    });

    if (closeLightbox) closeLightbox.addEventListener('click', closeLightboxFunc);
    if (lightbox) lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target.classList.contains('lightbox-nav')) {
            closeLightboxFunc();
        }
    });

    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'ArrowRight') nextBtn.click();
        if (e.key === 'ArrowLeft') prevBtn.click();
        if (e.key === 'Escape') closeLightboxFunc();
    });

    // 6. Smooth Scroll Reveal Logic (Adding CSS classes via JS for variety)
    const style = document.createElement('style');
    style.innerHTML = `
        .reveal-up {
            opacity: 0;
            transform: translateY(50px);
            transition: all 0.8s cubic-bezier(0.165, 0.84, 0.44, 1);
        }
        .reveal-up.active {
            opacity: 1;
            transform: translateY(0);
        }
        .reveal-scale {
            opacity: 0;
            transform: scale(0.95);
            transition: all 1s cubic-bezier(0.165, 0.84, 0.44, 1);
        }
        .reveal-scale.active {
            opacity: 1;
            transform: scale(1);
        }
        .reveal-delay {
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.8s ease-out 0.3s;
        }
        .reveal-delay.active {
            opacity: 1;
            transform: translateY(0);
        }
        .reveal-delay-2 {
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.8s ease-out 0.6s;
        }
        .reveal-delay-2.active {
            opacity: 1;
            transform: translateY(0);
        }
        #home .reveal, #home .reveal-delay, #home .reveal-delay-2 {
            opacity: 1;
            transform: none;
        }
    `;
    document.head.appendChild(style);

    // Trigger hero animations immediately
    setTimeout(() => {
        document.querySelectorAll('#home .reveal, #home .hero-divider, #home .reveal-delay, #home .reveal-delay-2, #home .reveal-delay-3').forEach(el => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        });
    }, 100);

});
