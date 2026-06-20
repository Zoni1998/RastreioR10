'use client';

import { useState } from 'react';
import { useTheme, predefinedThemes } from './ThemeProvider';
import { Palette, X, Lock } from 'lucide-react';

export default function ThemeSwitcher({ currentPlan, isAdmin }) {
  const { theme, customColors, changeTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [showUpgradeAlert, setShowUpgradeAlert] = useState(false);

  // Se o plano for vazio ou nulo, default 'start'
  const plan = currentPlan || 'start';

  const themeOptions = [
    { id: 'light', name: 'Claro', type: 'start', color: '#f8fafc' },
    { id: 'dark', name: 'Escuro', type: 'start', color: '#0f172a' },
    { id: 'amoled', name: 'AMOLED', type: 'pro', color: '#000000' },
    { id: 'neon', name: 'Neon', type: 'pro', color: '#ec4899' },
    { id: 'ruby', name: 'Ruby', type: 'pro', color: '#450a0a' },
    { id: 'emerald', name: 'Emerald', type: 'pro', color: '#022c22' },
    { id: 'ocean', name: 'Ocean', type: 'pro', color: '#082f49' },
    { id: 'sunset', name: 'Sunset', type: 'pro', color: '#431407' },
    { id: 'coffee', name: 'Coffee', type: 'pro', color: '#292524' },
    { id: 'custom', name: 'Customizado', type: 'max', color: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)' }
  ];

  const handleSelectTheme = (t) => {
    if (!isAdmin) {
      if (t.type === 'pro' && plan === 'start') {
        setShowUpgradeAlert(true);
        return;
      }
      if (t.type === 'max' && plan !== 'max') {
        setShowUpgradeAlert(true);
        return;
      }
    }
    
    setShowUpgradeAlert(false);
    changeTheme(t.id);
  };

  const handleCustomColorChange = (key, value) => {
    changeTheme('custom', { ...customColors, [key]: value });
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '56px',
          height: '56px',
          borderRadius: '28px',
          backgroundColor: 'var(--primary)',
          color: '#fff',
          border: 'none',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 999,
          transition: 'transform 0.2s',
        }}
        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
        title="Personalizar Tema"
      >
        <Palette size={24} />
      </button>

      {isOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '360px',
            backgroundColor: 'var(--surface)',
            height: '100%',
            padding: '24px',
            boxShadow: '-4px 0 24px rgba(0,0,0,0.2)',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Palette size={20} /> Aparência
              </h2>
              <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            {showUpgradeAlert && (
              <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: '16px', borderRadius: '12px', border: '1px solid var(--warning)', marginBottom: '24px' }}>
                <p style={{ margin: '0 0 12px 0', color: 'var(--warning)', fontSize: '0.9rem', fontWeight: '500' }}>Este tema é exclusivo para planos superiores.</p>
                <a href="/assinatura" style={{ display: 'block', textAlign: 'center', padding: '8px', backgroundColor: 'var(--warning)', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem' }}>Fazer Upgrade</a>
              </div>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
              {themeOptions.map(t => {
                const isSelected = theme === t.id;
                const isLocked = !isAdmin && ((t.type === 'pro' && plan === 'start') || (t.type === 'max' && plan !== 'max'));
                
                return (
                  <div key={t.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() => handleSelectTheme(t)}
                      style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '32px',
                        border: isSelected ? '3px solid var(--primary)' : '2px solid transparent',
                        background: t.color,
                        cursor: 'pointer',
                        position: 'relative',
                        boxShadow: 'var(--shadow-sm)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {isLocked && <Lock size={20} color={t.id === 'light' ? '#000' : '#fff'} style={{ opacity: 0.7 }} />}
                    </button>
                    <span style={{ fontSize: '0.8rem', color: isSelected ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: isSelected ? 'bold' : 'normal' }}>
                      {t.name}
                    </span>
                  </div>
                )
              })}
            </div>

            {theme === 'custom' && (plan === 'max' || isAdmin) && (
              <div style={{ backgroundColor: 'var(--background)', padding: '16px', borderRadius: '12px' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem' }}>Cores Personalizadas</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Fundo (Background)</span>
                    <input type="color" value={customColors['--background'] || '#000000'} onChange={(e) => handleCustomColorChange('--background', e.target.value)} style={{ border: 'none', background: 'transparent', width: '32px', height: '32px', cursor: 'pointer' }} />
                  </label>
                  
                  <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Cards (Surface)</span>
                    <input type="color" value={customColors['--surface'] || '#1a1a1a'} onChange={(e) => handleCustomColorChange('--surface', e.target.value)} style={{ border: 'none', background: 'transparent', width: '32px', height: '32px', cursor: 'pointer' }} />
                  </label>
                  
                  <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Cor Primária</span>
                    <input type="color" value={customColors['--primary'] || '#6366f1'} onChange={(e) => handleCustomColorChange('--primary', e.target.value)} style={{ border: 'none', background: 'transparent', width: '32px', height: '32px', cursor: 'pointer' }} />
                  </label>
                  
                  <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Textos</span>
                    <input type="color" value={customColors['--text-primary'] || '#ffffff'} onChange={(e) => handleCustomColorChange('--text-primary', e.target.value)} style={{ border: 'none', background: 'transparent', width: '32px', height: '32px', cursor: 'pointer' }} />
                  </label>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
}
