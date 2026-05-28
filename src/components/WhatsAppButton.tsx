import React from 'react';
import { useApp } from '@/contexts/AppContext';

export default function WhatsAppButton() {
  const { data } = useApp();
  if (!data.whatsapp) return null;

  const href = `https://wa.me/${data.whatsapp.replace(/\D/g, '')}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp"
      style={{
        position: 'fixed',
        bottom: 24,
        left: 24,
        zIndex: 900,
        width: 52,
        height: 52,
        borderRadius: '50%',
        background: '#25D366',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 18px rgba(37,211,102,0.4)',
        transition: 'transform 0.22s ease, box-shadow 0.22s ease',
        textDecoration: 'none',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1.1)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1)';
      }}
    >
      {/* WhatsApp SVG icon */}
      <svg width="28" height="28" viewBox="0 0 32 32" fill="currentColor">
        <path d="M16 2C8.268 2 2 8.268 2 16c0 2.46.668 4.762 1.832 6.738L2 30l7.448-1.804A13.94 13.94 0 0016 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm7.2 19.832c-.3.84-1.752 1.608-2.424 1.68-.624.072-1.44.108-2.304-.144-.532-.156-1.22-.36-2.1-.72-3.696-1.572-6.108-5.304-6.3-5.544-.18-.24-1.488-1.98-1.488-3.78s.948-2.688 1.284-3.06c.336-.372.72-.468.96-.468.24 0 .48.012.684.024.216.012.516-.084.804.612.3.72 1.02 2.508 1.104 2.688.084.18.144.396.024.636-.12.24-.18.396-.36.612-.18.216-.36.48-.516.648-.168.18-.348.372-.156.72.192.348.864 1.428 1.848 2.316 1.272 1.128 2.34 1.488 2.688 1.656.348.168.552.144.756-.084.204-.228.876-1.02 1.104-1.38.228-.348.456-.288.768-.18.312.12 2.004.948 2.352 1.116.348.168.576.252.66.396.084.156.084.864-.216 1.704z" />
      </svg>
    </a>
  );
}
