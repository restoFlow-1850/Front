import React from 'react'

/**
 * Visual illustration of restaurant tables based on capacity and zone type (Standard vs VIP).
 *
 * Support capacity: 2, 4, 6, 8, 10+
 * Support mode: Standard (wood + green chairs + plant) vs VIP (mahogany + gold trim + velvet VIP chairs + candle)
 */
export default function TableIllustration({ capacity = 4, isVip = false, className = 'w-full h-44' }) {
  const cap = Number(capacity) || 4

  if (cap <= 2) {
    return <TwoSeatTable isVip={isVip} className={className} />
  } else if (cap <= 4) {
    return <FourSeatTable isVip={isVip} className={className} />
  } else if (cap <= 6) {
    return <SixSeatTable isVip={isVip} className={className} />
  } else if (cap <= 8) {
    return <EightSeatTable isVip={isVip} className={className} />
  } else {
    return <TenSeatTable isVip={isVip} className={className} />
  }
}

// Reusable SVG Defs
const SharedDefs = ({ isVip }) => (
  <defs>
    <filter id={`soft-shadow-${isVip ? 'vip' : 'std'}`} x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor={isVip ? '#451a03' : '#1e293b'} floodOpacity={isVip ? '0.25' : '0.12'} />
    </filter>
    <filter id={`chair-shadow-${isVip ? 'vip' : 'std'}`} x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#0f172a" floodOpacity="0.2" />
    </filter>

    {/* Table Wood Gradients */}
    {isVip ? (
      <>
        {/* VIP Dark Mahogany + Gold */}
        <linearGradient id="vipWoodGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4A2111" />
          <stop offset="50%" stopColor="#36170A" />
          <stop offset="100%" stopColor="#250F06" />
        </linearGradient>
        <linearGradient id="goldTrimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="50%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
        <linearGradient id="vipChairGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1E3A8A" />
          <stop offset="100%" stopColor="#172554" />
        </linearGradient>
        <linearGradient id="vipChairHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
      </>
    ) : (
      <>
        {/* Standard Wood + Green */}
        <linearGradient id="stdWoodGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#DEB887" />
          <stop offset="40%" stopColor="#D2A679" />
          <stop offset="100%" stopColor="#C39463" />
        </linearGradient>
        <linearGradient id="stdChairGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4A6B54" />
          <stop offset="100%" stopColor="#324F3A" />
        </linearGradient>
        <linearGradient id="stdChairHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5B7E66" />
          <stop offset="100%" stopColor="#395842" />
        </linearGradient>
      </>
    )}

    {/* Plant Pot */}
    <radialGradient id="potGrad" cx="40%" cy="40%" r="60%">
      <stop offset="0%" stopColor="#FFFFFF" />
      <stop offset="100%" stopColor="#D1D5DB" />
    </radialGradient>
  </defs>
)

// Chair Component
function Chair({ x, y, rotation = 0, isVip = false }) {
  const shadowId = `chair-shadow-${isVip ? 'vip' : 'std'}`
  const legColor = isVip ? '#D4AF37' : '#8B5A2B'
  const fillGrad = isVip ? 'url(#vipChairGrad)' : 'url(#stdChairGrad)'
  const highlightGrad = isVip ? 'url(#vipChairHighlight)' : 'url(#stdChairHighlight)'
  const backColor = isVip ? '#0F172A' : '#263E2D'

  return (
    <g transform={`translate(${x}, ${y}) rotate(${rotation})`} filter={`url(#${shadowId})`}>
      {/* Legs */}
      <rect x="-13" y="-19" width="3" height="7" rx="1" fill={legColor} />
      <rect x="10" y="-19" width="3" height="7" rx="1" fill={legColor} />
      <rect x="-13" y="12" width="3" height="7" rx="1" fill={legColor} />
      <rect x="10" y="12" width="3" height="7" rx="1" fill={legColor} />

      {/* Main Seat Cushion */}
      <rect x="-15" y="-14" width="30" height="28" rx="7" fill={fillGrad} />
      <rect x="-13" y="-12" width="26" height="24" rx="5" fill={highlightGrad} opacity="0.6" />

      {/* Armrests & Backrest */}
      <path
        d="M -16 -12 C -16 -20, 16 -20, 16 -12 L 16 -6 C 16 -10, -16 -10, -16 -6 Z"
        fill={backColor}
      />
      {isVip && (
        /* Gold accent dot on chair back */
        <circle cx="0" cy="-15" r="1.5" fill="#FBBF24" />
      )}
    </g>
  )
}

// Centerpiece: Plant (Standard) vs Luxury Candle Holder (VIP)
function Centerpiece({ x, y, isVip = false, scale = 1 }) {
  if (isVip) {
    return (
      <g transform={`translate(${x}, ${y}) scale(${scale})`}>
        {/* Gold Candle Base */}
        <ellipse cx="0" cy="2" rx="7" ry="5" fill="#B45309" opacity="0.4" />
        <path d="M -5 3 L 5 3 L 3 -3 L -3 -3 Z" fill="url(#goldTrimGrad)" />
        <circle cx="0" cy="-4" r="3" fill="#F59E0B" />
        <rect x="-1.5" y="-10" width="3" height="7" rx="1" fill="#FFFBEB" />
        {/* Candle Flame */}
        <path d="M 0 -10 C -2 -14, 0 -17, 0 -17 C 0 -17, 2 -14, 0 -10 Z" fill="#F59E0B" />
        <path d="M 0 -10 C -1 -12, 0 -15, 0 -15 C 0 -15, 1 -12, 0 -10 Z" fill="#FEF08A" />
      </g>
    )
  }

  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      <circle cx="0" cy="1" r="9" fill="#000" opacity="0.15" />
      <circle cx="0" cy="0" r="8" fill="url(#potGrad)" stroke="#E5E7EB" strokeWidth="1" />
      <circle cx="0" cy="0" r="6" fill="#4A3728" />
      <circle cx="-3" cy="-3" r="4" fill="#2D6A4F" />
      <circle cx="3" cy="-2" r="4.5" fill="#40916C" />
      <circle cx="-1" cy="4" r="4" fill="#1B4332" />
      <circle cx="3" cy="2" r="3.5" fill="#52B788" />
      <circle cx="0" cy="-1" r="2.5" fill="#74C69D" />
    </g>
  )
}

// 2 Seat Table
function TwoSeatTable({ isVip, className }) {
  const tableFill = isVip ? 'url(#vipWoodGrad)' : 'url(#stdWoodGrad)'
  const strokeColor = isVip ? 'url(#goldTrimGrad)' : '#A07242'
  const shadowId = `soft-shadow-${isVip ? 'vip' : 'std'}`

  return (
    <svg viewBox="0 0 240 150" className={className} fill="none">
      <SharedDefs isVip={isVip} />
      <Chair x={52} y={75} rotation={90} isVip={isVip} />
      <Chair x={188} y={75} rotation={-90} isVip={isVip} />
      <circle cx={120} cy={75} r={40} fill={tableFill} filter={`url(#${shadowId})`} stroke={strokeColor} strokeWidth={isVip ? 3.5 : 2.5} />
      <circle cx={120} cy={75} r={36} stroke={isVip ? '#FDE68A' : '#F5E6D3'} strokeWidth={1.5} opacity="0.5" fill="none" />
      <Centerpiece x={120} y={75} isVip={isVip} scale={1.1} />
    </svg>
  )
}

// 4 Seat Table
function FourSeatTable({ isVip, className }) {
  const tableFill = isVip ? 'url(#vipWoodGrad)' : 'url(#stdWoodGrad)'
  const strokeColor = isVip ? 'url(#goldTrimGrad)' : '#A07242'
  const shadowId = `soft-shadow-${isVip ? 'vip' : 'std'}`

  return (
    <svg viewBox="0 0 240 150" className={className} fill="none">
      <SharedDefs isVip={isVip} />
      <Chair x={120} y={22} rotation={180} isVip={isVip} />
      <Chair x={120} y={128} rotation={0} isVip={isVip} />
      <Chair x={52} y={75} rotation={90} isVip={isVip} />
      <Chair x={188} y={75} rotation={-90} isVip={isVip} />
      <circle cx={120} cy={75} r={42} fill={tableFill} filter={`url(#${shadowId})`} stroke={strokeColor} strokeWidth={isVip ? 3.5 : 2.5} />
      <circle cx={120} cy={75} r={38} stroke={isVip ? '#FDE68A' : '#F5E6D3'} strokeWidth={1.5} opacity="0.5" fill="none" />
      <Centerpiece x={120} y={75} isVip={isVip} scale={1.1} />
    </svg>
  )
}

// 6 Seat Table
function SixSeatTable({ isVip, className }) {
  const tableFill = isVip ? 'url(#vipWoodGrad)' : 'url(#stdWoodGrad)'
  const strokeColor = isVip ? 'url(#goldTrimGrad)' : '#A07242'
  const shadowId = `soft-shadow-${isVip ? 'vip' : 'std'}`

  return (
    <svg viewBox="0 0 280 150" className={className} fill="none">
      <SharedDefs isVip={isVip} />
      <Chair x={78} y={22} rotation={180} isVip={isVip} />
      <Chair x={140} y={22} rotation={180} isVip={isVip} />
      <Chair x={202} y={22} rotation={180} isVip={isVip} />
      <Chair x={78} y={128} rotation={0} isVip={isVip} />
      <Chair x={140} y={128} rotation={0} isVip={isVip} />
      <Chair x={202} y={128} rotation={0} isVip={isVip} />

      <rect x={50} y={42} width={180} height={66} rx={33} fill={tableFill} filter={`url(#${shadowId})`} stroke={strokeColor} strokeWidth={isVip ? 3.5 : 2.5} />
      <rect x={54} y={45} width={172} height={60} rx={30} stroke={isVip ? '#FDE68A' : '#F5E6D3'} strokeWidth={1.5} opacity="0.5" fill="none" />
      <Centerpiece x={140} y={75} isVip={isVip} scale={1.1} />
    </svg>
  )
}

// 8 Seat Table
function EightSeatTable({ isVip, className }) {
  const tableFill = isVip ? 'url(#vipWoodGrad)' : 'url(#stdWoodGrad)'
  const strokeColor = isVip ? 'url(#goldTrimGrad)' : '#A07242'
  const shadowId = `soft-shadow-${isVip ? 'vip' : 'std'}`

  return (
    <svg viewBox="0 0 320 150" className={className} fill="none">
      <SharedDefs isVip={isVip} />
      <Chair x={65} y={22} rotation={180} isVip={isVip} />
      <Chair x={115} y={22} rotation={180} isVip={isVip} />
      <Chair x={205} y={22} rotation={180} isVip={isVip} />
      <Chair x={255} y={22} rotation={180} isVip={isVip} />
      <Chair x={65} y={128} rotation={0} isVip={isVip} />
      <Chair x={115} y={128} rotation={0} isVip={isVip} />
      <Chair x={205} y={128} rotation={0} isVip={isVip} />
      <Chair x={255} y={128} rotation={0} isVip={isVip} />

      <rect x={40} y={42} width={240} height={66} rx={33} fill={tableFill} filter={`url(#${shadowId})`} stroke={strokeColor} strokeWidth={isVip ? 3.5 : 2.5} />
      <rect x={44} y={45} width={232} height={60} rx={30} stroke={isVip ? '#FDE68A' : '#F5E6D3'} strokeWidth={1.5} opacity="0.5" fill="none" />
      <Centerpiece x={160} y={75} isVip={isVip} scale={1.2} />
    </svg>
  )
}

// 10+ Seat Table
function TenSeatTable({ isVip, className }) {
  const tableFill = isVip ? 'url(#vipWoodGrad)' : 'url(#stdWoodGrad)'
  const strokeColor = isVip ? 'url(#goldTrimGrad)' : '#A07242'
  const shadowId = `soft-shadow-${isVip ? 'vip' : 'std'}`

  return (
    <svg viewBox="0 0 360 150" className={className} fill="none">
      <SharedDefs isVip={isVip} />
      {/* Top 4 */}
      <Chair x={80} y={22} rotation={180} isVip={isVip} />
      <Chair x={130} y={22} rotation={180} isVip={isVip} />
      <Chair x={230} y={22} rotation={180} isVip={isVip} />
      <Chair x={280} y={22} rotation={180} isVip={isVip} />
      {/* Bottom 4 */}
      <Chair x={80} y={128} rotation={0} isVip={isVip} />
      <Chair x={130} y={128} rotation={0} isVip={isVip} />
      <Chair x={230} y={128} rotation={0} isVip={isVip} />
      <Chair x={280} y={128} rotation={0} isVip={isVip} />
      {/* Ends (Left & Right) */}
      <Chair x={35} y={75} rotation={90} isVip={isVip} />
      <Chair x={325} y={75} rotation={-90} isVip={isVip} />

      <rect x={50} y={42} width={260} height={66} rx={33} fill={tableFill} filter={`url(#${shadowId})`} stroke={strokeColor} strokeWidth={isVip ? 3.5 : 2.5} />
      <rect x={54} y={45} width={252} height={60} rx={30} stroke={isVip ? '#FDE68A' : '#F5E6D3'} strokeWidth={1.5} opacity="0.5" fill="none" />
      <Centerpiece x={180} y={75} isVip={isVip} scale={1.25} />
    </svg>
  )
}
