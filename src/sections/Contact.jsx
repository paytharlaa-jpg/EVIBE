import { useEffect, useRef, useState } from 'react';
import { gsap } from '../lib/scroll';
import { useGsap } from '../lib/useGsap';
import { prefersReducedMotion } from '../lib/device';
import { company, contact, waLink } from '../content';
import Magnetic from '../components/Magnetic';
import Tilt from '../components/Tilt';

const ICONS = {
  wa: 'M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.7-1.2 2.2 2.2 0 0 0 .2-1.2c-.1-.1-.3-.2-.5-.3Z',
  call: 'M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.2 11.4 11.4 0 0 0 3.6.6 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.2.2 2.4.6 3.6a1 1 0 0 1-.3 1Z',
  mail: 'M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm9 7.2L4 7.3V17h16V7.3Zm0-2.3L19.2 7H4.8Z',
};

const channels = [
  { id: 'wa', label: 'WhatsApp', value: company.phone, href: waLink(), note: 'Fastest reply', external: true },
  { id: 'call', label: 'Call us', value: company.phone, href: company.phoneHref, note: 'Speak to our team' },
  { id: 'mail', label: 'Email', value: company.email, href: `mailto:${company.email}`, note: 'For detailed requirements' },
];

// Enquiry form (fields per the approved content). `type` pre-selects the
// enquiry type (e.g. a franchise format); ?type= in the URL works too.
export default function Contact({ bare = false, type, cards = true, id = 'enquiry' }) {
  const root = useRef(null);
  const initialType = () => {
    const q = new URLSearchParams(window.location.search).get('type');
    return [type, q].find((t) => t && contact.types.includes(t)) || '';
  };
  const [form, setForm] = useState(() => ({ name: '', phone: '', email: '', type: initialType(), city: '', land: '', msg: '' }));
  useEffect(() => {
    if (type && contact.types.includes(type)) setForm((f) => ({ ...f, type }));
  }, [type]);
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState('');

  useGsap(
    () => {
      if (prefersReducedMotion()) return;
      if (!bare) gsap.fromTo(
        '.ct-title .line-in',
        { yPercent: 110, letterSpacing: '0.08em' },
        { yPercent: 0, letterSpacing: '-0.04em', duration: 1.5, stagger: 0.1, ease: 'expo.out', scrollTrigger: { trigger: '.ct-title', start: 'top 85%' } },
      );
      if (!bare) gsap.fromTo('.ct-title', { scale: 1.08, transformOrigin: '0% 100%' }, { scale: 1, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'top 20%', scrub: 0.9 } });
      if (cards) gsap.from('.ct-card', { y: 60, opacity: 0, rotateX: -20, duration: 1.1, stagger: 0.1, ease: 'expo.out', scrollTrigger: { trigger: '.ct-cards', start: 'top 85%' } });
      gsap.from('.ct-form .field, .ct-form .ct-actions', { y: 30, opacity: 0, duration: 0.9, stagger: 0.06, ease: 'power3.out', scrollTrigger: { trigger: '.ct-form', start: 'top 85%' } });
    },
    [],
    root,
  );

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const validate = () => {
    const er = {};
    if (form.name.trim().length < 2) er.name = 'Please tell us your name.';
    if (!/^[+\d][\d\s-]{8,15}$/.test(form.phone.trim())) er.phone = 'Enter a valid phone number, e.g. 98765 43210.';
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) er.email = 'Enter a valid email address.';
    if (!form.type) er.type = 'Please select an enquiry type.';
    setErrors(er);
    if (Object.keys(er).length) {
      document.getElementById(`ct-${Object.keys(er)[0]}`)?.focus();
      return false;
    }
    return true;
  };

  const message = () =>
    [
      'Hi EVIBE, I would like to explore an opportunity with you.',
      `Name: ${form.name.trim()}`,
      `Phone: ${form.phone.trim()}`,
      form.email.trim() && `Email: ${form.email.trim()}`,
      `Interested in: ${form.type}`,
      form.city.trim() && `City / location: ${form.city.trim()}`,
      form.land && `Land availability: ${form.land}`,
      form.msg.trim() && `Requirement: ${form.msg.trim()}`,
    ]
      .filter(Boolean)
      .join('\n');

  const sendWhatsApp = (e) => {
    e.preventDefault();
    if (!validate()) return;
    window.open(waLink(message()), '_blank', 'noopener');
    setSent('WhatsApp opened with your details. Just press send.');
  };
  const sendEmail = () => {
    if (!validate()) return;
    window.location.href = `mailto:${company.email}?subject=${encodeURIComponent(`EVIBE enquiry: ${form.type}`)}&body=${encodeURIComponent(message())}`;
    setSent('Your email app opened with the details filled in.');
  };

  return (
    <section id={id} className={`contact section ${bare ? 'contact--bare' : ''}`} data-theme="dark" ref={root} aria-labelledby={bare ? undefined : 'contact-title'} aria-label={bare ? 'Contact options and enquiry form' : undefined}>
      {!bare && <div className="ct-stage" aria-hidden="true" />}
      <div className={bare ? 'ct-grid' : 'wrap ct-grid'}>
        <div className="ct-main">
          {!bare && (
            <>
              <p className="eyebrow">{contact.kicker}</p>
              <h2 className="ct-title" id="contact-title" aria-label={contact.title.join(' ')}>
                {contact.title.map((l) => (
                  <span className="line" key={l} aria-hidden="true">
                    <span className="line-in">{l}</span>
                  </span>
                ))}
              </h2>
              <p className="ct-body">{contact.body}</p>
            </>
          )}

          {cards && <div className="ct-cards">
            {channels.map((c) => (
              <Tilt
                as="a"
                key={c.id}
                href={c.href}
                className={`ct-card ct-card--${c.id}`}
                max={6}
                {...(c.external ? { target: '_blank', rel: 'noopener' } : {})}
              >
                <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
                  <path d={ICONS[c.id]} fill="currentColor" />
                </svg>
                <span className="ct-card-label">{c.label}</span>
                <span className="ct-card-value">{c.value}</span>
                <span className="ct-card-note">{c.note}</span>
              </Tilt>
            ))}
          </div>}

          <form className="ct-form" onSubmit={sendWhatsApp} noValidate>
            <div className={`field ${errors.name ? 'has-error' : ''}`}>
              <label htmlFor="ct-name">Your name *</label>
              <input id="ct-name" autoComplete="name" value={form.name} onChange={set('name')} aria-invalid={!!errors.name} aria-describedby={errors.name ? 'ct-name-err' : undefined} />
              {errors.name && (
                <p className="field-err" id="ct-name-err">
                  {errors.name}
                </p>
              )}
            </div>
            <div className={`field ${errors.phone ? 'has-error' : ''}`}>
              <label htmlFor="ct-phone">Phone number *</label>
              <input id="ct-phone" type="tel" inputMode="tel" autoComplete="tel" value={form.phone} onChange={set('phone')} aria-invalid={!!errors.phone} aria-describedby={errors.phone ? 'ct-phone-err' : undefined} />
              {errors.phone && (
                <p className="field-err" id="ct-phone-err">
                  {errors.phone}
                </p>
              )}
            </div>
            <div className={`field ${errors.email ? 'has-error' : ''}`}>
              <label htmlFor="ct-email">
                Email address <small>(optional)</small>
              </label>
              <input id="ct-email" type="email" autoComplete="email" value={form.email} onChange={set('email')} aria-invalid={!!errors.email} aria-describedby={errors.email ? 'ct-email-err' : undefined} />
              {errors.email && (
                <p className="field-err" id="ct-email-err">
                  {errors.email}
                </p>
              )}
            </div>
            <div className={`field ${errors.type ? 'has-error' : ''}`}>
              <label htmlFor="ct-type">I’m interested in *</label>
              <select id="ct-type" value={form.type} onChange={set('type')} aria-invalid={!!errors.type} aria-describedby={errors.type ? 'ct-type-err' : undefined}>
                <option value="">Select an enquiry type</option>
                {contact.types.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
              {errors.type && (
                <p className="field-err" id="ct-type-err">
                  {errors.type}
                </p>
              )}
            </div>
            <div className="field">
              <label htmlFor="ct-city">City / location</label>
              <input id="ct-city" autoComplete="address-level2" value={form.city} onChange={set('city')} />
            </div>
            <div className="field">
              <label htmlFor="ct-land">Land availability</label>
              <select id="ct-land" value={form.land} onChange={set('land')}>
                <option value="">Select if applicable</option>
                {contact.land.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="field field--full">
              <label htmlFor="ct-msg">
                Tell us a little about your requirement <small>(optional)</small>
              </label>
              <textarea id="ct-msg" rows="3" value={form.msg} onChange={set('msg')} placeholder="Location, site type, timeline…" />
            </div>
            <div className="ct-actions field--full">
              <Magnetic>
                <button type="submit" className="btn btn--primary">
                  <span className="btn-label">Send Enquiry on WhatsApp</span>
                </button>
              </Magnetic>
              <button type="button" className="btn btn--ghost" onClick={sendEmail}>
                <span className="btn-label">Send by email</span>
              </button>
            </div>
            <p className="ct-sent field--full" role="status" aria-live="polite">
              {sent}
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
