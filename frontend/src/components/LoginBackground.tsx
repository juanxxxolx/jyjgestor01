/**
 * @fileoverview Fondo animado con partículas tipo red global + iconos flotantes
 * para la pantalla de login. Usa tsParticles con configuración personalizada.
 */

import { useCallback } from 'react';
import { Particles, ParticlesProvider } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';

export default function LoginBackground() {
  const init = useCallback(async (engine: any) => {
    await loadSlim(engine);
  }, []);

  return (
    <ParticlesProvider init={init}>
      <Particles
        id="login-bg"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
        }}
        options={{
          fullScreen: false,
          background: { color: '#0a0e1a' },
          fpsLimit: 20,
          particles: {
            number: { value: 80, density: { enable: true } },
            color: { value: '#4fc3f7' },
            links: {
              enable: true,
              distance: 150,
              color: '#4fc3f7',
              opacity: 0.25,
              width: 1.2,
            },
            move: {
              enable: true,
              speed: 1,
              direction: 'none',
              random: true,
              outModes: { default: 'bounce' },
            },
            size: { value: { min: 1, max: 3 } },
            opacity: { value: 0.6 },
            shape: { type: 'circle' },
          },
          interactivity: {
            events: {
              onHover: { enable: true, mode: 'repulse' },
              resize: { enable: true },
            },
            modes: {
              repulse: { distance: 120, duration: 0.4 },
            },
          },
          detectRetina: true,
        }}
      />
    </ParticlesProvider>
  );
}
