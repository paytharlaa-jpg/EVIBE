import { useEffect, useRef, useState } from 'react';
import { gsap } from '../lib/scroll';
import { useGsap } from '../lib/useGsap';
import { prefersReducedMotion } from '../lib/device';
import { company, waLink } from '../content';
import Magnetic from '../components/Magnetic';

// Small configurable enquiry form → WhatsApp (pre-filled) or email.
// fields: [{ id, label, type: 'text'|'tel'|'email'|'select'|'textarea', options, required, full, placeholder, auto }]
export default function LeadForm({ id = 'lead', fields, intro, subject, values, sendLabel = 'Send on WhatsApp' }) {
  const root = useRef(null);
  const blank = () => Object.fromEntries(fields.map((f) => [f.id, '']));
  const [form, setForm] = useState(() => ({ ...blank(), ...(values || {}) }));
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState('');
  useEffect(() => {
    if (values) setForm((f) => ({ ...f, ...values }));
  }, [values]);

  useGsap(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from(root.current.querySelectorAll('.field, .ct-actions'), { y: 24, opacity: 0, duration: 0.8, stagger: 0.05, ease: 'power3.out', scrollTrigger: { trigger: root.current, start: 'top 88%' } });
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
    fields.forEach((f) => {
      const v = (form[f.id] || '').trim();
      if (f.required && !v) er[f.id] = f.type === 'select' ? 'Please select one.' : `Please enter ${f.label.replace(' *', '').toLowerCase()}.`;
      else if (v && f.type === 'tel' && !/^[+\d][\d\s-]{8,15}$/.test(v)) er[f.id] = 'Enter a valid phone number, e.g. 98765 43210.';
      else if (v && f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) er[f.id] = 'Enter a valid email address.';
    });
    setErrors(er);
    const first = Object.keys(er)[0];
    if (first) document.getElementById(`${id}-${first}`)?.focus();
    return !first;
  };
  const message = () =>
    [intro, ...fields.map((f) => (form[f.id] || '').trim() && `${f.label.replace(' *', '')}: ${form[f.id].trim()}`)].filter(Boolean).join('\n');
  const onWa = (e) => {
    e.preventDefault();
    if (!validate()) return;
    window.open(waLink(message()), '_blank', 'noopener');
    setSent('WhatsApp opened with your details. Just press send.');
  };
  const onMail = () => {
    if (!validate()) return;
    window.location.href = `mailto:${company.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message())}`;
    setSent('Your email app opened with the details filled in.');
  };

  return (
    <form className="ct-form" ref={root} onSubmit={onWa} noValidate>
      {fields.map((f) => {
        const fid = `${id}-${f.id}`;
        const err = errors[f.id];
        const common = { id: fid, value: form[f.id], onChange: set(f.id), 'aria-invalid': !!err, 'aria-describedby': err ? `${fid}-err` : undefined, autoComplete: f.auto };
        return (
          <div className={`field ${f.full ? 'field--full' : ''} ${err ? 'has-error' : ''}`} key={f.id}>
            <label htmlFor={fid}>
              {f.label}
              {f.optional && <small> (optional)</small>}
            </label>
            {f.type === 'select' ? (
              <select {...common}>
                <option value="">Please select</option>
                {f.options.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            ) : f.type === 'textarea' ? (
              <textarea rows="3" {...common} placeholder={f.placeholder} />
            ) : (
              <input type={f.type || 'text'} inputMode={f.type === 'tel' ? 'tel' : undefined} {...common} placeholder={f.placeholder} />
            )}
            {err && (
              <p className="field-err" id={`${fid}-err`}>
                {err}
              </p>
            )}
          </div>
        );
      })}
      <div className="ct-actions field--full">
        <Magnetic>
          <button type="submit" className="btn btn--primary">
            <span className="btn-label">{sendLabel}</span>
          </button>
        </Magnetic>
        <button type="button" className="btn btn--ghost" onClick={onMail}>
          <span className="btn-label">Send by email</span>
        </button>
      </div>
      <p className="ct-sent field--full" role="status" aria-live="polite">
        {sent}
      </p>
    </form>
  );
}
