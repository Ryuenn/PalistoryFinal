/* Lightweight scroll-reveal: fades content up as it enters the viewport.
   Self-contained — injects its own CSS. Safe to include on any page. */
(function () {
    // --- inject styles ---
    var style = document.createElement('style');
    style.textContent =
        '[data-reveal]{opacity:0;transform:translateY(40px);' +
        'transition:opacity .7s cubic-bezier(.16,1,.3,1),transform .7s cubic-bezier(.16,1,.3,1);' +
        'will-change:opacity,transform;}' +
        '[data-reveal].is-visible{opacity:1;transform:none;}' +
        '@media (prefers-reduced-motion: reduce){[data-reveal]{opacity:1!important;transform:none!important;transition:none!important;}}';
    document.head.appendChild(style);

    // Chrome / off-canvas / already-handled areas we never touch.
    var SKIP = '.th-header, header, .footer-wrapper, footer, .th-hero-wrapper, .breadcumb-wrapper,' +
        ' .swiper, .sidemenu-wrapper, .th-menu-wrapper, .popup-search-box';

    function skip(el) { return !!el.closest(SKIP); }

    var candidates = [];
    var seen = new Set();
    function consider(el) {
        if (!el || seen.has(el) || skip(el)) return;
        seen.add(el);
        candidates.push(el);
    }

    // 1) Curated content blocks (theme cards + section titles).
    var selectors = [
        '.title-area', '.feature-card', '.service-card', '.th-team', '.team-card2',
        '.about-wrap2', '.checklist', '.pillar-card', '.video-card', '.info-card',
        '#sumud-content .max-w-6xl > div'   // SUMUD page sections
    ];
    document.querySelectorAll(selectors.join(',')).forEach(consider);

    // 2) Convert the Tailwind on-load fade to a scroll-triggered one.
    document.querySelectorAll('.animate-fade-in-up').forEach(function (el) {
        el.classList.remove('animate-fade-in-up');
        el.style.animation = 'none';
        el.style.animationDelay = '';
        consider(el);
    });

    // 3) Plain Bootstrap pages (About, Contact): reveal leaf content columns.
    document.querySelectorAll('.container [class*="col-"]').forEach(function (col) {
        if (col.querySelector('[class*="col-"]')) return; // wrapper column, skip
        consider(col);
    });

    // Drop anything nested inside another candidate so we don't double-hide.
    var nodes = candidates.filter(function (el) {
        return !candidates.some(function (other) { return other !== el && other.contains(el); });
    });
    if (!nodes.length) return;

    // Stagger items that share a row/parent so they cascade in.
    var groups = new Map();
    nodes.forEach(function (el) {
        var key = el.closest('.row') || el.parentNode;
        var arr = groups.get(key) || [];
        arr.push(el);
        groups.set(key, arr);
    });
    groups.forEach(function (arr) {
        if (arr.length > 1) arr.forEach(function (el, i) { el.style.transitionDelay = (i * 0.1) + 's'; });
    });

    nodes.forEach(function (el) { el.setAttribute('data-reveal', ''); });

    if (!('IntersectionObserver' in window)) {
        nodes.forEach(function (el) { el.classList.add('is-visible'); });
        return;
    }
    var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
            if (e.isIntersecting) {
                e.target.classList.add('is-visible');
                io.unobserve(e.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -8% 0px' });
    nodes.forEach(function (el) { io.observe(el); });
})();
