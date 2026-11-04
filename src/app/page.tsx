import Link from 'next/link';
import Image from 'next/image';
import styles from './home.module.css';
import {
  FaEnvelope,
  FaFacebookF,
  FaInstagram,
  FaWhatsapp,
  FaCheck,
  FaArrowRight,
  FaPhoneAlt,
  FaShieldAlt,
  FaCar,
  FaUserCheck,
} from 'react-icons/fa';

// ৩টি ক্যাটাগরির সার্ভিস ও ভিডিও ডেটা
const serviceGroups = [
  {
    number: '01',
    category: 'Driver & Delivery Support',
    title: 'UK Delivery Drivers Login & Account Support',
    description:
      'Stuck with login or sign up issues on delivery apps? We provide comprehensive, step-by-step assistance for UK delivery drivers facing account creation hurdles, recovery, zone changes, and platform verifications.',
    subtext: 'Get fast, independent, and trusted guidance tailored to your delivery platform.',
    services: [
      'Account Creation & Recovery (Just Eat, Deliveroo, Uber Eats, Stuart)',
      'Just Eat Zone Change & Tax Information Updates',
      'Amazon Flex, Yodel, InPost & Evri Account Support',
      'Step-by-Step Problem Guidance & Resolution',
    ],
    callout: 'Instant WhatsApp assistance available — solve your delivery account problems today!',
    videoId: 'j1EiQMi7cbQ',
    videoTitle: 'UK Delivery Drivers Account & App Support Guide',
    whatsappMsg: 'Hello EasyTech London, I need urgent help with UK Delivery Driver Account & App Support.',
    isReversed: false, // 1st: Left Details, Right Video
  },
  {
    number: '02',
    category: 'Driver Welfare & Claims',
    title: "Driver Sick Pay, Injury Claims & Parental Benefits",
    description:
      "Can't drive? Your income doesn't have to stop! Understanding sick pay, injury claims, and maternity/paternity support for delivery and taxi drivers in the UK can be complex.",
    subtext: 'We help you check your options, collect evidence, and complete your paperwork with clear guidance.',
    services: [
      'Delivery & Taxi Driver Maternity / Paternity Pay',
      'Delivery & Taxi Driver Sick / Accident Claims',
      'Policy Guidance & Official Claim Representation',
      'Paperwork Filing & Evidence Collection Support',
    ],
    callout: 'Protect your livelihood — claim what you are legally entitled to receive with peace of mind.',
    videoId: '3DKKXYD9TjQ',
    videoTitle: 'Delivery & Taxi Driver Sick Pay & Claims Guide',
    whatsappMsg: 'Hello EasyTech London, I need advice on Driver Sick Pay, Injury Claims, or Maternity/Paternity Support.',
    isReversed: true, // 2nd: Left Video, Right Details
  },
  {
    number: '03',
    category: 'Insurance & Vehicle Solutions',
    title: 'Easy Buy & Rent: Insurance & Flexible Vehicle Rental',
    description:
      'Protect what matters most with Easy Buy & Rent Limited! We provide reliable insurance and flexible vehicle rental solutions tailored for working professionals and drivers in the UK.',
    subtext: 'Transparent terms, competitive weekly pricing, and zero hidden complications.',
    services: [
      'Family, Business & Commercial Vehicle Comprehensive Cover',
      'Dedicated Policy Guidance & Ongoing Claim Support',
      'Renewal Reminders & Policy Optimization',
      'Easy Vehicle Access & Flexible Payment Plans',
      'Ownership Transfer & Registration Assistance',
    ],
    callout: 'Hit the road with total confidence, backed by clear terms and verified support.',
    videoId: 'LBVnVwm1U_c',
    videoTitle: 'Easy Buy & Rent - UK Vehicle Rental & Insurance Guide',
    whatsappMsg: 'Hello EasyTech London, I want to inquire about Easy Buy & Rent Insurance and Vehicle Rental.',
    isReversed: false, // 3rd: Left Details, Right Video
  },
];

const stats = [
  { value: '03+', label: 'Specialized Sectors', sub: 'Driver, Tech & Protection' },
  { value: '15+', label: 'Active Support Lines', sub: 'Covering Major Apps' },
  { value: 'UK', label: 'London Headquartered', sub: 'Serving Nationwide' },
  { value: '24/7', label: 'Priority Response', sub: 'Instant WhatsApp Desk' },
];

export default function Home() {
  return (
    <main className={styles.site}>
      {/* BACKGROUND AMBIENT MESH */}
      <div className={styles.bgMeshGradient} aria-hidden="true">
        <div className={styles.meshOrbOne} />
        <div className={styles.meshOrbTwo} />
        <div className={styles.meshOrbThree} />
      </div>

      {/* FLOATING GLASS HEADER */}
      <header className={styles.header}>
        <div className={styles.headerContainer}>
          <a href="#home" className={styles.brand}>
            <div className={styles.logoBox}>
              <Image
                src="/Easy Tech solution logo.png"
                alt="EASYTECH LONDON LTD"
                width={46}
                height={46}
                priority
              />
            </div>

            <div className={styles.brandText}>
              <strong>EASYTECH</strong>
              <span>LONDON LTD</span>
            </div>
          </a>

          <nav className={styles.nav}>
            <a href="#home" className={styles.navLink}>Home</a>
            <a href="#services" className={styles.navLink}>Services</a>
            <a href="#about" className={styles.navLink}>About</a>
            <a href="#contact" className={styles.navLink}>Contact</a>

            <Link href="/admin/login" className={styles.adminBtn}>
              <span>Admin Portal</span>
              <span className={styles.adminArrow}>↗</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className={styles.hero} id="home">
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <span className={styles.livePulseDot} />
            <span>UK REGISTERED SERVICE &amp; SUPPORT SPECIALISTS</span>
          </div>

          <h1 className={styles.heroTitle}>
            Simple help.
            <br />
            <span className={styles.heroGradientText}>Real solutions.</span>
            <br />
            One trusted place.
          </h1>

          <p className={styles.heroDescription}>
            EASYTECH LONDON LTD supports delivery drivers, taxi operators, and
            working professionals across the UK with account recovery, insurance,
            sick claims, and essential technology guidance.
          </p>

          <div className={styles.heroButtons}>
            <a href="#services" className={styles.primaryBtn}>
              <span>Explore Services &amp; Guides</span>
              <FaArrowRight className={styles.btnArrow} />
            </a>

            <a href="#contact" className={styles.secondaryBtn}>
              <FaPhoneAlt className={styles.phoneIcon} />
              <span>Talk to our team</span>
            </a>
          </div>

          <div className={styles.heroTrustCard}>
            <div className={styles.avatarStack}>
              <span>ET</span>
              <span>UK</span>
              <span>✓</span>
            </div>

            <div className={styles.trustText}>
              <div className={styles.starRating}>★★★★★ <strong>4.9 / 5.0</strong></div>
              <small>Practical support with an independent, personal touch.</small>
            </div>
          </div>
        </div>

        {/* HERO VISUAL MOCKUP */}
        <div className={styles.heroVisual}>
          <div className={styles.visualBackdropGlow} />
          
          <div className={styles.visualCircleOuter}>
            <div className={styles.radarRingOne} />
            <div className={styles.radarRingTwo} />

            <div className={styles.visualCircle}>
              <Image
                src="/Easy Tech solution logo.png"
                alt="EASYTECH LONDON LTD"
                width={170}
                height={170}
                priority
              />
            </div>
          </div>

          {/* FLOATING GLASS CARDS */}
          <div className={`${styles.floatingGlassCard} ${styles.cardTopLeft}`}>
            <div className={styles.cardIconBox}><FaCar /></div>
            <div>
              <strong>Driver Support</strong>
              <span>Accounts &amp; Just Eat</span>
            </div>
          </div>

          <div className={`${styles.floatingGlassCard} ${styles.cardMidRight}`}>
            <div className={`${styles.cardIconBox} ${styles.iconBoxGreen}`}><FaShieldAlt /></div>
            <div>
              <strong>Claims &amp; Benefits</strong>
              <span>Sick Pay &amp; Injury</span>
            </div>
          </div>

          <div className={`${styles.floatingGlassCard} ${styles.cardBottomLeft}`}>
            <div className={`${styles.cardIconBox} ${styles.iconBoxPurple}`}><FaUserCheck /></div>
            <div>
              <strong>Vehicle &amp; Cover</strong>
              <span>Easy Buy &amp; Rent</span>
            </div>
          </div>

          <div className={styles.heroStatusPill}>
            <span className={styles.statusPulse} />
            <span>Active Desk • London, United Kingdom</span>
          </div>
        </div>
      </section>

      {/* STATS STRIP */}
      <section className={styles.stats}>
        <div className={styles.statsGrid}>
          {stats.map((stat) => (
            <div className={styles.statCard} key={stat.label}>
              <strong>{stat.value}</strong>
              <span className={styles.statLabel}>{stat.label}</span>
              <small className={styles.statSub}>{stat.sub}</small>
            </div>
          ))}
        </div>
      </section>

      {/* SERVICES WITH VIDEO (ALTERNATING SENIOR UI) */}
      <section className={styles.services} id="services">
        <div className={styles.sectionTop}>
          <div className={styles.sectionHeaderLeft}>
            <span className={styles.sectionEyebrow}>
              WHAT WE CAN HELP WITH
            </span>

            <h2 className={styles.sectionHeading}>
              Services built around
              <br />
              <span>your next step.</span>
            </h2>
          </div>

          <div className={styles.sectionHeaderRight}>
            <p>
              Watch our detailed video guides below to understand exactly how we
              assist UK delivery drivers, taxi operators, and businesses with fast,
              practical solutions.
            </p>

            <a href="#contact" className={styles.needHelpLink}>
              <span>Need customized assistance?</span>
              <b>↗</b>
            </a>
          </div>
        </div>

        {/* ALTERNATING SERVICE ROWS */}
        <div className={styles.serviceList}>
          {serviceGroups.map((group) => (
            <article
              className={`${styles.serviceCardRow} ${
                group.isReversed ? styles.serviceCardRowReversed : ''
              }`}
              key={group.number}
            >
              {/* DETAILS SIDE */}
              <div className={styles.serviceDetails}>
                <div className={styles.metaRow}>
                  <span className={styles.numberBadge}>{group.number}</span>
                  <span className={styles.categoryPill}>{group.category}</span>
                </div>

                <h3 className={styles.serviceTitle}>{group.title}</h3>

                <p className={styles.serviceDesc}>{group.description}</p>
                
                {group.subtext && (
                  <p className={styles.serviceSubtext}>{group.subtext}</p>
                )}

                <div className={styles.dividerLine} />

                <h4 className={styles.bulletListHeading}>Core Capabilities:</h4>
                <ul className={styles.featureList}>
                  {group.services.map((service) => (
                    <li key={service}>
                      <span className={styles.checkCircle}>
                        <FaCheck />
                      </span>
                      <span>{service}</span>
                    </li>
                  ))}
                </ul>

                <div className={styles.calloutBox}>
                  <p>{group.callout}</p>
                </div>

                <div className={styles.serviceButtonRow}>
                  <a
                    href={`https://wa.me/447514585898?text=${encodeURIComponent(
                      group.whatsappMsg
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.whatsappActionBtn}
                  >
                    <FaWhatsapp className={styles.waIcon} />
                    <span>WhatsApp Consultation</span>
                  </a>

                  <a href="#contact" className={styles.enquireActionBtn}>
                    <span>Enquire Online</span>
                    <FaArrowRight className={styles.enquireArrow} />
                  </a>
                </div>
              </div>

              {/* VIDEO SIDE WITH MULTI-LAYERED GLOW & APPARATUS */}
              <div className={styles.serviceVideo}>
                <div className={styles.videoAmbientGlow} />

                <div className={styles.videoPlayerApp}>
                  <div className={styles.videoWindowChrome}>
                    <div className={styles.trafficDots}>
                      <span className={styles.dotRed} />
                      <span className={styles.dotYellow} />
                      <span className={styles.dotGreen} />
                    </div>
                    <div className={styles.videoLiveBadge}>
                      <span className={styles.liveRedDot} />
                      OFFICIAL GUIDE
                    </div>
                  </div>

                  <div className={styles.videoAspectContainer}>
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${group.videoId}?rel=0`}
                      title={group.videoTitle}
                      loading="lazy"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section className={styles.about} id="about">
        <div className={styles.aboutVisual}>
          <div className={styles.aboutGeometricCard}>
            <div className={styles.aboutGeometricTop}>
              <span className={styles.aboutBrandTag}>EASYTECH LONDON</span>
              <span className={styles.aboutFlagPill}>🇬🇧 UK</span>
            </div>

            <strong className={styles.aboutHeroWordmark}>
              EASY<br />DOES<br />IT.
            </strong>

            <div className={styles.aboutGeometricBottom}>
              <span>EST. WITH CARE &amp; INTEGRITY</span>
              <small>Serving Drivers Across Great Britain</small>
            </div>
          </div>

          <div className={styles.aboutFloatingBadge}>
            <strong>UK</strong>
            <span>ALWAYS HERE</span>
          </div>
        </div>

        <div className={styles.aboutContent}>
          <span className={styles.sectionEyebrow}>A LITTLE ABOUT US</span>

          <h2 className={styles.aboutTitle}>
            Real people.
            <br />
            <span>Helpful answers.</span>
          </h2>

          <p className={styles.aboutLead}>
            EASYTECH LONDON LTD is an Information Technology &amp; Professional Support
            Company focused on making essential UK services and driver rights accessible to everyone.
          </p>

          <p className={styles.aboutBody}>
            We combine practical procedural guidance with real, one-on-one human
            support so you can resolve account suspensions, claim legitimate sick pay,
            and manage vehicle requirements with complete confidence.
          </p>

          <div className={styles.ownerCard}>
            <div className={styles.ownerAvatar}>MK</div>

            <div className={styles.ownerInfo}>
              <span className={styles.ownerTitle}>COMPANY FOUNDER &amp; DIRECTOR</span>
              <strong className={styles.ownerName}>Md Kamrul Islam</strong>
            </div>

            <div className={styles.verifiedBadge}>
              <span>✓ Verified Leadership</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className={styles.cta}>
        <div className={styles.ctaGlowOrb} />

        <div className={styles.ctaTextGroup}>
          <span className={styles.ctaEyebrow}>LET&apos;S GET YOU MOVING TODAY</span>

          <h2 className={styles.ctaTitle}>
            Have a question or urgent issue?
            <br />
            <em>Let&apos;s talk with our experts.</em>
          </h2>

          <p className={styles.ctaSubtext}>
            Message us on WhatsApp for fast, independent, and confidential support.
          </p>
        </div>

        <div className={styles.ctaButtonGroup}>
          <a
            href="https://wa.me/447514585898"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.ctaWhatsappBtn}
          >
            <FaWhatsapp />
            <span>Chat On WhatsApp</span>
          </a>

          <a href="#contact" className={styles.ctaContactBtn}>
            <span>Contact EasyTech</span>
            <b>↗</b>
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer} id="contact">
        <div className={styles.footerMain}>
          <div className={styles.footerIntro}>
            <a href="#home" className={styles.footerLogo}>
              <Image
                src="/Easy Tech solution logo.png"
                alt="EASYTECH LONDON LTD"
                width={58}
                height={58}
              />

              <div>
                <strong>EASYTECH</strong>
                <span>LONDON LTD</span>
              </div>
            </a>

            <p>
              Your trusted service &amp; support partner for UK delivery drivers,
              taxi professionals, vehicle cover, and technology assistance.
            </p>

            <div className={styles.footerLocationBadge}>
              <span className={styles.locationDot} />
              <span>London, United Kingdom</span>
            </div>
          </div>

          <div className={styles.footerContact}>
            <span className={styles.footerColTitle}>GET IN TOUCH</span>

            <a href="mailto:easytechsolutionuk@gmail.com" className={styles.contactItem}>
              <div className={styles.contactIconCircle}>
                <FaEnvelope className={styles.emailIcon} />
              </div>
              <div className={styles.contactText}>
                <small>Email Support</small>
                <span>easytechsolutionuk@gmail.com</span>
              </div>
              <b className={styles.contactArrow}>↗</b>
            </a>

            <a href="https://wa.me/447514585898" target="_blank" rel="noopener noreferrer" className={styles.contactItem}>
              <div className={styles.contactIconCircle}>
                <FaWhatsapp className={styles.whatsappIcon} />
              </div>
              <div className={styles.contactText}>
                <small>WhatsApp &amp; Phone</small>
                <span>+44 7514 585898</span>
              </div>
              <b className={styles.contactArrow}>↗</b>
            </a>
          </div>

          <div className={styles.footerSocialCol}>
            <span className={styles.footerColTitle}>OFFICIAL SOCIALS</span>

            <div className={styles.socialButtonsGroup}>
              <a
                href="https://www.instagram.com/easytechlondon.ltd/?hl=en"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialPill}
                aria-label="Visit EASYTECH on Instagram"
              >
                <FaInstagram className={styles.instagramIcon} />
                <span>Instagram</span>
                <b>↗</b>
              </a>

              <a
                href="https://www.facebook.com/profile.php?id=61594847097764"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialPill}
                aria-label="Visit EASYTECH on Facebook"
              >
                <FaFacebookF className={styles.facebookIcon} />
                <span>Facebook</span>
                <b>↗</b>
              </a>
            </div>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <span>
            © {new Date().getFullYear()} EASYTECH LONDON LTD. All rights reserved.
          </span>

          <div className={styles.footerBottomLinks}>
            <a href="#services">Services</a>
            <span className={styles.footerDot}>•</span>
            <a href="#about">About</a>
            <span className={styles.footerDot}>•</span>
            <Link href="/admin/login" className={styles.footerAdminLink}>
              Admin Login ↗
            </Link>
          </div>
        </div>
      </footer>

      {/* FLOATING WHATSAPP PILL WITH RIPPLE */}
      <a
        href="https://wa.me/447514585898"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.floatingWhatsApp}
        aria-label="Chat with EASYTECH on WhatsApp"
      >
        <span className={styles.waPulseWave} />
        <FaWhatsapp className={styles.waFloatingIcon} />
      </a>
    </main>
  );
}