"use client";
import "./about.css";

import Nav from "@/components/Nav/Nav";
import ConditionalFooter from "@/components/ConditionalFooter/ConditionalFooter";
import HowWeWork from "@/components/HowWeWork/HowWeWork";
import Spotlight from "@/components/Spotlight/Spotlight";
import CTAWindow from "@/components/CTAWindow/CTAWindow";
import Copy from "@/components/Copy/Copy";

const page = () => {
  return (
    <>
      <Nav />
      <div className="page studio">
        <section className="studio-hero">
          <div className="container">
            <div className="studio-hero-col">
              <Copy delay={0.85}>
                <p>
                  Udbhava is more than a fest – it’s a celebration of
                  technology, creativity, and collaboration, bringing together
                  bright minds from across disciplines.
                </p>
              </Copy>
            </div>
            <div className="studio-hero-col">
              <Copy delay={0.85}>
                <h2>
                  Our event is built to inspire innovation and teamwork. From
                  hackathons to debates, gaming to design, Udbhava gives
                  everyone a stage to shine and create lasting memories.
                </h2>
              </Copy>
              <div className="studio-hero-hero-img">
                <img src="/posters/1.png" alt="About Udbhava" />
              </div>
            </div>
          </div>
        </section>
        <section className="more-facts">
          <div className="container">
            <div className="more-facts-items">
              <div className="fact">
                <Copy delay={0.1}>
                  <p>Exciting Events</p>
                  <h2>8+</h2>
                </Copy>
              </div>
              <div className="fact">
                <Copy delay={0.2}>
                  <p>Participants</p>
                  <h2>500+</h2>
                </Copy>
              </div>
              <div className="fact">
                <Copy delay={0.3}>
                  <p>Colleges Engaged</p>
                  <h2>20+</h2>
                </Copy>
              </div>
              <div className="fact">
                <Copy delay={0.4}>
                  <p>Days of Fest</p>
                  <h2>2</h2>
                </Copy>
              </div>
              <div className="fact">
                <Copy delay={0.5}>
                  <p>Flagship Hackathon</p>
                  <h2>1</h2>
                </Copy>
              </div>
            </div>
          </div>
        </section>
        <section className="how-we-work-container">
          <div className="container">
            <HowWeWork />
          </div>
        </section>
        <CTAWindow
          img="/nipe.jpg"
          header="Udbhava 2025"
          callout="Ignite Innovation · Spark the Future"
          description="Udbhava is powered by passion, collaboration, and creativity. Explore how participants turn ideas into reality and celebrate the spirit of technology."
        />
        <Spotlight />
      </div>
      <ConditionalFooter />
    </>
  );
};

export default page;
