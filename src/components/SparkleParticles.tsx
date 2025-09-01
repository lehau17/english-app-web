import Particles from 'react-tsparticles'
export default function SparkleParticles() {
  return (
    <Particles
      id="tsparticles"
      options={{
        background: {
          color: '#0d47a1', // nền xanh
        },
        fpsLimit: 60,
        particles: {
          number: {
            value: 80,
            density: { enable: true, area: 800 },
          },
          color: {
            value: ['#ffcc00', '#ff6699', '#66ffcc', '#66ccff'], // nhiều màu vui nhộn
          },
          shape: {
            type: 'circle',
          },
          opacity: {
            value: 0.7,
          },
          size: {
            value: 3,
          },
          move: {
            enable: true,
            speed: 2,
          },
        },
        interactivity: {
          detectsOn: 'canvas', // bắt hover trên canvas
          events: {
            onHover: {
              enable: true,
              mode: 'repulse', // khi hover thì đẩy hạt ra xa
            },
            onClick: {
              enable: true,
              mode: 'push', // click thì thêm hạt mới
            },
          },
          modes: {
            repulse: {
              distance: 100,
              duration: 0.4,
            },
            push: {
              quantity: 4,
            },
          },
        },
        detectRetina: true,
      }}
    />
  )
}
