import Link from 'next/link';
import Image from 'next/image';
import styles from './home.module.css';
import { FaEnvelope, FaWhatsapp } from 'react-icons/fa';

const serviceGroups = [
  {
    number: '01',
    title: 'Work & Driver Support',
    description:
      'Practical support for delivery drivers, taxi drivers and working professionals.',
    services: [
      'Insurance agent tasks',
      'Maternity and paternity pay support',
      'Sick and accident claims',
      'CBT support',
    ],
  },
  {
    number: '02',
    title: 'Accounts & Technology',
    description:
      'Reliable help with delivery platforms, account access and everyday technology needs.',
    services: [
      'Delivery account creation & recovery',
      'Just Eat zone changes',
      'Credit card assistance',
      'Amazon, Yodel & Evri account support',
      'Just Eat tax information updates',
    ],
  },
  {
    number: '03',
    title: 'Education & Travel',
    description:
      'Guidance for university admission, student support and important travel plans.',
    services: [
      'University admission & student maintenance',
      'Air ticket assistance',
      'Hajj & Umrah travel',
      'Passport renewal & No Visa',
    ],
  },
];

const stats = [
  { value: '03+', label: 'Service Areas' },
  { value: '12+', label: 'Services Available' },
  { value: 'UK', label: 'Based & Serving' },
  { value: '24/7', label: 'Online Enquiries' },
];

export default function Home() {
  return (
    <main className={styles.site}>
      {/* NAVBAR */}
      <header className={styles.header}>
        <a href="#home" className={styles.brand}>
          <div className={styles.logoBox}>
            <Image
              src="/Easy Tech solution logo.png"
              alt="EASYTECH LONDON LTD"
              width={70}
              height={70}
              priority
            />
          </div>

          <div className={styles.brandText}>
            <strong>EASYTECH</strong>
            <span>LONDON LTD</span>
          </div>
        </a>

        <nav className={styles.nav}>
          <a href="#home">Home</a>
          <a href="#services">Services</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>

          <Link href="/admin/login" className={styles.adminBtn}>
            Admin Login <span>↗</span>
          </Link>
        </nav>
      </header>

      {/* HERO */}
      <section className={styles.hero} id="home">
        <div className={styles.heroGlowOne} />
        <div className={styles.heroGlowTwo} />

        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <span className={styles.liveDot} />
            UK SERVICE &amp; SUPPORT COMPANY
          </div>

          <h1>
            Simple help.
            <br />
            <span>Real solutions.</span>
            <br />
            One trusted place.
          </h1>

          <p className={styles.heroDescription}>
            EASYTECH LONDON LTD helps individuals and working professionals
            with IT, delivery driver support, insurance, education,
            documentation and travel services.
          </p>

          <div className={styles.heroButtons}>
            <a href="#services" className={styles.primaryBtn}>
              Explore Services
              <span>↗</span>
            </a>

            <a href="#contact" className={styles.secondaryBtn}>
              Talk to our team
            </a>
          </div>

          <div className={styles.heroTrust}>
            <div className={styles.avatarStack}>
              <span>ET</span>
              <span>UK</span>
              <span>✓</span>
            </div>

            <div>
              <strong>Here to make things easier</strong>
              <small>Practical support with a personal touch.</small>
            </div>
          </div>
        </div>

        {/* HERO VISUAL */}
        <div className={styles.heroVisual}>
          <div className={styles.visualGrid} />

          <div className={styles.visualCircleOuter}>
            <div className={styles.visualCircle}>
              <Image
                src="/Easy Tech solution logo.png"
                alt="EASYTECH LONDON LTD"
                width={190}
                height={190}
              />
            </div>
          </div>

          <div className={`${styles.floatingCard} ${styles.cardOne}`}>
            <div className={styles.cardIcon}>✓</div>
            <div>
              <strong>Driver Support</strong>
              <span>Work &amp; insurance</span>
            </div>
          </div>

          <div className={`${styles.floatingCard} ${styles.cardTwo}`}>
            <div className={styles.cardIcon}>⌁</div>
            <div>
              <strong>Technology</strong>
              <span>Accounts &amp; assistance</span>
            </div>
          </div>

          <div className={`${styles.floatingCard} ${styles.cardThree}`}>
            <div className={styles.cardIcon}>✦</div>
            <div>
              <strong>Travel &amp; Education</strong>
              <span>Plans made simpler</span>
            </div>
          </div>

          <div className={styles.visualLabel}>
            <span>01</span>
            <div />
            <p>SUPPORT<br />THAT MOVES<br />WITH YOU</p>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className={styles.stats}>
        {stats.map((stat) => (
          <div className={styles.stat} key={stat.label}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </div>
        ))}
      </section>

      {/* SERVICES */}
      <section className={styles.services} id="services">
        <div className={styles.sectionTop}>
          <div>
            <span className={styles.sectionEyebrow}>
              WHAT WE CAN HELP WITH
            </span>

            <h2>
              Services built around
              <br />
              <span>your next step.</span>
            </h2>
          </div>

          <div className={styles.sectionDescription}>
            <p>
              From delivery work to university admission and travel,
              we bring different essential services together in one place.
            </p>

            <a href="#contact">
              Need something else?
              <span>↗</span>
            </a>
          </div>
        </div>

        <div className={styles.serviceGrid}>
          {serviceGroups.map((group) => (
            <article
              className={styles.serviceCard}
              key={group.number}
            >
              <div className={styles.serviceCardTop}>
                <span className={styles.serviceNumber}>
                  {group.number}
                </span>

                <span className={styles.serviceArrow}>↗</span>
              </div>

              <h3>{group.title}</h3>

              <p>{group.description}</p>

              <div className={styles.serviceDivider} />

              <ul>
                {group.services.map((service) => (
                  <li key={service}>
                    <span>✓</span>
                    {service}
                  </li>
                ))}
              </ul>

              <a href="#contact" className={styles.serviceLink}>
                Ask about this service
                <span>→</span>
              </a>
            </article>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <section className={styles.about} id="about">
        <div className={styles.aboutVisual}>
          <div className={styles.aboutBox}>
            <span className={styles.aboutSmall}>EASYTECH</span>

            <strong>
              EASY
              <br />
              DOES
              <br />
              IT.
            </strong>

            <span className={styles.aboutBottom}>
              EST. WITH CARE
            </span>
          </div>

          <div className={styles.aboutCircle}>
            <span>UK</span>
            <small>HERE TO HELP</small>
          </div>
        </div>

        <div className={styles.aboutContent}>
          <span className={styles.sectionEyebrow}>
            A LITTLE ABOUT US
          </span>

          <h2>
            Real people.
            <br />
            <span>Helpful answers.</span>
          </h2>

          <p>
            EASYTECH LONDON LTD (Company No: 17165157, formerly UK Bangla Creation Ltd) is an Information Technology Company
            focused on making essential services easier to access.
          </p>

          <p>
            We combine practical guidance with personal support so
            customers can understand their options and take the next
            step with confidence.
          </p>

          <div className={styles.ownerCard}>
            <div className={styles.ownerAvatar}>MK</div>

            <div>
              <span>COMPANY OWNER</span>
              <strong>Md Kamrul Islam</strong>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <div className={styles.ctaGlow} />

        <div>
          <span>LET&apos;S GET YOU MOVING</span>

          <h2>
            Have a question?
            <br />
            <em>Let&apos;s talk.</em>
          </h2>
        </div>

        <a href="#contact" className={styles.ctaButton}>
          Contact EASYTECH
          <span>↗</span>
        </a>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer} id="contact">
        <div className={styles.footerMain}>
          <div className={styles.footerIntro}>
            <a href="#home" className={styles.footerLogo}>
              <Image
                src="/Easy Tech solution logo.png"
                alt="EASYTECH LONDON LTD"
                width={65}
                height={65}
              />

              <div>
                <strong>EASYTECH</strong>
                <span>LONDON LTD</span>
              </div>
            </a>

            <p>
              Your one-stop service &amp; support partner in the UK.
            </p>
          </div>

          <div className={styles.footerContact}>
            <span>GET IN TOUCH</span>

            <a href="mailto:EASYTECHsolutionuk@gmail.com" className={styles.contactItem}>
              <FaEnvelope className={styles.emailIcon} />
              <span>easytechsolutionuk@gmail.com</span>
              <b>↗</b>
            </a>

            <a href="https://wa.me/447514585898" target="_blank" rel="noopener noreferrer" className={styles.contactItem}>
              <FaWhatsapp className={styles.whatsappIcon} />
              <span>+44 7514 585898</span>
              <b>↗</b>
            </a>
          </div>

          
        </div>

        <div className={styles.footerBottom}>
          <span>
            © {new Date().getFullYear()} EASYTECH LONDON LTD. All rights reserved.
          </span>

        

          <Link href="/admin/login">
            Admin Login ↗
          </Link>
        </div>
      </footer>
    </main>
  );
}