(() => {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Smooth scroll with offset for sticky nav
  const nav = document.querySelector('.cocoa-nav');
  const navHeight = () => (nav ? nav.getBoundingClientRect().height : 0);

  document.addEventListener('click', (e) => {
    const a = e.target && e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!a) return;

    const href = a.getAttribute('href');
    if (!href || href === '#') return;

    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();

    const top = window.scrollY + target.getBoundingClientRect().top - navHeight() - 10;
    window.scrollTo({ top, behavior: 'smooth' });

    // Close mobile nav after click
    const navCollapse = document.getElementById('nav');
    if (navCollapse && navCollapse.classList.contains('show') && window.bootstrap) {
      const bsCollapse = bootstrap.Collapse.getOrCreateInstance(navCollapse);
      bsCollapse.hide();
    }
  });

  // Active link highlighting
  const sections = ['#latest', '#value', '#waitlist']
    .map((id) => document.querySelector(id))
    .filter(Boolean);

  const navLinks = Array.from(document.querySelectorAll('.navbar .nav-link'));

  const setActive = (id) => {
    navLinks.forEach((l) => {
      const href = l.getAttribute('href');
      l.classList.toggle('active', href === id);
    });
  };

  if ('IntersectionObserver' in window && sections.length) {
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((en) => en.isIntersecting)
          .sort((a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0))[0];
        if (visible && visible.target && visible.target.id) setActive(`#${visible.target.id}`);
      },
      { rootMargin: `-${Math.round(navHeight() + 20)}px 0px -60% 0px`, threshold: [0.15, 0.25, 0.4] }
    );

    sections.forEach((s) => io.observe(s));
  }

  // Waitlist forms (hero + bottom)
  const forms = ['heroWaitlist', 'bottomWaitlist'].map(id => document.getElementById(id)).filter(Boolean);

  forms.forEach(form => {
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
      }

      const data = Object.fromEntries(new FormData(form).entries());
      const statusEl = form.querySelector('.form-status');

      if (statusEl) {
        statusEl.textContent = `Thanks${data.email ? ', ' + data.email : ''} — you're on the waitlist. We'll send briefs soon.`;
        statusEl.style.color = 'var(--gold)';
      }

      form.reset();
      form.classList.remove('was-validated');
    });
  });

  // Feedback Form Handling
  const feedbackForm = document.getElementById('feedbackForm');
  const feedbackStatus = document.getElementById('feedbackStatus');

  if (feedbackForm) {
    // Star Rating Logic
    const ratingStars = document.querySelectorAll('.star-btn');
    const ratingInput = document.getElementById('ratingValue');
    let currentRating = 0;

    ratingStars.forEach((star, index) => {
      star.addEventListener('click', () => {
        currentRating = index + 1;
        if (ratingInput) ratingInput.value = currentRating;
        updateStars(currentRating);
      });

      star.addEventListener('mouseenter', () => {
        updateStars(index + 1, true);
      });
    });

    document.querySelector('.rating-stars')?.addEventListener('mouseleave', () => {
      updateStars(currentRating);
    });

    function updateStars(rating, isHover = false) {
      ratingStars.forEach((star, index) => {
        star.classList.toggle('active', index < rating);
        star.style.opacity = isHover && index >= rating ? '0.5' : '1';
      });
    }

    // Form Submission
    feedbackForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!feedbackForm.checkValidity()) {
        feedbackForm.classList.add('was-validated');
        if (feedbackStatus) {
          feedbackStatus.textContent = 'Please complete all required fields.';
          feedbackStatus.style.color = '#ef4444';
        }
        return;
      }

      if (currentRating === 0) {
        if (feedbackStatus) {
          feedbackStatus.textContent = 'Please provide a star rating.';
          feedbackStatus.style.color = '#ef4444';
        }
        return;
      }

      // Show loading state
      const submitBtn = feedbackForm.querySelector('button[type="submit"]');
      const spinner = submitBtn?.querySelector('.spinner-border');
      const btnText = submitBtn?.querySelector('.submit-text');

      if (submitBtn) submitBtn.disabled = true;
      if (spinner) spinner.classList.remove('d-none');
      if (btnText) btnText.textContent = 'Submitting...';

      // Collect form data
      const formData = new FormData(feedbackForm);
      const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        role: formData.get('role'),
        rating: currentRating,
        categories: formData.getAll('categories'),
        feedback: formData.get('feedback'),
        features: formData.get('features'),
        priority: formData.get('priority'),
        submittedAt: new Date().toISOString(),
        source: window.location.href
      };

      try {
        // NOTE: Replace this with your actual Airtable API endpoint
        // For now, simulate a successful submission
        await simulateAirtableSubmission(data);

        if (feedbackStatus) {
          feedbackStatus.innerHTML = `
            <div class="alert alert-success" role="alert">
              <strong>Thank you for your feedback!</strong><br>
              We appreciate your input and will review it shortly. You'll receive a confirmation email at ${data.email}.
            </div>
          `;
        }

        feedbackForm.reset();
        currentRating = 0;
        updateStars(0);
        feedbackForm.classList.remove('was-validated');

      } catch (error) {
        console.error('Submission error:', error);
        if (feedbackStatus) {
          feedbackStatus.innerHTML = `
            <div class="alert alert-danger" role="alert">
              <strong>Submission failed.</strong> Please try again or email us directly at 
              <a href="mailto:team@cocoamarketintel.com">team@cocoamarketintel.com</a>.
            </div>
          `;
        }
      } finally {
        if (submitBtn) submitBtn.disabled = false;
        if (spinner) spinner.classList.add('d-none');
        if (btnText) btnText.textContent = 'Submit Feedback';
      }
    });
  }

  // Simulate Airtable submission (replace with actual API call)
  async function simulateAirtableSubmission(data) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Log to console for debugging
    console.log('Feedback submitted:', data);

    // TODO: Replace with actual Airtable API integration
    // Example using fetch:
    // const response = await fetch('https://api.airtable.com/v0/YOUR_BASE_ID/Feedback', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': 'Bearer YOUR_API_KEY',
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({ fields: data })
    // });
    // if (!response.ok) throw new Error('Airtable submission failed');

    return { success: true };
  }

  // Optional: subtle ticker animations on hover
  const tickers = document.querySelectorAll('.ticker-card');
  tickers.forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'scale(1.02)';
      card.style.transition = 'transform 0.2s';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'scale(1)';
    });
  });
})();
