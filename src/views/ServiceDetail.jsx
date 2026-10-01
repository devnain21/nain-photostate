'use client'

import Link from 'next/link'
import StructuredData from '@/src/components/StructuredData'
import { siteConfig, getAbsoluteUrl } from '@/src/lib/seo'
import { getServiceDocuments } from '@/src/lib/service-documents'
import '@/src/Styles/service-detail.css'

export default function ServiceDetail({ service }) {
  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.title,
    description: service.description,
    provider: {
      '@type': 'LocalBusiness',
      name: siteConfig.businessName,
      url: siteConfig.siteUrl,
      telephone: siteConfig.phone,
      address: {
        '@type': 'PostalAddress',
        addressLocality: siteConfig.address.locality,
        addressRegion: siteConfig.address.region,
        addressCountry: siteConfig.address.country,
      },
    },
    areaServed: ['Danoda Kalan', 'Jind', 'Haryana'],
    url: getAbsoluteUrl(`/services/${service.slug}`),
  }

  const faqSchema = service.faqs?.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: service.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.a,
          },
        })),
      }
    : null

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteConfig.siteUrl },
      { '@type': 'ListItem', position: 2, name: service.title, item: getAbsoluteUrl(`/services/${service.slug}`) },
    ],
  }

  const documents = getServiceDocuments(service)
  const whatsappHref = `${siteConfig.links.whatsapp}?text=${encodeURIComponent(`Namaste, mujhe ${service.title} ke liye madad chahiye.\nNain CSC, Danoda Kalan.`)}`

  return (
    <div className="page service-detail-page">
      <StructuredData data={serviceSchema} />
      <StructuredData data={breadcrumbSchema} />
      {faqSchema && <StructuredData data={faqSchema} />}

      <nav className="sd-breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span>/</span>
        <span>{service.title}</span>
      </nav>

      <header className="sd-hero">
        <div className="sd-hero-top">
          <div className="sd-icon">
            <i className={service.icon}></i>
          </div>
          <div className="sd-hero-text">
            <h1>{service.heading}</h1>
            <p className="sd-category-badge">{service.category === 'id' ? 'ID & Documents' : service.category === 'kisan' ? 'Kisan Services' : service.category === 'student' ? 'Student & Education' : service.category === 'welfare' ? 'Welfare & Schemes' : service.category === 'utility' ? 'Utility Services' : 'Tools'}</p>
          </div>
          <a href={service.externalUrl} target="_blank" rel="noopener noreferrer" className="sd-visit-link" title="Official Website">
            <i className="fas fa-external-link-alt"></i> Visit Site
          </a>
        </div>
      </header>

      <article className="sd-body">
        <section className="sd-card sd-docs-card">
          <h2><i className="fas fa-folder-open"></i> Saath kya laayein</h2>
          <ul className="sd-benefits">
            {documents.map((item) => (
              <li key={item}><i className="fas fa-check"></i><span>{item}</span></li>
            ))}
          </ul>
        </section>

        <section className="sd-about">
          <h2>{service.title} Kya Hai?</h2>
          <p>{service.intro}</p>
          {service.aboutExtra && <p>{service.aboutExtra}</p>}
        </section>

        {service.benefits?.length > 0 && (
          <section className="sd-card">
            <h2><i className="fas fa-star"></i> Iske Fayde</h2>
            <ul className="sd-benefits">
              {service.benefits.map((b, i) => (
                <li key={i}><i className="fas fa-check"></i><span>{b}</span></li>
              ))}
            </ul>
          </section>
        )}

        {service.process?.length > 0 && (
          <section className="sd-card">
            <h2><i className="fas fa-route"></i> Kaise Karein – Step by Step</h2>
            <ol className="sd-steps">
              {service.process.map((step, i) => (
                <li key={i}>
                  <span className="sd-step-num">{i + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {service.tips?.length > 0 && (
          <section className="sd-card sd-tips-card">
            <h2><i className="fas fa-lightbulb"></i> Zaruri Tips</h2>
            <ul className="sd-tips">
              {service.tips.map((tip, i) => (
                <li key={i}><i className="fas fa-info-circle"></i><span>{tip}</span></li>
              ))}
            </ul>
          </section>
        )}

        {service.localHelp?.length > 0 && (
          <section className="sd-card sd-tips-card">
            <h2><i className="fas fa-hands-helping"></i> Nain CSC Se Kaunsi Help Milegi</h2>
            <ul className="sd-tips">
              {service.localHelp.map((item, i) => (
                <li key={i}><i className="fas fa-check-circle"></i><span>{item}</span></li>
              ))}
            </ul>
          </section>
        )}

        {service.faqs?.length > 0 && (
          <section className="sd-card">
            <h2><i className="fas fa-question-circle"></i> Aksar Puchhe Jaane Wale Sawal</h2>
            <div className="sd-faq-list">
              {service.faqs.map((faq, i) => (
                <details key={i} className="sd-faq-item">
                  <summary>{faq.q}</summary>
                  <p>{faq.a}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        <section className="sd-help">
          <div className="sd-help-content">
            <i className="fas fa-hands-helping sd-help-icon"></i>
            <div>
              <h2>Hum Aapki Madad Kar Sakte Hain</h2>
              <p>
                Agar aapko <strong>{service.title}</strong> me koi problem aa rahi hai ya aap khud se nahi kar pa rahe,
                to <strong>Nain CSC Center (Nain Photostate Danoda), Jind</strong> par aayein. Hamare trained operators aapka poora kaam karwa denge - form filling se lekar final submission tak.
              </p>
              <div className="sd-help-actions">
                <a href={`tel:${siteConfig.phone}`} className="sd-help-btn sd-help-call">
                  <i className="fas fa-phone-alt"></i> Call Karein
                </a>
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="sd-help-btn sd-help-wa">
                  <i className="fab fa-whatsapp"></i> WhatsApp
                </a>
                <Link href="/contact" className="sd-help-btn sd-help-contact">
                  <i className="fas fa-envelope"></i> Contact Page
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="sd-bottom-visit">
          <a href={service.externalUrl} target="_blank" rel="noopener noreferrer" className="sd-bottom-btn">
            <i className="fas fa-external-link-alt"></i>
            {service.title} – Official Website par Jaayein
          </a>
        </div>
      </article>
    </div>
  )
}
