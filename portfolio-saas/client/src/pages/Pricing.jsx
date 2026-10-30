import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import Navbar from '../components/layout/Navbar.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const FALLBACK_PLANS = [
  {
    code: 'free',
    name: 'Starter',
    price_monthly: 0,
    max_portfolios: 1,
    max_projects: 6,
    analytics: 0,
    custom_domain: 0,
  },
  {
    code: 'pro',
    name: 'Professional',
    price_monthly: 19,
    max_portfolios: 5,
    max_projects: 40,
    analytics: 1,
    custom_domain: 1,
  },
  {
    code: 'studio',
    name: 'Studio',
    price_monthly: 49,
    max_portfolios: 25,
    max_projects: 200,
    analytics: 1,
    custom_domain: 1,
  },
];

export default function Pricing() {
  const { user } = useAuth();
  const [plans, setPlans] = useState(FALLBACK_PLANS);

  useEffect(() => {
    api.auth
      .plans()
      .then((result) => setPlans(result.plans))
      .catch(() => setPlans(FALLBACK_PLANS));
  }, []);

  return (
    <>
      <Navbar />
      <section className="section">
        <div className="shell">
          <div className="section-head" style={{ marginInline: 'auto', textAlign: 'center', alignItems: 'center' }}>
            <span className="eyebrow">Pricing</span>
            <h2>Simple plans, real limits</h2>
            <p>Every tier includes the full editor, all four templates and a public URL.</p>
          </div>

          <div className="pricing-grid">
            {plans.map((plan) => {
              const current = user?.plan === plan.code;
              const featured = plan.code === 'pro';
              return (
                <div key={plan.code} className={`price-card ${featured ? 'featured' : ''}`}>
                  <div>
                    <div className="spread">
                      <h3>{plan.name}</h3>
                      {current ? <span className="badge badge-success">Current</span> : null}
                    </div>
                    <div className="price-tag">
                      ${plan.price_monthly}
                      <small>/month</small>
                    </div>
                  </div>

                  <ul className="price-list">
                    <li>{plan.max_portfolios} portfolio{plan.max_portfolios === 1 ? '' : 's'}</li>
                    <li>{plan.max_projects} projects</li>
                    <li>All four 3D templates</li>
                    <li>{plan.analytics ? 'Traffic analytics' : 'Basic view counter'}</li>
                    <li>{plan.custom_domain ? 'Custom accent & branding' : 'Standard accent set'}</li>
                    <li>Contact form & inbox</li>
                  </ul>

                  <Link
                    to={user ? '/app' : '/register'}
                    className={`btn ${featured ? 'btn-primary' : 'btn-ghost'} btn-block`}
                  >
                    {current ? 'Go to dashboard' : plan.price_monthly === 0 ? 'Start free' : `Choose ${plan.name}`}
                  </Link>
                </div>
              );
            })}
          </div>

          <p className="center faint" style={{ marginTop: '2.2rem', fontSize: '0.88rem' }}>
            Demo project — no payment is processed and no card is ever required.
          </p>
        </div>
      </section>
    </>
  );
}
