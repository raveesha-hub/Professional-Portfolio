import type { PortfolioData } from '@/src/types/portfolio';

export const DEFAULT_PORTFOLIO: PortfolioData = {
  name: 'Raveesha',
  role: 'IT Undergraduate',
  uni: 'SLIIT Matara Campus',
  wel: 'Welcome to my personal portfolio!',
  about:
    'I am an enthusiastic IT undergraduate at SLIIT Matara Campus, currently studying in Year 1 Semester 2. I have a strong interest in technology, programming, and software development. I enjoy learning new skills, solving problems, and working on projects that help me grow as a future IT professional.',
  pic: '',
  email: 'raveeshajayawardhana771@gmail.com',
  link: '',
  github: '',
  linkedin: '',
  careerGoals:
    'Building a strong engineering foundation across full-stack software development, mobile applications, and connected IoT systems to solve meaningful real-world problems.',
  interests: [
    'Software Development & Object-Oriented Design',
    'IoT Hardware Prototyping & Sensor Telemetry',
    'Cross-Platform Mobile & Web Interfaces',
    'Logical Problem-Solving & Embedded Systems',
  ],
  skills: [
    {
      n: 'Programming Languages',
      i: ['Java (Object-Oriented Programming)', 'Dart', 'JavaScript'],
    },
    {
      n: 'Web Development',
      i: ['HTML', 'CSS', 'JavaScript'],
    },
    {
      n: 'Mobile Development',
      i: ['Flutter', 'Dart', 'Android Studio'],
    },
    {
      n: 'IoT and Embedded Systems',
      i: [
        'ESP32',
        'Arduino',
        'Sensors (DHT11/22, Ultrasonic, Soil Moisture, MQ)',
        'Displays (I2C LCD/OLED, Serial)',
        'IoT Cloud (Blynk, Firebase Realtime Database)',
      ],
    },
    {
      n: 'Tools and Technologies',
      i: [
        'GitHub',
        'VS Code',
        'Arduino IDE',
        'Cisco Packet Tracer',
        'GNU Octave',
        'Firebase',
        'Windows',
      ],
    },
  ],
  projects: [
    {
      id: 'smart-weather-irrigation',
      t: 'Smart Weather & Irrigation System',
      d: 'ESP32-based group project with live environmental sensors and automated irrigation telemetry.',
      fullDesc:
        'An embedded IoT group engineering project powered by the ESP32 microcontroller. Continuously monitors ambient temperature, humidity, soil moisture, air quality, and water tank levels using calibrated sensor modules, syncing real-time readings to cloud dashboards and automating irrigation control.',
      tech: [
        'ESP32',
        'Arduino IDE',
        'DHT11/22',
        'Soil Moisture Sensor',
        'Ultrasonic Sensor',
        'I2C LCD/OLED',
        'Firebase Realtime Database',
        'Blynk',
      ],
      features: [
        'Automated soil moisture threshold irrigation control',
        'Real-time cloud telemetry sync via Firebase & Blynk',
        'Local I2C OLED/LCD diagnostic readout',
        'Multi-sensor environmental & water level monitoring',
      ],
      link: '',
      github: '',
      demo: '',
      video: '',
      videos: [],
      pics: [],
      order: 0,
    },
  ],
  achievements: [],
  education: [
    {
      id: 'sliit-bsc-it',
      institution: 'SLIIT Matara Campus',
      degree: 'B.Sc. (Hons) in Information Technology',
      period: 'Year 1 · Semester 2 (Ongoing)',
      status: 'Active Undergraduate',
      description:
        'Pursuing core foundations in object-oriented programming, web and mobile software development, computer networks, and embedded hardware integration.',
      highlights: [
        'Object-Oriented Programming (Java)',
        'Web & Mobile Application Development',
        'IoT Prototyping with ESP32 & Arduino',
      ],
    },
  ],
  reflection:
    "As a Year 1 Semester 2 IT undergraduate at SLIIT Matara Campus, my journey into technology has been all about continuous learning. Earning my first certification and diving into software development taught me that programming isn't just about writing code—it's about logical problem-solving and growth. I view every project and challenge as an opportunity to sharpen my skills and build a strong foundation for my future as an IT professional.",
  phones: [],
  links: [],
  qrs: [],
};
