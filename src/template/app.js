/*! ------------------------------------------------
 * Project Name: Azurio - Digital Agency & Personal Portfolio HTML Template
 * Project Description: Stand out and express your uniqueness with Azurio - a vibrant and minimal HTML template for creatives, studios and freelancers. Impress your website visitors with a clean, stylish layout and stunning visuals.
 * Tags: mix_design, resume, portfolio, personal page, cv, template, one page, responsive, html5, css3, creative, clean, agency, studio
 * Version: 1.0.0
 * Build Date: March 2026
 * Last Update: March 2026
 * This product is available exclusively on Themeforest
 * Author: mix_design
 * Author URI: https://themeforest.net/user/mix_design
 * File name: app.js
 * ------------------------------------------------

 * ------------------------------------------------
 * Table of Contents
 * ------------------------------------------------
 *
 *  01. Base - Inits
 *  02. Base - Loader & Pages Transition
 *  03. Base - SplitText Animations
 *  04. Base - Get Users Device Type
 *  05. Base - Viewport Height Detection
 *  06. Base - Menu & Hamburger
 *  07. Global Effect - Cursor
 *  08. Global Effect - Header Scroll Behavior
 *  09. Global Effect - Blur
 *  10. Global Effect - Sections Pinning
 *  11. Global Effect - Scroll to Top
 *  12. Global Effect - Smooth Anchor Scroll
 *  13. Animation - Gravity (Matter.js)
 *  14. Animation - Cursor Trail Effect
 *  15. Animation - Cursor Trail Transparent Effect
 *  16. Animation - Text Scramble Effect
 *  17. Animation - Preview Hover Slideshow
 *  18. Animation - Scroll Animation for Stats
 *  19. Showcase - Projects Stacking Cards Demo
 *  20. Showcase - Services Stacking Cards
 *  21. Showcase - Landing Stacking Cards
 *  22. Showcase - Projects ClipPath Demo
 *  23. Marquee - Two Lines
 *  24. Marquee - One Line To Right
 *  25. Marquee - One Line To Left
 *  26. Divider - Scroll-Driven Clip-Path Reveal
 *  27. Divider - Sticky Caption
 *  28. Animation - Common Animations
 *  29. Parallax - Ukiyo Images & Video
 *  30. Animation - Perspective List
 *  31. Swiper Slider - Testimonials
 *  32. Swiper Slider - Inner Pages Demo
 *  33. Jquery - Jquery Dependent Components
 *  34. Next Project Arrow – Scroll-Connected Transition
 *  35. Color Switch
 *  36. Hero Scaling Video
 *  37. Hero Portrait/Landscape Video Swap
 *  38. Hero 3D Images on Scroll
 *  39. Hero Inertia
 *  40. Hero Horizontal Slider
 *  41. Hero Banners Hover Animation
 *  42. Hero Typed.js Plugin Settings
 *
 * ------------------------------------------------
 * Table of Contents End
 * ------------------------------------------------ */
// Split line layout shares the viewport transaction instead of separate observer timers.
function mxdSplitText(target, options) {
  const split = SplitText.create(target, { ...options, autoSplit: false });
  const elements = split.elements;
  let width = window.innerWidth;
  let sizes = elements.map(element => element.offsetWidth);
  const unprepare = window.portfolioViewport.prepare(() => {
    const nextSizes = elements.map(element => element.offsetWidth);
    const nextWidth = window.innerWidth;
    if (nextWidth === width && nextSizes.every((size, i) => size === sizes[i])) return;
    return () => {
      width = nextWidth; sizes = nextSizes;
      split.split();
    };
  });
  window.portfolioViewport.cleanup(() => { unprepare(); split.revert(); });
  return split;
}
function mxdLoader() {
  const e = document.querySelector("body"),
    t = imagesLoaded(e),
    o = document.querySelector(".mxd-page-transition"),
    r = document.querySelector(".mxd-loader");
  if (!o || !r) return;
  const n = performance.getEntriesByType("navigation")[0],
    a = "reload" === (n ? n.type : "navigate");
  if (
    (function () {
      try {
        return sessionStorage.getItem("mxd-visited");
      } catch (e) {
        return null;
      }
    })() &&
    !a
  )
    return mxdPageTransition(), void document.fonts.ready.then(pageAppearance);
  !(function () {
    try {
      sessionStorage.setItem("mxd-visited", "true");
    } catch (e) {}
  })(),
    (r.style.display = "flex"),
    startLoader().play(),
    Promise.all([
      new Promise((e) => t.on("always", e)),
      document.fonts.ready,
      new Promise((e) => setTimeout(e, 1200)),
    ]).then(() => {
      gsap
        .timeline()
        .add(hideLoader())
        .add(() => {
          (r.style.display = "none"), mxdPageTransition(), pageAppearance(), window.portfolioViewport.requestRefresh();
        });
    });
}
function mxdPageTransition() {
  const e = document.querySelector(".mxd-page-transition");
  gsap.to(e, {
    y: "-100%",
    duration: 0.7,
    ease: "hop",
  }),
    document.querySelectorAll("a[href]").forEach((t) => {
      const o = t.getAttribute("href");
      !o ||
        o.startsWith("#") ||
        o.startsWith("mailto") ||
        o.startsWith("tel") ||
        "_blank" === t.target ||
        t.hasAttribute("download") ||
        t.addEventListener("click", (o) => {
          const r = t.href;
          o.preventDefault(),
            gsap.set(e, {
              y: "100%",
            }),
            gsap.to(e, {
              y: "0%",
              duration: 0.7,
              ease: "hop",
              onComplete: () => {
                window.location.href = r;
              },
            });
        });
    });
}
document.addEventListener("DOMContentLoaded", () => {
  const e = new Lenis({ autoResize: false });
  window.portfolioViewport.setLenis(e);
  const tick = t => e.raf(1e3 * t);
  window.portfolioViewport.cleanup(() => { gsap.ticker.remove(tick); e.destroy(); });
  ScrollTrigger.config({ autoRefreshEvents: "none", ignoreMobileResize: true, limitCallbacks: true });
  document.fonts.ready.then(() => window.portfolioViewport.requestRefresh());
  window.addEventListener("load", () => window.portfolioViewport.requestRefresh(), { once: true });
  e.on("scroll", ScrollTrigger.update),
    gsap.ticker.add(tick),
    gsap.ticker.lagSmoothing(0),
    gsap.registerPlugin(
      ScrollTrigger,
      CustomEase,
      SplitText,
      Flip,
      ScrollToPlugin,
      InertiaPlugin,
    ),
    CustomEase.create("hop", ".87, 0, .13, 1"),
    CustomEase.create("common", ".23, .65, .74, 1.09"),
    window.portfolioViewport.requestRefresh(),
    mxdLoader();
  let t = null;
  document.fonts.ready.then(() => {
    (t = mxdMenu(e)), mxdTypeAnimations(), mxdProjectsStack(), mxdServicesStack(), mxdLandingStack();
    window.portfolioViewport.requestRefresh();
  }),
    mxdHeroVideoScale(),
    mxdHeroVideoSwap(),
    mxdHero3dImages(),
    mxdHeroInertia(),
    mxdHeroHorizontal(),
    mxdHeroTyped(),
    mxdBlur(),
    mxdProjectsClip(),
    mxdDvStickyMedia(),
    mxdDvStickyCaption(),
    mxdPin(),
    mxdToTop(),
    mxdSmoothScroll(),
    mxdGravity(),
    mxdStats(),
    mxdPerspectiveList(),
    mxdViewportHeight(),
    mxdColorSwitcher(),
    matchMedia("(hover: hover) and (pointer: fine)").matches
      ? (mxdCursor(),
        mxdCursorTrail(),
        mxdCursorTrailTr(),
        mxdTextScramble(),
        mxdHoverSlideshow(),
        mxdHeroBannersHover())
      : (document.getElementById("mxd-cursor").style.display = "none"),
    window.addEventListener("pageshow", (e) => {
      const o = performance.getEntriesByType("navigation")[0],
        r = o && "back_forward" === o.type;
      if (e.persisted || r) {
        const e = document.querySelector(".mxd-page-transition");
        e &&
          gsap.set(e, {
            y: "-100%",
          }),
          t?.resetMenu();
      }
    });
});
let imageCycleTl = null;
function startLoader() {
  const e = document.querySelector(".mxd-loader__images"),
    t = e.querySelectorAll("img"),
    o = document.querySelector(".count__text");
  let r = 0;
  const n = gsap.timeline();
  return (
    n.to(e, {
      clipPath: "polygon(100% 0%, 100% 100%, 0% 100%, 0% 0%)",
      duration: 0.6,
      ease: "hop",
    }),
    n.to(
      {},
      {
        duration: 1.2,
        onUpdate: function () {
          (r = Math.min(Math.floor(100 * this.progress()), 100)),
            (o.textContent = r);
        },
      },
      0,
    ),
    n.add(() => {
      gsap.set(t, {
        opacity: 0,
        force3D: !0,
      }),
        (imageCycleTl = gsap.timeline({
          repeat: -1,
        })),
        t.forEach((e, o) => {
          imageCycleTl
            .set(t, {
              opacity: 0,
            })
            .set(e, {
              opacity: 1,
            })
            .to(
              {},
              {
                duration: 0.14,
              },
            );
        });
    }, 0),
    n
  );
}
function hideLoader() {
  return gsap
    .timeline({
      onStart: () => {
        imageCycleTl && (imageCycleTl.kill(), (imageCycleTl = null));
      },
    })
    .to(".mxd-loader__images", {
      clipPath: "polygon(100% 0%, 100% 0%, 0% 0%, 0% 0%)",
      duration: 0.6,
      ease: "hop",
    })
    .to(
      ".mxd-loader__top, .mxd-loader__bottom",
      {
        opacity: 0,
        duration: 0.4,
      },
      0,
    );
}
function pageAppearance() {
  const e = document.querySelector(".loading-wrap"),
    t = e ? e.querySelectorAll(".loading-item") : [],
    o = e ? e.querySelectorAll(".loading-split") : [],
    r = e ? e.querySelectorAll(".loading-chars") : [],
    n = document.querySelectorAll(".loading-fade");
  r.forEach((e) => {
    mxdSplitText(e, {
      type: "chars, words",
      charsClass: "char",
      mask: "chars",
      smartWrap: !0,
      aria: "none",
      onSplit: (e) => {
        return gsap.from(e.chars, {
          yPercent: 100,
          autoAlpha: 0,
          duration: 0.6,
          stagger: {
            amount: 0.3,
          },
        });
      },
    });
  }),
    o.forEach((e) => {
      mxdSplitText(e, {
        type: "words, lines",
        linesClass: "line",
        autoSplit: !0,
        mask: "lines",
        aria: "none",
        onSplit: (e) => {
          return gsap.from(e.lines, {
            yPercent: 100,
            rotation: 1,
            duration: 0.6,
            stagger: {
              amount: 0.2,
            },
          });
        },
      });
    }),
    t.length &&
      (gsap.set(t, {
        opacity: 0,
      }),
      gsap.to(t, {
        duration: 0.3,
        ease: "none",
        startAt: {
          y: 10,
        },
        y: 0,
        opacity: 1,
        delay: 0.6,
        stagger: 0.08,
      })),
    n.length &&
      (gsap.set(n, {
        opacity: 0,
      }),
      gsap.to(n, {
        duration: 0.8,
        ease: "none",
        opacity: 1,
        delay: 1,
      }));
}
function mxdTypeAnimations() {
  document.querySelectorAll(".reveal-type").forEach((e, t) => {
    const o = new SplitType(e, {
      types: "words, chars",
    });
    gsap.from(o.chars, {
      scrollTrigger: {
        trigger: e,
        start: "top bottom",
        end: "top 60%",
        scrub: 2,
      },
      opacity: 0,
      filter: "blur(10px)",
      stagger: 0.05,
    });
  }),
    document.querySelectorAll(".mxd-split-lines").forEach((e) => {
      mxdSplitText(e, {
        type: "words, lines",
        linesClass: "line",
        autoSplit: !0,
        mask: "lines",
        aria: "none",
        onSplit: (t) =>
          gsap
            .timeline({
              scrollTrigger: {
                trigger: e,
                start: "top bottom",
                end: "top 90%",
                toggleActions: "none play none reset",
              },
            })
            .from(t.lines, {
              yPercent: 100,
              rotation: 1,
              duration: 0.5,
              stagger: {
                amount: 0.2,
              },
            }),
      });
    }),
    document.querySelectorAll(".mxd-split-lines-reverse").forEach((e) => {
      mxdSplitText(e, {
        type: "words, lines",
        linesClass: "line",
        autoSplit: !0,
        mask: "lines",
        aria: "none",
        onSplit: (t) =>
          gsap
            .timeline({
              scrollTrigger: {
                trigger: e,
                start: "top bottom",
                end: "top 90%",
                toggleActions: "none play none reset",
              },
            })
            .from(t.lines, {
              yPercent: -100,
              rotation: 1,
              duration: 0.5,
              stagger: {
                amount: 0.1,
              },
            }),
      });
    }),
    document.querySelectorAll(".anim-uni-chars").forEach((e) => {
      mxdSplitText(e, {
        type: "chars, words",
        charsClass: "char",
        mask: "chars",
        smartWrap: !0,
        aria: "none",
        onSplit: (t) => {
          return gsap
            .timeline({
              scrollTrigger: {
                trigger: e,
                start: "top bottom",
                end: "top 80%",
                toggleActions: "none play none reset",
                ease: "common",
              },
            })
            .from(t.chars, {
              yPercent: 100,
              autoAlpha: 0,
              duration: 0.6,
              stagger: {
                amount: 0.3,
              },
            });
        },
      });
    });
}
function deviceType() {
  const e = navigator.userAgent;
  return /(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(e)
    ? "tablet"
    : /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
          e,
        )
      ? "mobile"
      : "desktop";
}
function mxdViewportHeight() {
  if (CSS.supports('height', '100dvh')) {
    document.documentElement.style.setProperty('--vh', '1dvh');
    return;
  }
  let lastHeight = 0;
  const update = ({ height }) => {
    if (height === lastHeight) return;
    lastHeight = height;
    document.documentElement.style.setProperty('--vh', `${height * 0.01}px`);
  };
  update(window.portfolioViewport.getSnapshot());
  window.portfolioViewport.subscribe(update);
}
function mxdMenu(e) {
  const t = document.querySelector(".mxd-menu__toggle"),
    o = document.querySelector(".mxd-menu__overlay"),
    r = document.querySelector(".mxd-menu__backdrop");
  if ((document.querySelector(".mxd-app"), !t || !o)) return;
  const n = document.querySelector(".mxd-menu__content"),
    a = document.querySelector(".menu-media__wrapper"),
    s = document.querySelector(".mxd-menu__hamburger"),
    i = document.querySelectorAll(
      ".menu-logo__text span, .mxd-menu__caption p",
    ),
    c = document.querySelectorAll(".main-menu__link span"),
    l = document.querySelectorAll(".menu-contact a"),
    d = document.querySelectorAll(".menu-data__text, .menu-data__text a"),
    p = document.querySelectorAll(".main-menu__divider"),
    u = document.querySelectorAll(".main-menu__arrow");
  function m(e) {
    return e.length
      ? [...e].map((e) => {
          const t = mxdSplitText(e, {
            type: "lines",
            mask: "lines",
            linesClass: "line",
            aria: "none",
            onSplit: split => gsap.set(split.lines, { y: "-114%" }),
          });
          return (
            gsap.set(t.lines, {
              y: "-114%",
            }),
            t
          );
        })
      : [];
  }
  const g = m(i),
    h = m(c),
    y = m(l),
    x = m(d);
  p.length && gsap.set(p, {
    clipPath: "inset(0% 100% 0% 0%)",
  }),
    u.length && gsap.set(u, {
      opacity: 0,
    }),
    gsap.set(a, {
      scale: 1.4,
    });
  let f = !1,
    S = !1;
  return (
    t.addEventListener("click", (t) => {
      if ((t.preventDefault(), S)) return;
      const i = gsap.timeline({
        onStart: () => {
          S = !0;
        },
        onComplete: () => {
          S = !1;
        },
      });
      if (f)
        s?.classList.remove("active"),
          i
            .to(o, {
              clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
              duration: 1,
              ease: "hop",
            })
            .to(
              r,
              {
                background: "rgba(var(--base-rgb), 0)",
                backdropFilter: "blur(0px)",
                duration: 1,
                ease: "power2.in",
              },
              "<",
            )
            .to(
              n,
              {
                yPercent: -50,
                duration: 1,
                ease: "hop",
              },
              "<",
            )
            .call(() => {
              [...g, ...h, ...y, ...x].forEach((e) =>
                gsap.set(e.lines, {
                  y: "-114%",
                }),
              ),
                gsap.set(p, {
                  clipPath: "inset(0% 100% 0% 0%)",
                }),
                gsap.set(u, {
                  opacity: 0,
                }),
                gsap.set(a, {
                  scale: 1.4,
                }),
                document.querySelectorAll(".submenu").forEach((e) => {
                  e.style.display = "none";
                }),
                document
                  .querySelectorAll(".main-menu__item.open")
                  .forEach((e) => {
                    e.classList.remove("open");
                  }),
                e?.start();
            }),
          (f = !1);
      else {
        e?.stop(), s?.classList.add("active");
        const t = window.matchMedia("(max-width: 1024px)").matches;
        i
          .to(r, {
            background: t
              ? "rgba(var(--base-rgb), 0.6)"
              : "rgba(var(--base-rgb), 0.8)",
            backdropFilter: t ? "blur(6px)" : "blur(14px)",
            duration: 0.5,
            ease: "power2.out",
          })
          .to(
            o,
            {
              clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
              duration: 1,
              ease: "hop",
            },
            "<",
          )
          .to(
            n,
            {
              yPercent: 0,
              duration: 1,
              ease: "hop",
            },
            "<",
          )
          .to(
            a,
            {
              scale: 1,
              duration: 0.75,
              ease: "power2.out",
            },
            0.5,
          )
          .to(
            x.flatMap((e) => e.lines),
            {
              y: "0%",
              stagger: -0.05,
              ease: "hop",
              duration: 0.75,
            },
            0.15,
          )
          .to(
            h.flatMap((e) => e.lines),
            {
              y: "0%",
              stagger: -0.05,
              ease: "hop",
              duration: 0.75,
            },
            0.15,
          )
          .to(
            p,
            {
              clipPath: "inset(0% 0% 0% 0%)",
              stagger: -0.05,
              ease: "hop",
              duration: 0.75,
            },
            0.15,
          )
          .to(
            y.flatMap((e) => e.lines),
            {
              y: "0%",
              stagger: -0.05,
              ease: "hop",
              duration: 0.75,
            },
            0.15,
          )
          .to(
            g.flatMap((e) => e.lines),
            {
              y: "0%",
              stagger: -0.05,
              ease: "hop",
              duration: 0.75,
            },
            0.45,
          )
          .to(
            u,
            {
              opacity: 1,
              stagger: -0.05,
              ease: "hop",
              duration: 0.75,
            },
            0.45,
          ),
          (f = !0);
      }
    }),
    {
      resetMenu: function () {
        gsap.set(o, {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
        }),
          gsap.set(r, {
            background: "rgba(var(--base-rgb), 0)",
            backdropFilter: "blur(0px)",
          }),
          gsap.set(n, {
            yPercent: -50,
          }),
          gsap.set(a, {
            scale: 1.4,
          }),
          [...g, ...h, ...y, ...x].forEach((e) =>
            gsap.set(e.lines, {
              y: "-114%",
            }),
          ),
          gsap.set(p, {
            clipPath: "inset(0% 100% 0% 0%)",
          }),
          gsap.set(u, {
            opacity: 0,
          }),
          s?.classList.remove("active"),
          document.querySelectorAll(".submenu").forEach((e) => {
            e.style.display = "none";
          }),
          document.querySelectorAll(".main-menu__item.open").forEach((e) => {
            e.classList.remove("open");
          }),
          (f = !1),
          (S = !1),
          e?.start();
      },
    }
  );
}
function mxdCursor() {
  const e = document.getElementById("mxd-cursor");
  if (!e) return;
  const t = document.getElementById("mxd-cursor__dot"),
    o = document.getElementById("mxd-cursor__text"),
    r = document.getElementById("mxd-cursor__image"),
    n =
      (document.getElementById("mxd-cursor__image-tr"),
      document.querySelectorAll(".active-cursor-image")),
    a = document.querySelectorAll(".active-cursor-image-tr"),
    s = document.querySelectorAll(".active-cursor-permanent"),
    i = document.querySelectorAll(".active-cursor-accent"),
    c = document.querySelectorAll(".active-cursor"),
    l = document.querySelectorAll(".bg-color-opposite"),
    d = document.querySelectorAll(".btn-link");
  let previousX = 0;
  const setX = gsap.quickSetter(e, 'x', 'px');
  const setY = gsap.quickSetter(e, 'y', 'px');
  const setScale = gsap.quickSetter(e, 'scale');
  const rotate = gsap.quickTo(r, 'rotation', { duration: 0.3, ease: 'power1.out' });
  const pointer = event => {
    if (!matchMedia('(hover: hover) and (pointer: fine) and (min-width: 768px)').matches || document.hidden) return;
    setX(event.clientX); setY(event.clientY);
    setScale(1);
    rotate(gsap.utils.clamp(-6, 6, (event.clientX - previousX) * 0.5));
    previousX = event.clientX;
  };
  const cursorMedia = matchMedia('(hover: hover) and (pointer: fine) and (min-width: 768px)');
  const cursorVisibility = () => { e.style.display = cursorMedia.matches ? '' : 'none'; };
  cursorVisibility(); cursorMedia.addEventListener('change', cursorVisibility);
  window.portfolioViewport.cleanup(() => cursorMedia.removeEventListener('change', cursorVisibility));
  window.addEventListener('pointermove', pointer, { passive: true });
  window.portfolioViewport.cleanup(() => window.removeEventListener('pointermove', pointer));
    document.addEventListener("mouseleave", () => {
      gsap.to(e, {
        duration: 0.4,
        ease: "power1.in",
        scale: 0,
      }),
        gsap.to(r, {
          rotation: 0,
          duration: 0.3,
          ease: "power1.in",
        });
    }),
    c.forEach((e) => {
      e.addEventListener("mouseenter", () => {
        (o.innerText = e.dataset.cursorText || ""),
          o.classList.add("show"),
          t.classList.add("active", "expand");
      }),
        e.addEventListener("mouseleave", () => {
          o.classList.remove("show"), t.classList.remove("active", "expand");
        });
    }),
    s.forEach((e) => {
      e.addEventListener("mouseenter", () => {
        (o.innerText = e.dataset.cursorText || ""),
          o.classList.add("show", "permanent"),
          t.classList.add("active-permanent", "expand");
      }),
        e.addEventListener("mouseleave", () => {
          o.classList.remove("show", "permanent"),
            t.classList.remove("active-permanent", "expand");
        });
    }),
    i.forEach((e) => {
      e.addEventListener("mouseenter", () => {
        (o.innerText = e.dataset.cursorText || ""),
          o.classList.add("show", "accent"),
          t.classList.add("active-accent", "expand");
      }),
        e.addEventListener("mouseleave", () => {
          o.classList.remove("show", "accent"),
            t.classList.remove("active-accent", "expand");
        });
    }),
    d.forEach((o) => {
      o.addEventListener("mouseenter", () => {
        e.classList.add("difference"), t.classList.add("cursor-btn-link");
      }),
        o.addEventListener("mouseleave", () => {
          e.classList.remove("difference"),
            t.classList.remove("cursor-btn-link");
        });
    }),
    l.forEach((e) => {
      e.addEventListener("mouseover", () => {
        t.classList.add("active-opposite");
      }),
        e.addEventListener("mouseleave", () => {
          t.classList.remove("active-opposite");
        });
    }),
    n.forEach((e) => {
      e.addEventListener("mouseenter", () => {
        const o = e.dataset.cursorImage;
        o &&
          ((r.innerHTML = `<img src="${o}" alt="">`),
          r.classList.add("show"),
          t.classList.add("expand"));
      }),
        e.addEventListener("mouseleave", () => {
          r.classList.remove("show"),
            setTimeout(() => {
              r.classList.contains("show") || (r.innerHTML = "");
            }, 300),
            t.classList.remove("expand");
        });
    }),
    a.forEach((e) => {
      e.addEventListener("mouseenter", () => {
        const t = e.dataset.cursorImage;
        t &&
          ((r.innerHTML = `<img src="${t}" alt="">`), r.classList.add("show"));
      }),
        e.addEventListener("mouseleave", () => {
          r.classList.remove("show"),
            setTimeout(() => {
              r.classList.contains("show") || (r.innerHTML = "");
            }, 300);
        });
    });
}
function mxdBlur() {
  const e = document.querySelector(".blur-container"),
    t = document.querySelectorAll(".blur-section");
  e &&
    t.length &&
    t.forEach((t) => {
      gsap.timeline({
        scrollTrigger: {
          trigger: t,
          start: "top bottom",
          end: "bottom bottom",
          onEnter: () =>
            gsap.set(e, {
              display: "block",
            }),
          onLeave: () =>
            gsap.set(e, {
              display: "none",
            }),
          onEnterBack: () =>
            gsap.set(e, {
              display: "block",
            }),
          onLeaveBack: () =>
            gsap.set(e, {
              display: "none",
            }),
        },
      });
    });
}
function mxdPin() {
  const e = document.querySelectorAll(".pinned-section");
  if (!e.length) return;
  const t = gsap.matchMedia();
  t.add(
    "(min-width: 1200px)",
    () => (
      e.forEach((e) => {
        const t = e.querySelector(".pinned-section__trigger"),
          o = e.querySelector(".pinned-section__inner");
        t &&
          o &&
          ScrollTrigger.create({
            trigger: e,
            pin: e,
            start: "bottom bottom",
            end: "+=100%",
            scrub: !0,
            pinSpacing: !1,
            invalidateOnRefresh: true,
            animation: gsap.to(o, {
              autoAlpha: 0.3,
              y: "-40vh",
              scale: 0.94,
              ease: "none",
            }),
          });
      }),
      () => window.portfolioViewport.requestRefresh()
    ),
  ),
    t.add("(max-width: 1199px)", () => {
      e.forEach((e) => {
        const t = e.querySelector(".pinned-section__inner");
        t &&
          gsap.set(t, { clearProps: "transform,opacity,visibility" });
      });
    });
}
function mxdToTop() {
  document.querySelector('#to-top')?.addEventListener('click', event => {
    event.preventDefault();
    window.portfolioViewport.scrollTo(0, { duration: 2 });
  });
}
function mxdSmoothScroll() {
  document.querySelectorAll('a[href*="#"]:not([href="#"]):not([href="#0"])').forEach(link => {
    link.addEventListener('click', event => {
      const url = new URL(link.href);
      if (url.pathname !== location.pathname || url.hostname !== location.hostname || !url.hash) return;
      const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (!target) return;
      event.preventDefault();
      window.portfolioViewport.scrollTo(target);
    });
  });
}
function mxdGravity() {
  document.querySelectorAll('.mxd-gravity-section').forEach(section => {
    const container = section.querySelector('.object-container');
    if (!container) return;
    let engine = null, runner = null, mouse = null, constraint = null;
    let raf = 0, topTimer = 0, visible = false, started = false;
    let width = 0, height = 0, bodies = [], walls = [];
    let dragged = null, inertia = 0;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const clamp = (value, min, max) => Math.max(min, Math.min(Math.max(min, max), value));
    const release = () => {
      if (dragged) Matter.Body.setInertia(dragged, inertia);
      dragged = null;
      if (constraint) { constraint.constraint.bodyB = null; constraint.constraint.pointB = null; }
    };
    const contextMenu = event => event.preventDefault();
    function stop() {
      if (runner) Matter.Runner.stop(runner);
      cancelAnimationFrame(raf); raf = 0;
      release();
    }
    function draw() {
      raf = 0;
      if (!visible || document.hidden || !engine) return;
      for (const item of bodies) {
        const x = clamp(item.body.position.x - item.width / 2, 0, width - item.width);
        const y = clamp(item.body.position.y - item.height / 2, -3 * item.height, height - item.height);
        item.element.style.transform = `translate(${x}px, ${y}px) rotate(${item.body.angle}rad)`;
      }
      if (!motion.matches) raf = requestAnimationFrame(draw);
    }
    function resume() {
      if (!engine || !visible || document.hidden || raf) return;
      // Matter's runner integrates time; this never imposes a render frame rate.
      if (motion.matches) { draw(); return; }
      Matter.Runner.run(runner, engine);
      raf = requestAnimationFrame(draw);
    }
    function boundary(x, y, w, h) {
      return Matter.Bodies.rectangle(x, y, w, h, { isStatic: true });
    }
    function measure() {
      const nextWidth = container.clientWidth, nextHeight = container.clientHeight;
      const sizes = bodies.map(item => ({ width: item.element.offsetWidth, height: item.element.offsetHeight }));
      return () => {
        if (!engine || nextWidth <= 0 || nextHeight <= 0) return;
        const oldWidth = width, oldHeight = height;
        width = nextWidth; height = nextHeight;
        release();
        const specs = [[width / 2, height + 100, width + 400, 200], [-100, height / 2, 200, height + 400], [width + 100, height / 2, 200, height + 400], [width / 2, -100, width + 400, 200]];
        walls.forEach((wall, i) => {
          const [x, y, w, h] = specs[i];
          Matter.Body.scale(wall, w / (wall.bounds.max.x - wall.bounds.min.x), h / (wall.bounds.max.y - wall.bounds.min.y));
          Matter.Body.setPosition(wall, { x, y });
        });
        bodies.forEach((item, i) => {
          const size = sizes[i];
          if (size.width && size.height) {
            Matter.Body.scale(item.body, size.width / item.width, size.height / item.height);
            item.width = size.width; item.height = size.height;
          }
          Matter.Body.setPosition(item.body, {
            x: clamp(item.body.position.x * width / oldWidth, item.width / 2, width - item.width / 2),
            y: clamp(item.body.position.y * height / oldHeight, -3 * item.height, height - item.height / 2),
          });
        });
      };
    }
    function init() {
      if (engine) return;
      started = true;
      width = container.clientWidth; height = container.clientHeight;
      engine = Matter.Engine.create({ constraintIterations: 10, positionIterations: 20, velocityIterations: 16 });
      engine.gravity.y = 1;
      const elements = [...container.querySelectorAll('.object')];
      const sizes = elements.map(element => ({ width: element.offsetWidth, height: element.offsetHeight }));
      walls = [boundary(width / 2, height + 100, width + 400, 200), boundary(-100, height / 2, 200, height + 400), boundary(width + 100, height / 2, 200, height + 400)];
      bodies = elements.map((element, i) => {
        const size = sizes[i];
        element.querySelectorAll('img').forEach(img => { img.draggable = false; img.style.pointerEvents = 'none'; });
        if (element.tagName === 'IMG') { element.draggable = false; element.style.pointerEvents = 'none'; }
        element.style.left = '0'; element.style.top = '0';
        const body = Matter.Bodies.rectangle(Math.random() * Math.max(1, width - size.width) + size.width / 2, -500 - 200 * i, size.width, size.height,
          { restitution: 0.5, friction: 0.15, frictionAir: 0.02, density: 0.002 });
        Matter.Body.setAngle(body, (Math.random() - 0.5) * Math.PI);
        if (motion.matches) Matter.Body.setPosition(body, { x: body.position.x, y: clamp(height - size.height / 2 - (i % 3) * size.height, size.height / 2, height - size.height / 2) });
        return { body, element, ...size };
      });
      Matter.World.add(engine.world, [...walls, ...bodies.map(item => item.body)]);
      topTimer = setTimeout(() => {
        if (!engine) return;
        const top = boundary(width / 2, -100, width + 400, 200);
        walls.push(top); Matter.World.add(engine.world, top);
      }, 5000);
      mouse = Matter.Mouse.create(container);
      mouse.element.removeEventListener('mousewheel', mouse.mousewheel);
      mouse.element.removeEventListener('DOMMouseScroll', mouse.mousewheel);
      // Matter's touchmove prevents native scrolling; only mouse dragging is decorative.
      mouse.element.removeEventListener('touchmove', mouse.mousemove);
      mouse.element.removeEventListener('touchstart', mouse.mousedown);
      mouse.element.removeEventListener('touchend', mouse.mouseup);
      constraint = Matter.MouseConstraint.create(engine, { mouse, constraint: { stiffness: 0.6, render: { visible: false } } });
      Matter.Events.on(constraint, 'startdrag', event => {
        dragged = event.body;
        if (!dragged) return;
        inertia = dragged.inertia; Matter.Body.setInertia(dragged, Infinity);
        Matter.Body.setVelocity(dragged, { x: 0, y: 0 }); Matter.Body.setAngularVelocity(dragged, 0);
      });
      Matter.Events.on(constraint, 'enddrag', release);
      Matter.Events.on(engine, 'beforeUpdate', () => {
        if (!dragged) return;
        const item = bodies.find(item => item.body === dragged);
        if (item) Matter.Body.setPosition(dragged, { x: clamp(dragged.position.x, item.width / 2, width - item.width / 2), y: clamp(dragged.position.y, item.height / 2, height - item.height / 2) });
      });
      Matter.World.add(engine.world, constraint);
      runner = Matter.Runner.create();
      container.addEventListener('mouseleave', release);
      container.addEventListener('mouseup', release);
      container.addEventListener('contextmenu', contextMenu);
      resume();
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !started) init();
      if (visible) resume(); else stop();
    });
    observer.observe(section);
    const visibility = () => document.hidden ? stop() : resume();
    document.addEventListener('visibilitychange', visibility);
    const motionChange = () => { stop(); resume(); };
    motion.addEventListener('change', motionChange);
    const unprepare = window.portfolioViewport.prepare(() => engine ? measure() : undefined);
    window.portfolioViewport.cleanup(() => {
      stop(); clearTimeout(topTimer); observer.disconnect(); unprepare();
      document.removeEventListener('visibilitychange', visibility);
      motion.removeEventListener('change', motionChange);
      container.removeEventListener('mouseleave', release);
      container.removeEventListener('mouseup', release);
      container.removeEventListener('contextmenu', contextMenu);
      if (mouse) {
        for (const [name, handler] of [['mousemove', mouse.mousemove], ['mousedown', mouse.mousedown], ['mouseup', mouse.mouseup]]) mouse.element.removeEventListener(name, handler);
        Matter.Mouse.clearSourceEvents(mouse);
      }
      if (constraint) Matter.Events.off(constraint);
      if (engine) { Matter.Events.off(engine); Matter.World.clear(engine.world, false); Matter.Engine.clear(engine); }
      engine = runner = mouse = constraint = null; bodies = []; walls = [];
    });
  });
}
// Trail loops exist only during visible pointer interaction and tween completion.
function mxdTrailLifecycle(trail) {
  let frame = 0, visible = false, lastTime = 0;
  const media = matchMedia('(hover: hover) and (pointer: fine) and (min-width: 768px) and (prefers-reduced-motion: no-preference)');
  const tick = time => {
    frame = 0;
    trail.smoothing = 1 - Math.pow(1 - trail.baseSmoothing, Math.min((time - lastTime) / (1000 / 60), 4) || 1);
    lastTime = time;
    trail.update();
  };
  const stop = () => { cancelAnimationFrame(frame); frame = 0; lastTime = 0; };
  const wake = () => {
    if (!frame && visible && !document.hidden && media.matches) frame = requestAnimationFrame(tick);
  };
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (!visible) stop();
  });
  observer.observe(trail.section);
  const visibility = () => { if (document.hidden) stop(); };
  const leave = () => { trail.pointerInside = false; };
  const enter = () => { trail.pointerInside = true; };
  document.addEventListener('visibilitychange', visibility);
  trail.section.addEventListener('pointerenter', enter);
  trail.section.addEventListener('pointerleave', leave);
  media.addEventListener('change', stop);
  trail.wake = wake;
  trail.continue = () => {
    if (trail.pointerInside && (Math.hypot(trail.cachedPos.x - trail.mousePos.x, trail.cachedPos.y - trail.mousePos.y) > 0.25 || trail.images.some(image => image.isActive()))) wake();
  };
  const unprepare = window.portfolioViewport.prepare(() => {
    const sizes = trail.images.map(image => ({ width: image.DOM.el.offsetWidth, height: image.DOM.el.offsetHeight }));
    return () => trail.images.forEach((image, i) => { image.rect = sizes[i]; });
  });
  window.portfolioViewport.cleanup(() => {
    stop(); observer.disconnect(); unprepare(); media.removeEventListener('change', stop);
    document.removeEventListener('visibilitychange', visibility);
    trail.section.removeEventListener('pointerenter', enter); trail.section.removeEventListener('pointerleave', leave);
    trail.images.forEach(image => gsap.killTweensOf(image.DOM.el));
  });
}
function mxdCursorTrail() {
  const e = document.querySelectorAll(".cursor-trail");
  if (!e.length) return;
  const t = document.querySelectorAll(".mxd-trail-image");
  t.length &&
    imagesLoaded(t, () => {
      const t = (e, t, o) => (1 - o) * e + o * t;
      class o {
        constructor(e) {
          (this.DOM = {
            el: e,
          }),
            (this.defaultStyle = {
              opacity: 0,
              scale: 1,
              x: 0,
              y: 0,
            }),
            (this.rect = this.DOM.el.getBoundingClientRect()),
            gsap.set(this.DOM.el, this.defaultStyle);
        }
        isActive() {
          return (
            gsap.getTweensOf(this.DOM.el).length > 0 ||
            "0" !== this.DOM.el.style.opacity
          );
        }
      }
      class r {
        constructor(e) {
          (this.section = e),
            (this.wrapper = e.querySelector(".mxd-trail-wrapper")),
            (this.content = this.wrapper.querySelector(".mxd-trail-content")),
            (this.images = [
              ...this.content.querySelectorAll(".mxd-trail-image"),
            ].map((e) => new o(e))),
            (this.total = this.images.length),
            (this.mousePos = {
              x: 0,
              y: 0,
            }),
            (this.prevMousePos = {
              x: 0,
              y: 0,
            }),
            (this.cachedPos = {
              x: 0,
              y: 0,
            }),
            (this.index = 0),
            (this.zIndex = 1),
            (this.threshold = 80),
            this.section.addEventListener("pointermove", (e) => this.onMove(e)),
            (this.baseSmoothing = 0.12), mxdTrailLifecycle(this);
        }
        onMove(e) {
          const t = this.wrapper.getBoundingClientRect();
          this.mousePos.x = e.clientX - t.left;
          this.mousePos.y = e.clientY - t.top;
          this.pointerInside = true; this.wake();
        }
        update() {
          const e = this.mousePos.x - this.prevMousePos.x,
            o = this.mousePos.y - this.prevMousePos.y,
            r = ((e, t, o, r) => Math.hypot(o - e, r - t))(
              this.mousePos.x,
              this.mousePos.y,
              this.prevMousePos.x,
              this.prevMousePos.y,
            );
          (this.cachedPos.x = t(this.cachedPos.x, this.mousePos.x, this.smoothing)),
            (this.cachedPos.y = t(this.cachedPos.y, this.mousePos.y, this.smoothing)),
            r > this.threshold &&
              (this.showNext(e, o),
              (this.prevMousePos.x = this.mousePos.x, this.prevMousePos.y = this.mousePos.y)),
            this.images.some((e) => e.isActive()) || (this.zIndex = 1),
            this.continue();
        }
        showNext(e, t) {
          const o = this.images[this.index],
            r = gsap.utils.clamp(-14, 14, 0.4 * -(e + t));
          gsap.killTweensOf(o.DOM.el),
            gsap
              .timeline()
              .set(o.DOM.el, {
                opacity: 1,
                scale: 1,
                zIndex: this.zIndex++,
                x: this.cachedPos.x - o.rect.width / 2,
                y: this.cachedPos.y - o.rect.height / 2,
                rotation: r,
              })
              .to(
                o.DOM.el,
                {
                  duration: 2,
                  x: this.mousePos.x - o.rect.width / 2,
                  y: this.mousePos.y - o.rect.height / 2,
                  rotation: r,
                  ease: "expo.out",
                },
                0,
              )
              .to(
                o.DOM.el,
                {
                  duration: 0.8,
                  scale: 0,
                  ease: "power1.out",
                  onComplete: () => {
                    gsap.set(o.DOM.el, {
                      scale: 1,
                      opacity: 0,
                    });
                  },
                },
                0.35,
              ),
            (this.index = (this.index + 1) % this.total);
        }
      }
      e.forEach((e) => new r(e));
    });
}
function mxdCursorTrailTr() {
  const e = document.querySelectorAll(".cursor-trail-transparent");
  if (!e.length) return;
  const t = document.querySelectorAll(".mxd-trail-transparent-image");
  t.length &&
    imagesLoaded(t, () => {
      const t = (e, t, o) => (1 - o) * e + o * t;
      class o {
        constructor(e) {
          (this.DOM = {
            el: e,
          }),
            this.setSize(),
            (this.rect = this.DOM.el.getBoundingClientRect());
        }
        setSize() {
          const e = this.DOM.el;
          e.naturalWidth >= e.naturalHeight
            ? ((e.style.width = "240px"), (e.style.height = "auto"))
            : ((e.style.height = "240px"), (e.style.width = "auto"));
        }
        updateRect() {
          this.rect = this.DOM.el.getBoundingClientRect();
        }
        isActive() {
          return gsap.getTweensOf(this.DOM.el).length > 0;
        }
      }
      class r {
        constructor(e) {
          (this.section = e),
            (this.wrapper = e.querySelector(".mxd-trail-transparent-wrapper")),
            (this.content = this.wrapper.querySelector(
              ".mxd-trail-transparent-content",
            )),
            (this.images = [
              ...this.content.querySelectorAll(".mxd-trail-transparent-image"),
            ].map((e) => new o(e))),
            (this.mousePos = {
              x: 0,
              y: 0,
            }),
            (this.prevPos = {
              x: 0,
              y: 0,
            }),
            (this.cachedPos = {
              x: 0,
              y: 0,
            }),
            (this.index = 0),
            (this.zIndex = 1),
            (this.threshold = 120),
            this.section.addEventListener("pointermove", (e) => this.move(e)),
            (this.baseSmoothing = 0.14), mxdTrailLifecycle(this);
        }
        move(e) {
          const t = this.wrapper.getBoundingClientRect();
          (this.mousePos.x = e.clientX - t.left),
            (this.mousePos.y = e.clientY - t.top);
          this.pointerInside = true; this.wake();
        }
        update() {
          const e = this.mousePos.x - this.prevPos.x,
            o = this.mousePos.y - this.prevPos.y,
            r = ((e, t, o, r) => Math.hypot(o - e, r - t))(
              this.mousePos.x,
              this.mousePos.y,
              this.prevPos.x,
              this.prevPos.y,
            );
          (this.cachedPos.x = t(this.cachedPos.x, this.mousePos.x, this.smoothing)),
            (this.cachedPos.y = t(this.cachedPos.y, this.mousePos.y, this.smoothing)),
            r > this.threshold &&
              (this.showNext(e, o),
              (this.prevPos.x = this.mousePos.x, this.prevPos.y = this.mousePos.y)),
            this.images.some((e) => e.isActive()) || (this.zIndex = 1),
            this.continue();
        }
        showNext(e, t) {
          const o = this.images[this.index];

          const r = gsap.utils.clamp(-14, 14, 0.3 * -(e + t)),
            n = o.rect.width / 2,
            a = o.rect.height / 2;
          gsap.killTweensOf(o.DOM.el),
            gsap
              .timeline()
              .set(o.DOM.el, {
                opacity: 1,
                scale: 1,
                zIndex: this.zIndex++,
                x: this.cachedPos.x - n,
                y: this.cachedPos.y - a,
                rotation: r,
              })
              .to(
                o.DOM.el,
                {
                  duration: 1,
                  x: this.mousePos.x - n,
                  y: this.mousePos.y - a,
                  rotation: r,
                  ease: "expo.out",
                },
                0,
              )
              .to(
                o.DOM.el,
                {
                  duration: 0.8,
                  scale: 0,
                  ease: "power1.out",
                  onComplete: () => {
                    gsap.set(o.DOM.el, {
                      scale: 1,
                      opacity: 0,
                    });
                  },
                },
                0.55,
              ),
            (this.index = (this.index + 1) % this.images.length);
        }
      }
      e.forEach((e) => new r(e));
    });
}
function mxdTextScramble(selector = '.mxd-scramble') {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll(selector).forEach(element => {
    const original = element.innerText;
    let timer = 0;
    const stop = () => { if (!timer) return; clearInterval(timer); timer = 0; element.innerText = original; };
    const enter = () => {
      if (motion.matches || document.hidden) return;
      stop(); let progress = 0;
      timer = setInterval(() => {
        element.innerText = [...original].map((char, i) => i < progress ? char : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 36)]).join('');
        progress += 0.25;
        if (progress >= original.length) stop();
      }, 40);
    };
    element.addEventListener('mouseenter', enter);
    document.addEventListener('visibilitychange', stop);
    motion.addEventListener('change', stop);
    window.portfolioViewport.cleanup(() => { stop(); element.removeEventListener('mouseenter', enter); document.removeEventListener('visibilitychange', stop); motion.removeEventListener('change', stop); });
  });
}
function mxdHoverSlideshow() {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('.mxd-img-anim').forEach(element => {
    const main = element.querySelector('.mxd-img-anim__main');
    const images = [...element.querySelectorAll('.mxd-img-anim__absolute')];
    if (!main || !images.length) return;
    let timer = 0, index = 0;
    const stop = () => { clearInterval(timer); timer = 0; images.forEach(image => image.style.opacity = 0); main.style.opacity = 1; };
    const start = () => {
      stop(); if (document.hidden || motion.matches) return;
      main.style.opacity = 0; images[index = 0].style.opacity = 1;
      timer = setInterval(() => { images[index].style.opacity = 0; index = (index + 1) % images.length; images[index].style.opacity = 1; }, 350);
    };
    stop();
    element.addEventListener('mouseenter', start); element.addEventListener('mouseleave', stop);
    document.addEventListener('visibilitychange', stop); motion.addEventListener('change', stop);
    window.portfolioViewport.cleanup(() => { stop(); element.removeEventListener('mouseenter', start); element.removeEventListener('mouseleave', stop); document.removeEventListener('visibilitychange', stop); motion.removeEventListener('change', stop); });
  });
}
function mxdStats() {
  const e = document.querySelectorAll(".mxd-stats-lines__item");
  e.length &&
    e.forEach((e) => {
      const t = e.querySelector(".mxd-stats-lines__inner"),
        o = e.querySelector(".mxd-stats-lines__divider");
      gsap.fromTo(
        t,
        {
          yPercent: -100,
          ease: "none",
        },
        {
          yPercent: 0,
          scrollTrigger: {
            trigger: o,
            start: "top bottom",
            end: "bottom 60%",
            scrub: !0,
            toggleActions: "play none none reverse",
          },
        },
      );
    });
}
function mxdProjectsStack() {
  const e = document.querySelectorAll(".mxd-stack-cards");
  e.length &&
    e.forEach((e) => {
      const t = gsap.utils.toArray(
        e.querySelectorAll(".mxd-stack-cards__card"),
      );
      if (!t.length) return;
      const o = t[0];
      gsap.utils.toArray(".card__title p").forEach((e) => {
        new SplitText(e, {
          type: "words, lines",
          mask: "lines",
          linesClass: "line++",
        });
      });
      const r = o.querySelector(".card__image"),
        n = o.querySelector(".card__image .card__media"),
        a = o.querySelector(".card__cover");
      function s() {
        const e = window.innerWidth;
        return e >= 1600 ? 460 : e >= 1024 ? 400 : Math.min(e - 60, 390);
      }
      let i = s(),
        c = 0;
      function l(e) {
        const t = ((window.innerHeight - i) / 2) * (1 - e),
          o = ((window.innerWidth - i) / 2) * (1 - e);
        gsap.set(r, {
          clipPath: `inset(${t}px ${o}px ${t}px ${o}px)`,
        });
      }
      function d(e, t) {
        gsap.to(e, {
          y: "0%",
          duration: 0.75,
          ease: "common",
          stagger: {
            amount: 0.15,
          },
        }),
          gsap.to(t, {
            y: 0,
            opacity: 1,
            duration: 0.75,
            delay: 0.1,
            ease: "common",
          });
      }
      function p(e, t) {
        gsap.to(e, {
          y: "100%",
          duration: 0.5,
          ease: "common",
        }),
          gsap.to(t, {
            y: "40px",
            opacity: 0,
            duration: 0.1,
            ease: "common",
          });
      }
      l(0),
        gsap.set(n, {
          scale: 0.9,
        }),
        gsap.set(a, {
          opacity: 0,
        });
      const u = o.querySelector(".card__marquees"),
        m = o.querySelectorAll(".line-mask .line"),
        g = o.querySelector(".card__descr");
      ScrollTrigger.create({
        trigger: o,
        start: "top top",
        end: "+=300vh",
        onUpdate: (e) => {
          const t = e.progress;
          (c = e.progress), l(c);
          const r = 0.9 + 0.1 * t,
            s = 0 + 1 * t;
          if (
            (gsap.set(n, {
              scale: r,
            }),
            gsap.set(a, {
              opacity: s,
            }),
            s >= 0.4 && s <= 0.75)
          ) {
            const e = (s - 0.4) / 0.35;
            gsap.set(u, {
              opacity: 1 - e,
            });
          } else
            s < 0.4
              ? gsap.set(u, {
                  opacity: 1,
                })
              : s > 0.75 &&
                gsap.set(u, {
                  opacity: 0,
                });
          c >= 1 && !o.contentRevealed && ((o.contentRevealed = !0), d(m, g)),
            c < 1 && o.contentRevealed && ((o.contentRevealed = !1), p(m, g));
        },
      }),
        window.portfolioViewport.prepare(() => {
          i = s();
          return () => l(c);
        }),
        t.forEach((e, o) => {
          const r = o === t.length - 1;
          ScrollTrigger.create({
            trigger: e,
            start: "top top",
            end: r ? "+=100vh" : "top top",
            endTrigger: r ? null : t[t.length - 1],
            pin: !0,
            pinSpacing: r,
          });
        }),
        t.forEach((e, o) => {
          if (o < t.length - 1) {
            const r = e.querySelector(".card__wrapper");
            ScrollTrigger.create({
              trigger: t[o + 1],
              start: "top bottom",
              end: "top top",
              delay: 0.3,
              onUpdate: (e) => {
                const t = e.progress;
                gsap.set(r, {
                  scale: 1 - 0.15 * t,
                  opacity: 1 - t,
                });
              },
            });
          }
        }),
        t.forEach((e, t) => {
          if (t > 0) {
            const t = e.querySelector(".card__image img");
            e.querySelector(".card__image"),
              ScrollTrigger.create({
                trigger: e,
                start: "top bottom",
                end: "top top",
                onUpdate: (e) => {
                  const o = e.progress;
                  gsap.set(t, {
                    scale: 2 - o,
                  });
                },
              });
          }
        }),
        t.forEach((e, t) => {
          if (0 === t) return;
          const o = e.querySelector(".card__descr"),
            r = e.querySelectorAll(".line-mask .line");
          ScrollTrigger.create({
            trigger: e,
            start: "top top",
            onEnter: () => d(r, o),
            onLeaveBack: () => p(r, o),
          });
        });
    });
}
function mxdServicesStack() {
  const e = document.querySelectorAll(".mxd-stack-services");
  e.length &&
    e.forEach((e) => {
      const t = gsap.utils.toArray(
        e.querySelectorAll(".mxd-stack-services__card"),
      );
      t.length &&
        (t.forEach((e) => {
          const t = e.querySelector(".services-card__title p");
          t &&
            new SplitText(t, {
              type: "words, lines",
              mask: "lines",
              linesClass: "line++",
            });
        }),
        t.forEach((e) => {
          const t = e.querySelector(".services-card__descr");
          t &&
            new SplitText(t, {
              type: "words, lines",
              mask: "lines",
              linesClass: "line++",
            });
        }),
        t.forEach((e, o) => {
          const r = o === t.length - 1;
          ScrollTrigger.create({
            trigger: e,
            start: "top top",
            end: r ? "+=100vh" : "top top",
            endTrigger: r ? null : t[t.length - 1],
            pin: !0,
            pinSpacing: r,
          });
        }),
        t.forEach((e, o) => {
          if (o >= t.length - 1) return;
          const r = e.querySelector(".services-card__wrapper");
          ScrollTrigger.create({
            trigger: t[o + 1],
            start: "top bottom",
            end: "top top",
            scrub: !0,
            onUpdate: (e) => {
              gsap.set(r, {
                scale: 1 - 0.15 * e.progress,
                opacity: 1 - e.progress,
              });
            },
          });
        }),
        t.forEach((e) => {
          const t = e.querySelector(".services-card__image img");
          t &&
            (gsap.set(t, {
              scale: 1.4,
            }),
            ScrollTrigger.create({
              trigger: e,
              start: "top bottom",
              end: "top top",
              scrub: !0,
              onUpdate: (e) => {
                gsap.set(t, {
                  scale: 1.4 - 0.4 * e.progress,
                });
              },
            }));
        }),
        t.forEach((e) => {
          const t = e.querySelector(".services-card__tags"),
            o = e.querySelectorAll(".services-card__title .line-mask .line"),
            r = e.querySelectorAll(".services-card__descr .line-mask .line");
          t &&
            o.length &&
            (ScrollTrigger.create({
              trigger: e,
              start: "top 40%",
              onEnter: () =>
                (function (e) {
                  gsap.to(e, {
                    y: "0%",
                    duration: 0.75,
                    ease: "common",
                    stagger: 0.08,
                  });
                })(o),
              onLeaveBack: () =>
                (function (e) {
                  gsap.to(e, {
                    y: "100%",
                    duration: 0.5,
                    ease: "common",
                  });
                })(o),
            }),
            ScrollTrigger.create({
              trigger: e,
              start: "top top",
              onEnter: () =>
                (function (e, t) {
                  gsap.to(e, {
                    y: "0%",
                    duration: 0.75,
                    ease: "common",
                    stagger: 0.08,
                  }),
                    gsap.to(t, {
                      opacity: 1,
                      duration: 0.75,
                      ease: "common",
                    });
                })(r, t),
              onLeaveBack: () =>
                (function (e, t) {
                  gsap.to(e, {
                    y: "100%",
                    duration: 0.5,
                    ease: "common",
                  }),
                    gsap.to(t, {
                      opacity: 0,
                      duration: 0.3,
                      ease: "common",
                    });
                })(r, t),
            }));
        }));
    });
}
function mxdLandingStack() {
  const e = document.querySelectorAll(".mxd-demo-stack");
  e.length &&
    e.forEach((e) => {
      const t = gsap.utils.toArray(e.querySelectorAll(".mxd-demo-stack__card"));
      t.length &&
        (t.forEach((e) => {
          const t = e.querySelector(".demo-card__title p");
          t &&
            new SplitText(t, {
              type: "words, lines",
              mask: "lines",
              linesClass: "line++",
            });
        }),
        t.forEach((e) => {
          const t = e.querySelector(".demo-card__descr");
          t &&
            new SplitText(t, {
              type: "words, lines",
              mask: "lines",
              linesClass: "line++",
            });
        }),
        t.forEach((e, o) => {
          const r = o === t.length - 1;
          ScrollTrigger.create({
            trigger: e,
            start: "top top",
            end: r ? "+=100vh" : "top top",
            endTrigger: r ? null : t[t.length - 1],
            pin: !0,
            pinSpacing: r,
          });
        }),
        t.forEach((e, o) => {
          if (o >= t.length - 1) return;
          const r = e.querySelector(".demo-card__wrapper");
          ScrollTrigger.create({
            trigger: t[o + 1],
            start: "top bottom",
            end: "top top",
            scrub: !0,
            onUpdate: (e) => {
              gsap.set(r, {
                scale: 1 - 0.15 * e.progress,
                opacity: 1 - e.progress,
              });
            },
          });
        }),
        t.forEach((e) => {
          const t = e.querySelector(".demo-card__image img");
          t &&
            (gsap.set(t, {
              scale: 1.4,
            }),
            ScrollTrigger.create({
              trigger: e,
              start: "top bottom",
              end: "top top",
              scrub: !0,
              onUpdate: (e) => {
                gsap.set(t, {
                  scale: 1.4 - 0.4 * e.progress,
                });
              },
            }));
        }),
        t.forEach((e) => {
          const t = e.querySelector(".demo-card__tags"),
            o = e.querySelectorAll(".demo-card__title .line-mask .line"),
            r = e.querySelectorAll(".demo-card__descr .line-mask .line");
          t &&
            o.length &&
            (ScrollTrigger.create({
              trigger: e,
              start: "top 40%",
              onEnter: () =>
                (function (e) {
                  gsap.to(e, {
                    y: "0%",
                    duration: 0.75,
                    ease: "common",
                    stagger: 0.08,
                  });
                })(o),
              onLeaveBack: () =>
                (function (e) {
                  gsap.to(e, {
                    y: "100%",
                    duration: 0.5,
                    ease: "common",
                  });
                })(o),
            }),
            ScrollTrigger.create({
              trigger: e,
              start: "top top",
              onEnter: () =>
                (function (e, t) {
                  gsap.to(e, {
                    y: "0%",
                    duration: 0.75,
                    ease: "common",
                    stagger: 0.08,
                  }),
                    gsap.to(t, {
                      opacity: 1,
                      duration: 0.75,
                      ease: "common",
                    });
                })(r, t),
              onLeaveBack: () =>
                (function (e, t) {
                  gsap.to(e, {
                    y: "100%",
                    duration: 0.5,
                    ease: "common",
                  }),
                    gsap.to(t, {
                      opacity: 0,
                      duration: 0.3,
                      ease: "common",
                    });
                })(r, t),
            }));
        }));
    });
}
function mxdProjectsClip() {
  document.querySelectorAll(".mxd-showcase-clip").forEach((e) => {
    const t = e.querySelectorAll(".mxd-showcase-clip__trigger"),
      o = e.querySelectorAll(".mxd-showcase-clip__item");
    t.forEach((e, t) => {
      const r = e.querySelector(".mxd-showcase-clip__bg"),
        n = o[t];
      if (0 === t)
        gsap
          .timeline({
            scrollTrigger: {
              trigger: e,
              start: "top top",
              end: "bottom top",
              scrub: !0,
            },
            defaults: {
              ease: "none",
            },
          })
          .fromTo(
            n,
            {
              clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
            },
            {
              clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
            },
          );
      else if (t === o.length - 1)
        gsap
          .timeline({
            scrollTrigger: {
              trigger: e,
              start: "top bottom",
              end: "bottom bottom",
              scrub: !0,
            },
            defaults: {
              ease: "none",
            },
          })
          .fromTo(
            n,
            {
              clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
            },
            {
              clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
            },
          );
      else {
        const t = gsap.timeline({
          scrollTrigger: {
            trigger: e,
            start: "top bottom",
            end: "bottom top",
            scrub: !0,
          },
          defaults: {
            ease: "none",
          },
        });
        t.fromTo(
          n,
          {
            clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
          },
          {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          },
        ),
          t.to(n, {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
          });
      }
      gsap
        .timeline({
          scrollTrigger: {
            trigger: e,
            start: "top top",
            end: "bottom top",
            scrub: !0,
          },
          defaults: {
            ease: "none",
          },
        })
        .to(r, {
          yPercent: 50,
        });
    });
  });
}
$(window).on("scroll", function () {
  $(window).scrollTop() > 10
    ? $(".mxd-header").addClass("is-hidden")
    : $(".mxd-header").removeClass("is-hidden");
});
function mxdDecorativeTimeline(timeline, element) {
  let visible = false;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const update = () => visible && !document.hidden && !motion.matches ? timeline.resume() : timeline.pause();
  const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); });
  observer.observe(element);
  document.addEventListener('visibilitychange', update); motion.addEventListener('change', update);
  window.portfolioViewport.cleanup(() => { observer.disconnect(); document.removeEventListener('visibilitychange', update); motion.removeEventListener('change', update); timeline.kill(); });
}
const initMarquees = () => {
    const e = [...document.querySelectorAll(".marquee--gsap")];
    if (e) {
      const t = {
        top: {
          el: null,
          width: 0,
        },
        bottom: {
          el: null,
          width: 0,
        },
      };
      e.forEach((e) => {
        (t.top.el = e.querySelectorAll(".marquee__top")),
          (t.bottom.el = e.querySelectorAll(".marquee__bottom")),
          (t.top.width = t.top.el.offsetWidth),
          (t.bottom.width = t.bottom.el.offsetWidth),
          (t.top.el.innerHTML += t.top.el.innerHTML),
          (t.bottom.el.innerHTML += t.bottom.el.innerHTML);
        let o = gsap
            .timeline()
            .add(marquee(t.top.el, 70, "-=50%"), 0)
            .add(marquee(t.bottom.el, 70, "+=50%"), 0),
          r = gsap.to(o, {
            duration: 1.5,
            timeScale: 1,
            paused: !0,
          }),
          n = gsap.utils.clamp(1, 6);
        mxdDecorativeTimeline(o, e);
        ScrollTrigger.create({
          start: 0,
          end: "max",
          onUpdate: (e) => {
            o.timeScale(n(Math.abs(e.getVelocity() / 200))),
              r.invalidate().restart();
          },
        });
      });
    }
  },
  marquee = (e, t, o) => {
    let r = gsap.utils.wrap(0, 50);
    return gsap.to(e, {
      duration: t,
      ease: "none",
      x: o,
      modifiers: {
        x: (e) => (o = r(parseFloat(e)) + "%"),
      },
      repeat: -1,
    });
  };
initMarquees();
const initMarquee = () => {
    const e = [...document.querySelectorAll(".marquee-right--gsap")];
    if (e) {
      const t = {
        el: null,
        width: 0,
      };
      e.forEach((e) => {
        (t.el = e.querySelector(".marquee__toright")),
          (t.width = t.el.offsetWidth),
          (t.el.innerHTML += t.el.innerHTML);
        let o = gsap.timeline().add(marqueeRight(t.el, 70, "+=50%"), 0),
          r = gsap.to(o, {
            duration: 1.5,
            timeScale: 1,
            paused: !0,
          }),
          n = gsap.utils.clamp(1, 6);
        mxdDecorativeTimeline(o, e);
        ScrollTrigger.create({
          start: 0,
          end: "max",
          onUpdate: (e) => {
            o.timeScale(n(Math.abs(e.getVelocity() / 200))),
              r.invalidate().restart();
          },
        });
      });
    }
  },
  marqueeRight = (e, t, o) => {
    let r = gsap.utils.wrap(0, 50);
    return gsap.to(e, {
      duration: t,
      ease: "none",
      x: o,
      modifiers: {
        x: (e) => (o = r(parseFloat(e)) + "%"),
      },
      repeat: -1,
    });
  };
initMarquee();
const initMarqueeLeft = () => {
    const e = [...document.querySelectorAll(".marquee-left--gsap")];
    if (e) {
      const t = {
        el: null,
        width: 0,
      };
      e.forEach((e) => {
        (t.el = e.querySelector(".marquee__toleft")),
          (t.width = t.el.offsetWidth),
          (t.el.innerHTML += t.el.innerHTML);
        let o = gsap.timeline().add(marquee(t.el, 70, "-=50%"), 0),
          r = gsap.to(o, {
            duration: 1.5,
            timeScale: 1,
            paused: !0,
          }),
          n = gsap.utils.clamp(1, 6);
        mxdDecorativeTimeline(o, e);
        ScrollTrigger.create({
          start: 0,
          end: "max",
          onUpdate: (e) => {
            o.timeScale(n(Math.abs(e.getVelocity() / 200))),
              r.invalidate().restart();
          },
        });
      });
    }
  },
  marqueeLeft = (e, t, o) => {
    let r = gsap.utils.wrap(0, 50);
    return gsap.to(e, {
      duration: t,
      ease: "none",
      x: o,
      modifiers: {
        x: (e) => (o = r(parseFloat(e)) + "%"),
      },
      repeat: -1,
    });
  };
function mxdDvStickyMedia() {
  const e = document.querySelectorAll(".mxd-dv-sticky-img");
  if (!e.length) return;
  const t = "inset(0% round 0%)",
    o = (e) => String(e).padStart(2, "0");
  e.forEach((e) => {
    const r = e.querySelector(".mxd-dv-sticky-img__sticky");
    if (!r) return;
    const n = r.querySelectorAll(".images__overflow"),
      a = r.querySelectorAll(".mxd-dv-sticky-img__titleitem h2"),
      s = r.querySelector(".mxd-dv-sticky-img__number"),
      i = r.querySelector(".number__current"),
      c = r.querySelector(".number__total"),
      l = r.querySelector(".mxd-dv-sticky-img__btnholder"),
      d = r.querySelector(".mxd-dv-sticky-img__progress");
    if (!n.length || !a.length) return;
    if (!s || !i || !c) return;
    const p = n.length,
      u = Math.max(0, p - 1);
    const progressTo = d ? gsap.quickTo(d, "scaleX", { duration: 0.12, ease: "common" }) : null;
    function m() {
      n.forEach((e, o) => {
        gsap.set(e, {
          clipPath: 0 === o ? t : "inset(50% round 0%)",
          autoAlpha: 1,
          willChange: "clip-path, opacity, transform",
          pointerEvents: "none",
        });
      }),
        a.forEach((e) =>
          gsap.set(e, {
            autoAlpha: 1,
            yPercent: 100,
          }),
        ),
        gsap.set(s, {
          autoAlpha: 0,
          y: 8,
        }),
        l &&
          gsap.set(l, {
            autoAlpha: 0,
            y: 8,
          }),
        d &&
          gsap.set(d, {
            transformOrigin: "left center",
            scaleX: 0,
          });
    }
    c.textContent = o(p);
    const g = () =>
        u * (window.innerHeight || document.documentElement.clientHeight),
      h = (t) => {
        const o = r.getBoundingClientRect().height || window.innerHeight;
        e.style.minHeight = o + t + "px";
      };
    (function (e) {
      const t = Array.from(e).flatMap((e) =>
        Array.from(e.querySelectorAll("img")),
      );
      return t.length
        ? Promise.all(
            t.map((e) =>
              e.complete && (e.naturalWidth || e.naturalHeight)
                ? Promise.resolve()
                : e.decode
                  ? e.decode().catch(() => {})
                  : new Promise((t) => (e.onload = e.onerror = t)),
            ),
          )
        : Promise.resolve();
    })(n)
      .then(() => {
        if ((m(), p < 2)) {
          const e = gsap.timeline();
          return (
            e.to(s, {
              duration: 0.36,
              autoAlpha: 1,
              y: 0,
            }),
            e.to(
              a[0],
              {
                duration: 0.36,
                yPercent: 0,
              },
              "-=0.26",
            ),
            void (
              l &&
              e.to(
                l,
                {
                  duration: 0.36,
                  autoAlpha: 1,
                  y: 0,
                },
                "-=0.26",
              )
            )
          );
        }
        const c = g();
        h(c);
        const y = gsap.timeline({
          defaults: {
            ease: "power2.out",
          },
          paused: !0,
        });
        y.to(
          s,
          {
            duration: 0.32,
            autoAlpha: 1,
            y: 0,
          },
          0,
        ),
          y.to(
            a[0],
            {
              duration: 0.32,
              yPercent: 0,
            },
            0.05,
          ),
          l &&
            y.to(
              l,
              {
                duration: 0.32,
                autoAlpha: 1,
                y: 0,
              },
              0.05,
            );
        for (let e = 1; e < p; e++)
          y.to(
            n[e],
            {
              duration: 0.6,
              clipPath: t,
            },
            "+=0.12",
          ),
            y.to(
              a[e - 1],
              {
                duration: 0.28,
                yPercent: -100,
              },
              "-=0.48",
            ),
            y.to(
              a[e],
              {
                duration: 0.28,
                yPercent: 0,
              },
              "<",
            );
        const x = ScrollTrigger.create({
          trigger: e,
          start: "top top",
          end: () => "+=" + g(),
          scrub: 0.6,
          pin: r,
          pinSpacing: !0,
          anticipatePin: 1,
          invalidateOnRefresh: !0,
          animation: y,
          onUpdate(e) {
            progressTo?.(e.progress);
            const t = Math.round(e.progress * u);
            i.textContent = o(Math.min(p, t + 1));
          },
        });
        window.portfolioViewport.prepare(() => {
          const height = r.getBoundingClientRect().height || window.innerHeight;
          const distance = g();
          return () => { e.style.minHeight = `${height + distance}px`; };
        });
        window.portfolioViewport.requestRefresh();
      })
      .catch(() => m());
  });
}
function mxdDvStickyCaption() {
  document.querySelectorAll(".mxd-dv-sticky-cap").forEach((e) => {
    const t = e.querySelector(".mxd-dv-sticky-cap__content"),
      o = e.querySelector(".mxd-dv-sticky-cap__top"),
      r = e.querySelector(".mxd-dv-sticky-cap__center"),
      n = e.querySelector(".mxd-dv-sticky-cap__bottom"),
      a = e.querySelector(".mxd-dv-sticky-cap__scroll");
    function s(e) {
      if (t.parentNode === e) return;
      const o = Flip.getState(t);
      e.appendChild(t),
        Flip.from(o, {
          duration: 0.6,
          ease: "none",
          absolute: !0,
        });
    }
    t &&
      o &&
      r &&
      n &&
      a &&
      (ScrollTrigger.create({
        trigger: e,
        start: "top top",
        onEnter: () => s(r),
        onEnterBack: () => s(r),
        onLeaveBack: () => s(o),
      }),
      ScrollTrigger.create({
        trigger: a,
        start: "bottom bottom",
        onEnter: () => s(n),
        onLeaveBack: () => s(r),
      }));
  });
}
initMarqueeLeft();
const mxdSlideObject = document.querySelectorAll(".mxd-slide-object");
mxdSlideObject.forEach((e) => {
  gsap.fromTo(
    e,
    {
      xPercent: 0,
      ease: "common",
    },
    {
      xPercent: 120,
      scrollTrigger: {
        trigger: e,
        start: "top 70%",
        end: "bottom top",
        scrub: !0,
        toggleActions: "play none none reverse",
      },
    },
  );
});
const mxdSlideDownObj = document.querySelectorAll(".mxd-slide-down-object");
mxdSlideDownObj.forEach((e) => {
  gsap.fromTo(
    e,
    {
      yPercent: 0,
      ease: "common",
    },
    {
      yPercent: 160,
      scrollTrigger: {
        trigger: e,
        start: "top 40%",
        end: "bottom top",
        scrub: !0,
        toggleActions: "play none none reverse",
      },
    },
  );
});
const mxdSlideRightToLeft = document.querySelectorAll(".slide-right-to-left");
mxdSlideRightToLeft.forEach((e) => {
  gsap.fromTo(
    e,
    {
      xPercent: 10,
      autoAlpha: 0,
      ease: "common",
    },
    {
      xPercent: 0,
      autoAlpha: 1,
      scrollTrigger: {
        trigger: e,
        start: "top bottom",
        end: "bottom 20%",
        scrub: !0,
        toggleActions: "play none none reverse",
      },
    },
  );
});
const mxdSlideLeftToRight = document.querySelectorAll(".slide-left-to-right");
mxdSlideLeftToRight.forEach((e) => {
  gsap.fromTo(
    e,
    {
      xPercent: -10,
      autoAlpha: 0,
      ease: "common",
    },
    {
      xPercent: 0,
      autoAlpha: 1,
      scrollTrigger: {
        trigger: e,
        start: "top bottom",
        end: "bottom 20%",
        scrub: !0,
        toggleActions: "play none none reverse",
      },
    },
  );
});
const imageContainer = document.querySelectorAll(".mxd-clip-image");
imageContainer.forEach((e) => {
  const t = e.querySelector("img");
  gsap.set(e, {
    clipPath: "inset(0% 100% 1% 0%)",
  }),
    gsap.set(t, {
      scale: 1.2,
    });
  let o = gsap.timeline({
    scrollTrigger: {
      trigger: e,
      start: "top bottom",
      end: "top 50%",
      scrub: {
        scrub: !0,
        ease: "none",
      },
    },
  });
  o.to(
    e,
    {
      clipPath: "inset(0% 0% 0% 0%)",
    },
    "<",
  ),
    o.to(
      t,
      {
        scale: 1,
      },
      "<",
    );
});
const animSlideDownWraps = document.querySelectorAll(".anim-uni-slide-down");
animSlideDownWraps.forEach((e) => {
  const t = e.firstElementChild;
  gsap.fromTo(
    t,
    {
      yPercent: -100,
      ease: "none",
    },
    {
      yPercent: 0,
      scrollTrigger: {
        trigger: e,
        start: "top 90%",
        end: "bottom 70%",
        scrub: 1,
        toggleActions: "play none none reverse",
      },
    },
  );
});
const animSlideUpWraps = document.querySelectorAll(".anim-uni-slide-up");
animSlideUpWraps.forEach((e) => {
    const t = e.firstElementChild;
    gsap.fromTo(
      t,
      {
        yPercent: 100,
        ease: "none",
      },
      {
        yPercent: 0,
        scrollTrigger: {
          trigger: e,
          start: "top 90%",
          end: "top 70%",
          scrub: 1,
          toggleActions: "play none none reverse",
        },
      },
    );
  });
const animateInUp = document.querySelectorAll(".anim-uni-in-up");
animateInUp.forEach((e) => {
  gsap.fromTo(
    e,
    {
      opacity: 0,
      y: 50,
      ease: "sine",
    },
    {
      y: 0,
      opacity: 1,
      scrollTrigger: {
        trigger: e,
        toggleActions: "play none none reverse",
      },
    },
  );
});
const animateFadeIn = document.querySelectorAll(".anim-uni-fade-in");
animateFadeIn.forEach((e) => {
  gsap.fromTo(
    e,
    {
      opacity: 0,
      duration: 2,
      ease: "none",
    },
    {
      opacity: 1,
      duration: 2,
      scrollTrigger: {
        trigger: e,
        toggleActions: "play none none reverse",
      },
    },
  );
});
const animateClipIn = document.querySelectorAll(".anim-uni-clip-in");
animateClipIn.forEach((e) => {
  gsap.fromTo(
    e,
    {
      clipPath: "inset(0% 100% 0% 0%)",
      ease: "common",
    },
    {
      clipPath: "inset(0% 0% 0% 0%)",
      scrollTrigger: {
        trigger: e,
        start: "top 90%",
        end: "bottom 70%",
        scrub: 1,
        toggleActions: "play none none reverse",
      },
    },
  );
}),
  document.querySelector(".animate-card-2") &&
    (gsap.set(".animate-card-2", {
      y: 50,
      opacity: 0,
    }),
    ScrollTrigger.batch(".animate-card-2", {
      interval: 0.1,
      batchMax: 2,
      duration: 3,
      onEnter: (e) =>
        gsap.to(e, {
          opacity: 1,
          y: 0,
          ease: "sine",
          stagger: {
            each: 0.15,
            grid: [1, 2],
          },
          overwrite: !0,
        }),
      onLeave: (e) =>
        gsap.set(e, {
          opacity: 1,
          y: 0,
          overwrite: !0,
        }),
      onEnterBack: (e) =>
        gsap.to(e, {
          opacity: 1,
          y: 0,
          stagger: 0.15,
          overwrite: !0,
        }),
      onLeaveBack: (e) =>
        gsap.set(e, {
          opacity: 0,
          y: 50,
          overwrite: !0,
        }),
    }),
    ScrollTrigger.addEventListener("refreshInit", () =>
      gsap.set(".animate-card-2", {
        y: 0,
        opacity: 1,
      }),
    )),
  document.querySelector(".animate-card-3") &&
    (gsap.set(".animate-card-3", {
      y: 50,
      opacity: 0,
    }),
    ScrollTrigger.batch(".animate-card-3", {
      interval: 0.1,
      batchMax: 3,
      duration: 3,
      onEnter: (e) =>
        gsap.to(e, {
          opacity: 1,
          y: 0,
          ease: "sine",
          stagger: {
            each: 0.15,
            grid: [1, 3],
          },
          overwrite: !0,
        }),
      onLeave: (e) =>
        gsap.set(e, {
          opacity: 1,
          y: 0,
          overwrite: !0,
        }),
      onEnterBack: (e) =>
        gsap.to(e, {
          opacity: 1,
          y: 0,
          stagger: 0.15,
          overwrite: !0,
        }),
      onLeaveBack: (e) =>
        gsap.set(e, {
          opacity: 0,
          y: 50,
          overwrite: !0,
        }),
    }),
    ScrollTrigger.addEventListener("refreshInit", () =>
      gsap.set(".animate-card-3", {
        y: 0,
        opacity: 1,
      }),
    )),
  document.querySelector(".animate-card-4") &&
    (gsap.set(".animate-card-4", {
      y: 50,
      opacity: 0,
    }),
    ScrollTrigger.batch(".animate-card-4", {
      interval: 0.1,
      batchMax: 4,
      onEnter: (e) =>
        gsap.to(e, {
          opacity: 1,
          y: 0,
          ease: "sine",
          stagger: {
            each: 0.15,
            grid: [1, 4],
          },
          overwrite: !0,
        }),
      onLeave: (e) =>
        gsap.set(e, {
          opacity: 1,
          y: 0,
          overwrite: !0,
        }),
      onEnterBack: (e) =>
        gsap.to(e, {
          opacity: 1,
          y: 0,
          stagger: 0.15,
          overwrite: !0,
        }),
      onLeaveBack: (e) =>
        gsap.set(e, {
          opacity: 0,
          y: 50,
          overwrite: !0,
        }),
    }),
    ScrollTrigger.addEventListener("refreshInit", () =>
      gsap.set(".animate-card-4", {
        y: 0,
        opacity: 1,
      }),
    ));
const images = document.querySelectorAll(".parallax-img"),
  imagesSmall = document.querySelectorAll(".parallax-img-small"),
  video = document.querySelectorAll(".parallax-video");
function mxdPerspectiveList() {
  const e = document.querySelectorAll(".mxd-perspective-list");
  e.length &&
    e.forEach((e) => {
      e.querySelectorAll(".mxd-perspective-list__item").forEach((e) => {
        const t = e.querySelector(".mxd-perspective-list__inner");
        t &&
          (gsap.set(t, {
            rotateX: 0,
            opacity: 1,
            filter: "blur(0px)",
          }),
          gsap.to(t, {
            rotateX: 30,
            opacity: 0.3,
            filter: "blur(4px)",
            ease: "none",
            scrollTrigger: {
              trigger: e,
              start: "5% top",
              end: "bottom 40%",
              scrub: 0.6,
            },
          }));
      });
    });
}
// Ukiyo keeps its existing transforms; a shared ticker replaces three permanent RAF loops.
[[images, 1.4], [imagesSmall, 1.2], [video, 1.4]].forEach(([elements, scale]) => {
  if (!elements.length) return;
  const parallax = new Ukiyo(elements, { scale, speed: 1.5, externalRAF: true });
  window.removeEventListener('resize', parallax.onResizeEvent);
  window.removeEventListener('orientationchange', parallax.onResizeEvent);
  let previousY = NaN;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const tick = () => {
    if (document.hidden || motion.matches || previousY === window.scrollY) return;
    previousY = window.scrollY; parallax.animate();
  };
  gsap.ticker.add(tick);
  const unprepare = window.portfolioViewport.prepare(() => () => { parallax.reset(); previousY = NaN; });
  window.portfolioViewport.cleanup(() => { unprepare(); gsap.ticker.remove(tick); clearTimeout(parallax.timer); parallax.destroy(); });
});
const testimonialsSlider = document.querySelector(".swiper-testimonials");
testimonialsSlider &&
  new Swiper(".swiper-testimonials", {
    slidesPerView: "auto",
    grabCursor: !0,
    spaceBetween: 30,
    autoplay: !0,
    delay: 3e3,
    speed: 1e3,
    loop: !0,
    parallax: !0,
    loopFillGroupWithBlank: !0,
    pagination: {
      el: ".swiper-pagination",
      type: "fraction",
    },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
  });
const innerDemoSlider = document.querySelector(".mxd-demo-swiper");
function mxdFlipArrowOnScroll() {
  const e = document.querySelectorAll(".mxd-flip-arrow");
  e.length &&
    e.forEach((e) => {
      const t = e.querySelector(".arrow-container-1"),
        o = e.querySelector(".arrow-container-2"),
        r = t.querySelector("svg");
      if (!t || !o || !r) return;
      gsap.set(r, {
        position: "absolute",
        left: 0,
        top: 0,
      });
      const n = () => {
        const e = t.getBoundingClientRect(),
          r = o.getBoundingClientRect();
        return {
          startX: e.left,
          startY: e.top,
          endX: r.left,
          endY: r.top,
        };
      };
      let a = n();
      ScrollTrigger.create({
        trigger: e,
        start: "top 80%",
        end: "top 10%",
        scrub: !0,
        onUpdate: (e) => {
          const t = e.progress;
          gsap.set(r, {
            x: gsap.utils.interpolate(0, a.endX - a.startX, t),
            y: gsap.utils.interpolate(0, a.endY - a.startY, t),
          });
        },
        onRefresh: () => {
          a = n();
        },
      });
    });
}
function mxdColorSwitcher() {
  const e = document.querySelector("#color-switcher");
  function t() {
    let e = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
    const t = (function () {
      try {
        return localStorage.getItem("template.theme");
      } catch (e) {
        return null;
      }
    })();
    return t && (e = t), e;
  }
  function o(t) {
    const o = document.querySelector(":root");
    (e.innerHTML =
      "light" === t
        ? '<span class="switcher-text mxd-scramble">Night</span>\n            <span class="switcher-icon night">\n              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" version="1.1" viewBox="0 0 18 18">\n                <path d="M7.7,0h7.7v2.6h-2.6v2.6h-2.6v7.7h2.6v2.6h2.6v2.6h-7.7v-2.6h-2.6v-2.6h-2.6v-7.7h2.6v-2.6h2.6V0Z"/>\n              </svg>\n            </span>'
        : '<span class="switcher-text mxd-scramble">Day</span>\n            <span class="switcher-icon">\n              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" version="1.1" viewBox="0 0 18 18">\n                <path d="M8,0h2v2h-2V0ZM2,2h2v2h-2v-2ZM14,2h2v2h-2v-2ZM6,4h6v2h2v6h-2v2h-6v-2h-2v-6h2v-2ZM0,8h2v2H0v-2ZM16,8h2v2h-2v-2ZM2,14h2v2h-2v-2ZM14,14h2v2h-2v-2ZM8,16h2v2h-2v-2Z"/>\n              </svg>\n            </span>'),
      o.setAttribute("color-scheme", `${t}`);
  }
  e &&
    (e.addEventListener("click", () => {
      let e = t();
      (e = "dark" === e ? "light" : "dark"),
        (function (e, t) {
          try {
            localStorage.setItem("template.theme", t);
          } catch (e) {}
        })(0, e),
        o(e);
    }),
    o(t()));
}
function mxdHeroVideoScale() {
  const e = document.querySelectorAll("[data-flip-element='wrapper']"),
    t = document.querySelector("[data-flip-element='target']");
  if (!e.length || !t) return;
  let o, r;
  function n() {
    o &&
      (o.scrollTrigger?.kill(), o.kill(),
      gsap.set(t, {
        clearProps: "all",
      })),
      (o = gsap.timeline({
        scrollTrigger: {
          trigger: e[0],
          start: "bottom center-=100",
          endTrigger: e[e.length - 1],
          end: "top center",
          scrub: 0.55,
        },
      })),
      e.forEach((r, n) => {
        const a = e[n + 1];
        if (!a) return;
        const s =
            r.getBoundingClientRect().top +
            window.pageYOffset +
            r.offsetHeight / 2,
          i =
            a.getBoundingClientRect().top +
            window.pageYOffset +
            a.offsetHeight / 2 -
            s;
        o.add(
          Flip.fit(t, a, {
            duration: i,
            ease: "none",
          }),
        );
      });
  }
  function a() { return n; }
  return (
    n(),
    (r = window.portfolioViewport.prepare(a)),
    () => {
      o && o.kill(), r();
    }
  );
}
function mxdHeroVideoSwap() {
  const e = document.getElementById("mxd-hero-06__video");
  if (!e) return;
  const t = window.matchMedia("(max-aspect-ratio: 3/4)");
  let o = null;
  function r(t) {
    const r = t ? "portrait" : "landscape";
    if (r === o) return;
    (o = r),
      (function (t) {
        const o = t ? e.dataset.posterPortrait : e.dataset.posterLandscape;
        e.poster !== o && (e.poster = o);
      })(t),
      e.pause(),
      (e.innerHTML = "");
    const n = document.createElement("source");
    (n.src = e.dataset[`${r}Mp4`]), (n.type = "video/mp4");
    const a = document.createElement("source");
    (a.src = e.dataset[`${r}Webm`]),
      (a.type = "video/webm"),
      e.append(a, n),
      e.load(),
      e.play().catch(() => {});
  }
  r(t.matches),
    t.addEventListener("change", (e) => {
      r(e.matches);
    });
}
function mxdHero3dImages() {
  const e = document.querySelector(".mxd-hero-02"),
    t = document.querySelector(".mxd-hero-02__images"),
    o = document.querySelectorAll(".hero-02__img"),
    r = document.querySelector(".mxd-hero-02__cover-img"),
    n = document.querySelector(".mxd-hero-02__intro h1"),
    a = document.querySelector(".mxd-hero-02__outro p");
  if (!(t && r && n && a)) return;
  if (!e) return;
  let s = null,
    i = null;
  (s = SplitText.create(n, {
    type: "words, chars",
  })),
    gsap.set(s.chars, {
      opacity: 1,
    }),
    (i = SplitText.create(a, {
      type: "words, chars",
    })),
    gsap.set(i.chars, {
      opacity: 0,
    }),
    gsap.set(a, {
      opacity: 1,
    });
  const c = window.innerWidth,
    l = window.innerHeight,
    d = c < 768,
    p = d ? 2.5 : 0.5,
    u = Array.from(o).map(() => ({
      x: 0,
      y: 0,
      z: -1e3,
      scale: 0,
    })),
    m = [
      {
        x: 1.3,
        y: 0.7,
      },
      {
        x: -1.5,
        y: 1,
      },
      {
        x: 1.1,
        y: -1.3,
      },
      {
        x: -1.7,
        y: -0.8,
      },
      {
        x: 0.8,
        y: 1.5,
      },
      {
        x: -1,
        y: -1.4,
      },
      {
        x: 1.6,
        y: 0.3,
      },
      {
        x: -0.7,
        y: 1.7,
      },
      {
        x: 1.2,
        y: -1.6,
      },
      {
        x: -1.4,
        y: 0.9,
      },
      {
        x: 1.8,
        y: 0.5,
      },
      {
        x: 1.1,
        y: -1.8,
      },
      {
        x: 0.9,
        y: 1.8,
      },
      {
        x: -1.9,
        y: 0.4,
      },
      {
        x: 1,
        y: -1.9,
      },
      {
        x: -0.8,
        y: 1.9,
      },
      {
        x: 1.7,
        y: -1,
      },
      {
        x: -1.3,
        y: -1.2,
      },
      {
        x: 0.7,
        y: 2,
      },
      {
        x: 1.25,
        y: -0.2,
      },
    ].map((e) => ({
      x: e.x * c * p,
      y: e.y * l * p,
      z: 2e3,
      scale: 1,
    }));
  o.forEach((e, t) => {
    gsap.set(e, u[t]);
  }),
    gsap.set(r, {
      z: -1e3,
      scale: 0,
      x: 0,
      y: 0,
    }),
    ScrollTrigger.create({
      trigger: ".mxd-hero-02",
      start: "top top",
      end: `+=${10 * window.innerHeight}px`,
      pin: !0,
      pinSpacing: !0,
      scrub: 1,
      onUpdate: (e) => {
        const t = e.progress;
        o.forEach((e, o) => {
          const r = 0.03 * o,
            n = d ? 4 : 2;
          let a = Math.max(0, 4 * (t - r));
          const s = u[o],
            i = m[o],
            c = gsap.utils.interpolate(s.z, i.z, a),
            l = gsap.utils.interpolate(s.scale, i.scale, a * n),
            p = gsap.utils.interpolate(s.x, i.x, a),
            g = gsap.utils.interpolate(s.y, i.y, a);
          gsap.set(e, {
            z: c,
            scale: l,
            x: p,
            y: g,
          });
        });
        const n = Math.max(0, 4 * (t - 0.7)),
          a = 1e3 * n - 1e3,
          c = Math.min(1, 2 * n);
        if (
          (gsap.set(r, {
            z: a,
            scale: c,
            x: 0,
            y: 0,
          }),
          s && s.chars.length > 0)
        )
          if (t >= 0.6 && t <= 0.75) {
            const e = (t - 0.6) / 0.15,
              o = s.chars.length;
            s.chars.forEach((t, r) => {
              const n = r / o;
              if (e >= n + 0.1)
                gsap.set(t, {
                  opacity: 0,
                });
              else if (e <= n)
                gsap.set(t, {
                  opacity: 1,
                });
              else {
                const o = 1 - (e - n) / 0.1;
                gsap.set(t, {
                  opacity: o,
                });
              }
            });
          } else
            t < 0.6
              ? gsap.set(s.chars, {
                  opacity: 1,
                })
              : t > 0.75 &&
                gsap.set(s.chars, {
                  opacity: 0,
                });
        if (i && i.chars.length > 0)
          if (t >= 0.8 && t <= 0.95) {
            const e = (t - 0.8) / 0.15,
              o = i.chars.length;
            i.chars.forEach((t, r) => {
              const n = r / o;
              if (e >= n + 0.1)
                gsap.set(t, {
                  opacity: 1,
                });
              else if (e <= n)
                gsap.set(t, {
                  opacity: 0,
                });
              else {
                const o = (e - n) / 0.1;
                gsap.set(t, {
                  opacity: o,
                });
              }
            });
          } else
            t < 0.8
              ? gsap.set(i.chars, {
                  opacity: 0,
                })
              : t > 0.95 &&
                gsap.set(i.chars, {
                  opacity: 1,
                });
      },
    });
}
function mxdHeroInertia() {
  const e = document.querySelector(".mxd-hero-07");
  if (!e) return;
  let t = 0,
    o = 0,
    r = 0,
    n = 0;
  e.addEventListener("mousemove", (e) => {
    (r = e.clientX - t), (n = e.clientY - o), (t = e.clientX), (o = e.clientY);
  }),
    e.querySelectorAll(".mxd-hero-07__object").forEach((e) => {
      e.addEventListener("mouseenter", () => {
        const t = gsap.timeline({
          onComplete: () => {
            t.kill();
          },
        });
        t.timeScale(1.2);
        const o = e.querySelector("img");
        t.to(o, {
          inertia: {
            x: {
              velocity: 30 * r,
              end: 0,
            },
            y: {
              velocity: 30 * n,
              end: 0,
            },
          },
        }),
          t.fromTo(
            o,
            {
              rotate: 0,
            },
            {
              duration: 0.4,
              rotate: 30 * (Math.random() - 0.5),
              yoyo: !0,
              repeat: 1,
              ease: "power1.inOut",
            },
            "<",
          );
      });
    });
}
function mxdHeroHorizontal() {
  const e = document.querySelector(".mxd-hero-04__wrap"),
    t = document.querySelector(".mxd-hero-04__slides"),
    o = document.querySelector(".mxd-hero-04__slider"),
    r = document.querySelectorAll(".mxd-hero-04__slide"),
    n = r.length;
  if (!e) return;
  r.forEach((e) => {
    const t = e.querySelector(".mxd-hero-04__name p"),
      o = e.querySelector(".mxd-hero-04__descr p");
    gsap.set([t, o], {
      yPercent: 120,
    });
  });
  let a = -1;
  ScrollTrigger.create({
    trigger: e,
    start: "top top",
    end: () => "+=" + window.innerHeight * (n - 0.5),
    scrub: !0,
    pin: !0,
    pinSpacing: !0,
    invalidateOnRefresh: !0,
    snap: {
      snapTo: 1 / (n - 1),
      duration: {
        min: 0.2,
        max: 0.6,
      },
      ease: "none",
    },
    onUpdate: (e) => {
      const s = o.offsetWidth,
        i = t.scrollWidth - s,
        c = e.progress * i;
      gsap.set(t, {
        x: -c,
      });
      const l = c / s,
        d = Math.floor(l),
        p = l - d;
      let u = p > 0.33 ? d + 1 : d;
      (u = Math.max(0, Math.min(n - 1, u))),
        r.forEach((e, t) => {
          const o = e.querySelector("img");
          if (o)
            if (t === d || t === d + 1) {
              const e = t === d ? p : p - 1;
              gsap.set(o, {
                x: e * s * 0.25,
                scale: 1.25,
              });
            } else
              gsap.set(o, {
                x: 0,
                scale: 1.25,
              });
        }),
        u !== a &&
          ((a = u),
          r.forEach((e, t) => {
            const o = e.querySelector(".mxd-hero-04__name p"),
              r = e.querySelector(".mxd-hero-04__descr p");
            t === a
              ? (gsap.to(o, {
                  yPercent: 0,
                  duration: 0.7,
                  ease: "power3.out",
                }),
                gsap.to(r, {
                  yPercent: 0,
                  duration: 0.7,
                  delay: 0.08,
                  ease: "power3.out",
                }))
              : gsap.to([o, r], {
                  yPercent: 120,
                  duration: 0.5,
                  ease: "power2.in",
                });
          }));
    },
  });
}
function mxdHeroBannersHover() {
  const e = document.querySelector(".banners-hover");
  if (!e) return;
  let t = null,
    o = !1;
  const r = [
    {
      trigger: document.querySelector(".banners-trigger-1"),
      banners: document.querySelectorAll(".headline-banner-01"),
    },
    {
      trigger: document.querySelector(".banners-trigger-2"),
      banners: document.querySelectorAll(".headline-banner-02"),
    },
  ];
  r.forEach((e) => {
    e.trigger &&
      e.banners.length &&
      (gsap.set(e.banners, {
        clipPath: "inset(0% 0% 100% 0%)",
        y: 20,
      }),
      (e.tl = gsap
        .timeline({
          paused: !0,
          defaults: {
            duration: 0.5,
            ease: "hop",
          },
        })
        .to(e.banners, {
          clipPath: "inset(0% 0% 0% 0%)",
          y: 0,
        })));
  }),
    r.forEach((e) => {
      e.trigger &&
        e.tl &&
        e.trigger.addEventListener("mouseenter", () => {
          o ||
            t === e ||
            (t
              ? ((o = !0),
                t.tl.eventCallback("onReverseComplete", () => {
                  (t = e), e.tl.play(), (o = !1);
                }),
                t.tl.reverse())
              : ((t = e), e.tl.play()));
        });
    }),
    e.addEventListener("mouseleave", () => {
      t &&
        !o &&
        ((o = !0),
        t.tl.eventCallback("onReverseComplete", () => {
          (t = null), (o = !1);
        }),
        t.tl.reverse());
    });
}
function mxdHeroTyped() {
  var e = $(".animated-type");
  e &&
    e.length &&
    new Typed("#typed", {
      stringsElement: "#typed-strings",
      showCursor: !0,
      cursorChar: "_",
      loop: !0,
      typeSpeed: 70,
      backSpeed: 30,
      backDelay: 2500,
    });
}
innerDemoSlider &&
  new Swiper(".mxd-demo-swiper", {
    breakpoints: {
      640: {
        slidesPerView: 1,
        spaceBetween: 30,
      },
      768: {
        slidesPerView: 3,
        spaceBetween: 30,
      },
      1600: {
        slidesPerView: 3,
        spaceBetween: 30,
      },
    },
    loop: !0,
    parallax: !0,
    autoplay: {
      disableOnInteraction: !1,
      enabled: !0,
    },
    grabCursor: !0,
    speed: 1200,
    centeredSlides: !0,
    keyboard: {
      enabled: !0,
    },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
  }),
  $(function () {
    var e = function (e, t) {
      (this.el = e || {}),
        (this.multiple = t || !1),
        this.el.find(".main-menu__toggle").on(
          "click",
          {
            el: this.el,
            multiple: this.multiple,
          },
          this.dropdown,
        );
    };
    (e.prototype.dropdown = function (e) {
      var t = e.data.el;
      const $this = $(this), $next = $this.next();

        $next.slideToggle(),
        $this.parent().toggleClass("open"),
        e.data.multiple ||
          t.find(".submenu").not($next).slideUp().parent().removeClass("open");
    }),
      new e($("#main-menu"), !1),
      $(".mxd-accordion__title").on("click", function (e) {
        e.preventDefault();
        var t = $(this);
        t.hasClass("accordion-active accordion-opened") ||
          ($(".mxd-accordion__content").slideUp(400),
          $(".mxd-accordion__title").removeClass(
            "accordion-active accordion-opened",
          ),
          $(".mxd-accordion__arrow").removeClass("accordion-rotate")),
          t.toggleClass("accordion-active accordion-opened"),
          t.next().slideToggle(),
          $(".mxd-accordion__arrow", this).toggleClass("accordion-rotate");
      }),
      $("#contact-form").submit(function () {
        var e = $(this);
        return (
          $.ajax({
            type: "POST",
            url: "mail.php",
            data: e.serialize(),
          }).done(function () {
            $(".contact").find(".form").addClass("is-hidden"),
              $(".contact").find(".form__reply").addClass("is-visible"),
              setTimeout(function () {
                $(".contact").find(".form__reply").removeClass("is-visible"),
                  $(".contact")
                    .find(".form")
                    .delay(300)
                    .removeClass("is-hidden"),
                  e.trigger("reset");
              }, 5e3);
          }),
          !1
        );
      });
  }),
  mxdFlipArrowOnScroll();
