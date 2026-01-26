import Link from 'next/link';
import React from 'react';

const TermsConditionArea = () => {
  return (
    <>
      <section className="bd-policy-area section-space">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-10">
              <div className="bd-policy-wrapper p-relative z-index-1">
                <div className="bd-policy-item">
                  <h4 className="bd-policy-title">Effective Date</h4>
                  <p>Effective Date: 27/05/2025</p>
                </div>

                <div className="bd-policy-item">
                  <h4 className="bd-policy-title">Welcome</h4>
                  <p>
                    Welcome to <strong>EnamNotes.com</strong>, a platform built to empower beginners
                    and students in their journey to master coding skills.
                  </p>
                </div>

                <div className="bd-policy-item">
                  <h4 className="bd-policy-title">Agreement to Terms</h4>
                  <p>
                    By accessing and using our website, you agree to comply with and be bound by the
                    following terms and conditions. If you disagree with any part of these terms,
                    please do not use the site.
                  </p>
                </div>

                <div className="bd-policy-item">
                  <h4 className="bd-policy-title">1. Use of the Website</h4>
                  <p>
                    You agree to use this website only for lawful educational purposes and in a way
                    that does not infringe the rights or restrict the use of others.
                  </p>
                </div>

                <div className="bd-policy-item">
                  <h4 className="bd-policy-title">2. Content Ownership</h4>
                  <p>
                    All content on this site, including articles, videos, infographics, and
                    tutorials, is owned by EnamNotes unless otherwise stated. You may reference the
                    material with proper credit, but redistribution without permission is
                    prohibited.
                  </p>
                </div>

                <div className="bd-policy-item">
                  <h4 className="bd-policy-title">3. User Accounts</h4>
                  <p>
                    Some features (e.g., enrolling in courses) may require account creation. You
                    agree to provide accurate information and to keep your credentials secure.
                  </p>
                </div>

                <div className="bd-policy-item">
                  <h4 className="bd-policy-title">4. Limitation of Liability</h4>
                  <p>
                    We aim to provide accurate, up-to-date content. However, EnamNotes is not
                    responsible for any decisions made based on the content, including coding errors
                    or business outcomes.
                  </p>
                </div>

                <div className="bd-policy-item">
                  <h4 className="bd-policy-title">5. External Links</h4>
                  <p>
                    Our website may link to third-party tools (e.g., GitHub, YouTube). We are not
                    responsible for the content or privacy practices of external sites.
                  </p>
                </div>

                <div className="bd-policy-item">
                  <h4 className="bd-policy-title">6. Modification of Terms</h4>
                  <p>
                    We reserve the right to change these terms at any time. You’ll be notified of
                    significant changes via email or on this page.
                  </p>
                </div>

                <div className="bd-policy-contact">
                  <h4 className="bd-policy-title">Contact Us</h4>
                  <p className="mb-10">
                    If you have any questions or concerns about these Terms and Conditions, please
                    contact us at:
                  </p>
                  <ul>
                    <li>
                      Email:{' '}
                      <span>
                        <Link href="mailto:ntt080703@gmail.com">ntt080703@gmail.com</Link>
                      </span>
                    </li>
                  </ul>
                  <div className="bd-policy-address">
                    <p className="mb-0">
                      <Link href="#">
                        Dhaka <br /> Bangladesh
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default TermsConditionArea;
