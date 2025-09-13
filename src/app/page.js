"use client";
import "./index.css";
import "./preloader.css";
import { useRef, useState, useEffect } from "react";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CustomEase from "gsap/CustomEase";
import { useGSAP } from "@gsap/react";
import { useLenis } from "lenis/react";

import Nav from "@/components/Nav/Nav";
import ConditionalFooter from "@/components/ConditionalFooter/ConditionalFooter";
import AnimatedButton from "@/components/AnimatedButton/AnimatedButton";
import FeaturedProjects from "@/components/FeaturedProjects/FeaturedProjects";
import ClientReviews from "@/components/ClientReviews/ClientReviews";
import CTAWindow from "@/components/CTAWindow/CTAWindow";
import Copy from "@/components/Copy/Copy";

let isInitialLoad = true;
gsap.registerPlugin(ScrollTrigger, CustomEase);
CustomEase.create("hop", "0.9, 0, 0.1, 1");

export default function Home() {
  const tagsRef = useRef(null);
  const [showPreloader, setShowPreloader] = useState(isInitialLoad);
  const [loaderAnimating, setLoaderAnimating] = useState(false);
  const lenis = useLenis();

  useEffect(() => {
    return () => {
      isInitialLoad = false;
    };
  }, []);

  useEffect(() => {
    if (lenis) {
      if (loaderAnimating) {
        lenis.stop();
      } else {
        lenis.start();
      }
    }
  }, [lenis, loaderAnimating]);

  useGSAP(() => {
    const tl = gsap.timeline({
      delay: 0.3,
      defaults: {
        ease: "hop",
      },
    });

    if (showPreloader) {
      setLoaderAnimating(true);
      const counts = document.querySelectorAll(".count");

      counts.forEach((count, index) => {
        const digits = count.querySelectorAll(".digit h1");

        tl.to(
          digits,
          {
            y: "0%",
            duration: 1,
            stagger: 0.075,
          },
          index * 1
        );

        if (index < counts.length) {
          tl.to(
            digits,
            {
              y: "-100%",
              duration: 1,
              stagger: 0.075,
            },
            index * 1 + 1
          );
        }
      });

      tl.to(".spinner", {
        opacity: 0,
        duration: 0.3,
      });

      tl.to(
        ".word h1",
        {
          y: "0%",
          duration: 1,
        },
        "<"
      );

      tl.to(".divider", {
        scaleY: "100%",
        duration: 1,
        onComplete: () =>
          gsap.to(".divider", { opacity: 0, duration: 0.3, delay: 0.3 }),
      });

      tl.to("#word-1 h1", {
        y: "100%",
        duration: 1,
        delay: 0.3,
      });

      tl.to(
        "#word-2 h1",
        {
          y: "-100%",
          duration: 1,
        },
        "<"
      );

      tl.to(
        ".block",
        {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
          duration: 1,
          stagger: 0.1,
          delay: 0.75,
          onStart: () => {
            gsap.to(".hero-img", { scale: 1, duration: 2, ease: "hop" });
          },
          onComplete: () => {
            gsap.set(".loader", { pointerEvents: "none" });
            setLoaderAnimating(false);
          },
        },
        "<"
      );
    }
  }, [showPreloader]);

  useGSAP(
    () => {
      if (!tagsRef.current) return;

      const tags = tagsRef.current.querySelectorAll(".what-we-do-tag");
      gsap.set(tags, { opacity: 0, x: -40 });

      ScrollTrigger.create({
        trigger: tagsRef.current,
        start: "top 90%",
        once: true,
        animation: gsap.to(tags, {
          opacity: 1,
          x: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
        }),
      });
    },
    { scope: tagsRef }
  );

  return (
    <>
      {showPreloader && (
        <div className="loader">
          <div className="overlay">
            <div className="block"></div>
            <div className="block"></div>
          </div>
          <div className="intro-logo">
            <div className="word" id="word-1">
              <h1>
                <span>UDHBAVA</span>
              </h1>
            </div>
            <div className="word" id="word-2">
              <h1>Spark The Future</h1>
            </div>
          </div>
          <div className="divider"></div>
         
        <div className="counter">
<div className="counter">
  <div className="count">
    <div className="digit"><h1>0</h1></div>
    <div className="digit"><h1>0</h1></div>
  </div>
  <div className="count">
    <div className="digit"><h1>2</h1></div>
    <div className="digit"><h1>7</h1></div>
  </div>
  <div className="count">
    <div className="digit"><h1>6</h1></div>
    <div className="digit"><h1>5</h1></div>
  </div>
  <div className="count">
    <div className="digit"><h1>9</h1></div>
    <div className="digit"><h1>8</h1></div>
  </div>
  <div className="count">
    <div className="digit"><h1>9</h1></div>
    <div className="digit"><h1>9</h1></div>
  </div>
</div>
          </div>
        </div>
      )}
      <Nav />
      <section className="hero">
        <div className="hero-bg">
          <img src="/home/aa.png" alt="Udbhava Tech Fest" />
        </div>
        <div className="hero-gradient"></div>
        <div className="container">
          <div className="hero-content">
            <div className="hero-header">
              <Copy animateOnScroll={false} delay={showPreloader ? 10 : 0.85}>
                <h1>
                  Udbhava - Spark The Future
                </h1>
              </Copy>
            </div>
            <div className="hero-tagline">
              <Copy animateOnScroll={false} delay={showPreloader ? 10.15 : 1}>
                <p>
                 Organized by Nitte Institute of Professional Education (NIPE), Udbhava 2025 is where innovation meets imagination. From the flagship Hackathon – Reality Rewritten to a galaxy of thrilling competitions, Udbhava invites you to explore, create, and celebrate the future.
                </p>
              </Copy>
            </div>
            <AnimatedButton
              label="View Events"
              route="/events"
              animateOnScroll={false}
              delay={showPreloader ? 10.3 : 1.15}
            />
          </div>
        </div>
        <div className="hero-stats">
          <div className="container">
            <div className="stat">
              <div className="stat-count">
                <Copy delay={0.1}>
                  <h2>10+</h2>
                </Copy>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-info">
                <Copy delay={0.15}>
                  <p>Exciting events across domains</p>
                </Copy>
              </div>
            </div>
            <div className="stat">
              <div className="stat-count">
                <Copy delay={0.2}>
                  <h2>500+</h2>
                </Copy>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-info">
                <Copy delay={0.25}>
                  <p>Participants from multiple colleges</p>
                </Copy>
              </div>
            </div>
            <div className="stat">
              <div className="stat-count">
                <Copy delay={0.3}>
                  <h2>2</h2>
                </Copy>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-info">
                <Copy delay={0.35}>
                  <p>Days of competitions & celebration</p>
                </Copy>
              </div>
            </div>
            <div className="stat">
              <div className="stat-count">
                <Copy delay={0.4}>
                  <h2>1</h2>
                </Copy>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-info">
                <Copy delay={0.45}>
                  <p>Flagship Hackathon – Reality Rewritten</p>
                </Copy>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="what-we-do">
        <div className="container">
          <div className="what-we-do-header">
            <Copy delay={0.1}>
              <h1>
                Udbhava invites you to innovate, collaborate, and shine through
                technology, creativity, and teamwork.
              </h1>
            </Copy>
          </div>
          <div className="what-we-do-content">
            <div className="what-we-do-col">
              <Copy delay={0.1}>
                <p>What makes us unique</p>
              </Copy>
              <Copy delay={0.15}>
                <p className="lg">
                  Every event at Udbhava is designed to spark curiosity and
                  challenge boundaries. From coding to gaming, design to debate,
                  each activity inspires collaboration and celebrates talent
                  across disciplines.
                </p>
              </Copy>
            </div>
            <div className="what-we-do-col">
              <div className="what-we-do-tags" ref={tagsRef}>
                <div className="what-we-do-tag">
                  <h3>Hackathon</h3>
                </div>
                <div className="what-we-do-tag">
                  <h3>Gaming</h3>
                </div>
                <div className="what-we-do-tag">
                  <h3>Web Odyssey</h3>
                </div>
                <div className="what-we-do-tag">
                  <h3>Orbital Clash</h3>
                </div>
                <div className="what-we-do-tag">
                  <h3>Chrono Code</h3>
                </div>
                <div className="what-we-do-tag">
                  <h3>Creativity & Design</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="featured-projects-container">
        <div className="container">
          <div className="featured-projects-header-callout">
            <Copy delay={0.1}>
              <p>Highlights</p>
            </Copy>
          </div>
          <div className="featured-projects-header">
            <Copy delay={0.15}>
              <h2>A glimpse into Udbhava 2025 events</h2>
            </Copy>
          </div>
        </div>
        <FeaturedProjects />
      </section>
      
      <section className="gallery-callout">
        <div className="container">
          <div className="gallery-callout-col">
            <div className="gallery-callout-row">
              <div className="gallery-callout-img gallery-callout-img-1">
                <img
                  src="/gallery-callout/gallery-callout-1.jpg"
                  alt="Udbhava moments"
                />
              </div>
              <div className="gallery-callout-img gallery-callout-img-2">
                <img
                  src="/gallery-callout/gallery-callout-2.jpg"
                  alt="Tech fest highlights"
                />
                <div className="gallery-callout-img-content">
                  <h3>1000+</h3>
                  <p>Memorable snapshots</p>
                </div>
              </div>
            </div>
            <div className="gallery-callout-row">
              <div className="gallery-callout-img gallery-callout-img-3">
                <img src="/gallery-callout/gallery-callout-3.jpg" alt="" />
              </div>
              <div className="gallery-callout-img gallery-callout-img-4">
                <img src="/gallery-callout/gallery-callout-4.jpg" alt="" />
              </div>
            </div>
          </div>
          <div className="gallery-callout-col">
            <div className="gallery-callout-copy">
              <Copy delay={0.1}>
                <h3>
                  Take a closer look at the events, competitions, and memories
                  that define Udbhava – where creativity meets technology and
                  innovation takes flight.
                </h3>
              </Copy>
              <AnimatedButton label="Explore Gallery" route="/gallery" />
            </div>
          </div>
        </div>
      </section>

      <ConditionalFooter />
    </>
  );
}
