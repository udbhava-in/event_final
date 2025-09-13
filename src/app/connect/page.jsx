"use client";
import "./contact.css";

import Nav from "@/components/Nav/Nav";
import ConditionalFooter from "@/components/ConditionalFooter/ConditionalFooter";
import Copy from "@/components/Copy/Copy";

const page = () => {
  return (
    <>
      <Nav />
      <div className="page contact">
        <section className="contact-hero">
          <div className="container">
            <div className="contact-col">
              <div className="contact-hero-header">
                <Copy delay={0.85}>
                  <h1>UDHBHAVA – Spark the Future</h1>
                </Copy>
              </div>
              <div className="contact-copy-year">
                <Copy delay={0.1}>
                  <h1>&copy; 2025</h1>
                </Copy>
              </div>
            </div>

            <div className="contact-col">
              <div className="contact-info">
                <div className="contact-info-block">
                  <Copy delay={0.85}>
                    <p>General Queries</p>
                    <p>udbhava25nipe@gmail.com</p>
                  </Copy>
                </div>

                <div className="contact-info-block">
                  <Copy delay={1}>
                    <p>Event Coordinators</p>
                    <p>Krishnendu Prashanth: 96054 49546</p>
                    <p>Rudranarayan: 63606 71227</p>
                  </Copy>
                </div>

                <div className="contact-info-block">
                  <Copy delay={1.15}>
                    <p>College Address</p>
                    <p>Nitte Institute of Professional Education (NIPE)</p>
                    <p>Padil Campus, NH-75</p>
                    <p>Next to First Neuro Hospital, Kodakkal</p>
                    <p>Mangaluru – 575007, Karnataka, India</p>
                  </Copy>
                </div>

                <div className="contact-info-block">
                  <Copy delay={1.3}>
                    <p>Follow Us</p>
                    <p>Instagram</p>
                    <p>LinkedIn</p>
                    <p>Twitter</p>
                  </Copy>
                </div>
              </div>

              <div className="contact-img">
                <img
                  src="/contact/udhbava-contact.jpg"
                  alt="Udbhava tech fest at NIPE campus"
                />
              </div>
            </div>
          </div>
        </section>
      </div>
      <ConditionalFooter />
    </>
  );
};

export default page;
