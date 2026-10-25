/**
 * A stylised orbiting solar system (CSS animation in spaceBackdrop.css): a glowing
 * sun, four orbit rings, planets that circle at different speeds, and a moon.
 */
const ORBITS = [
  { size: 34, period: 14, planet: 10, color: '#7fd8ff' },
  { size: 52, period: 22, planet: 16, color: '#ffb86b' },
  { size: 72, period: 34, planet: 13, color: '#c79bff', moon: true },
  { size: 94, period: 52, planet: 22, color: '#6ee0b0', ring: true },
];

export function SolarSystem({ className = '' }: { className?: string }) {
  return (
    <div className={`solar-system ${className}`} aria-hidden="true">
      <div className="solar-system__sun" />
      {ORBITS.map((orbit, i) => (
        <div
          key={i}
          className="solar-system__orbit"
          style={{
            width: `${orbit.size}%`,
            height: `${orbit.size}%`,
            animationDuration: `${orbit.period}s`,
            animationDelay: `${-i * 7}s`,
          }}
        >
          <span
            className={`solar-system__planet${orbit.ring ? ' has-ring' : ''}`}
            style={{
              width: orbit.planet,
              height: orbit.planet,
              background: `radial-gradient(circle at 35% 30%, #ffffff, ${orbit.color} 45%, #1b1440 110%)`,
              boxShadow: `0 0 ${orbit.planet}px ${orbit.color}`,
            }}
          >
            {orbit.moon && <i className="solar-system__moon" />}
          </span>
        </div>
      ))}
    </div>
  );
}
