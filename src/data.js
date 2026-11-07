// ============================================================
//  YOUR CONTENT LIVES HERE
//  Edit the values below, save, and the whole site updates.
//  Anything left empty ("" or []) is hidden automatically.
// ============================================================

export const profile = {
  name: 'Von Altair R. De Asis',
  // Short label shown on the 3D badge lanyard and in the footer logo
  shortName: 'von',
  // Big letters shown on the badge/photo placeholder until you add a photo
  initials: 'VD',
  // These rotate with a typing effect in the hero
  roles: ['Junior Web Developer', 'UI Designer', 'Software Engineering Student'],
  heroText:
    "I'm a Computer Science student majoring in Software Engineering who builds responsive web apps people actually use. I like taking things apart and putting them back together better, whether it's code, a PC, or a motorcycle.",
  aboutText: [
    "I'm Von, a graduating Computer Science student at Manuel S. Enverga University Foundation, majoring in Software Engineering. I build and deploy responsive web applications with JavaScript, HTML and CSS, with a foundation in Python, Java, Dart and Flutter, and I'm certified in software engineering, testing and machine learning through IBM and HKUST.",
    "Outside of code I'm a hands-on techie. I build PCs, fix motorcycles and a bit of cars, and you'll usually find me on a ride or at a car meet. I also cook, know a little about the construction industry, and I'm always up for learning something new.",
  ],
  // Put your photo in the /public folder (e.g. public/photo.jpg) and write '/photo.jpg' here.
  // Leave '' to show your initials instead.
  photo: '',
  location: 'Lucena City, Quezon, Philippines',
  email: 'von.deasis09@gmail.com',
  // Optional: link to a resume PDF placed in /public, e.g. '/resume.pdf'
  resume: '',
}

// Leave a link as '' to hide that icon
export const socials = [
  { name: 'GitHub', handle: '@Vonnie09', url: 'https://github.com/Vonnie09' },
  { name: 'LinkedIn', handle: 'Von Altair De Asis', url: 'https://www.linkedin.com/in/von-altair-de-asis-b69780447/' },
  { name: 'Instagram', handle: '@von.deasis', url: 'https://www.instagram.com/von.deasis' },
  { name: 'Facebook', handle: 'Sydefx.gamer', url: 'https://www.facebook.com/Sydefx.gamer/' },
  { name: 'TikTok', handle: '@von.de.asis', url: 'https://www.tiktok.com/@von.de.asis' },
]

export const education = [
  {
    school: 'Manuel S. Enverga University Foundation',
    level: 'BS Computer Science, Major in Software Engineering · College of Computing and Multimedia Studies',
    years: '2023 – 2027 (Expected)',
  },
  { school: 'Sacred Heart College', level: 'Senior High School · Lucena City', years: '2021 – 2023' },
  { school: 'Philippine Tong Ho Institute', level: 'Junior High School · Lucena City', years: '2017 – 2021' },
]

// Internships, freelance work, part-time jobs, org officer roles, volunteer tech work…
// Leave [] to hide this column.
export const experience = []

// image: put a screenshot in /public/projects/ and write '/projects/name.jpg'. Leave '' for a placeholder.
export const projects = [
  {
    title: 'RideShareEU',
    label: 'Thesis · Feb 2026 – Present',
    description:
      'A full-stack university carpooling platform with a Priority-Scored Greedy Matching Algorithm (PSGA). It filters riders by route overlap, time window and hard constraints, then ranks them on a weighted score, beating 3 baseline methods at 0.826 Precision@1 on a 500-row labeled dataset.',
    tags: ['Next.js', 'Node.js', 'PostgreSQL', 'Prisma', 'Python', 'Jest', 'Figma'],
    image: '',
    live: '',
    code: 'https://github.com/KlRAAA/rideshare-eu',
  },
  {
    title: 'BillCheck',
    label: 'Personal Project · Aug – Oct 2026',
    description:
      'A responsive bill and installment tracker that splits totals into 2 to 48 payments on weekly, biweekly or monthly schedules, with receipt uploads, undo, overdue summaries, a trash bin and dark mode. Built with plain JavaScript ES modules, no framework.',
    tags: ['JavaScript', 'HTML5', 'CSS3', 'localStorage', 'Vercel'],
    image: '/projects/billcheck.jpg',
    live: 'https://pay-bills-theta.vercel.app',
    code: 'https://github.com/Vonnie09/billcheck',
  },
]

// Certificates are shown in groups. Add more groups or items any time.
// url: link to the certificate (e.g. your Coursera verify link). Leave '' if you don't have one.
export const certificateGroups = [
  {
    group: 'Coursera',
    items: [
      { title: 'Software Testing, Deployment, and Maintenance Strategies', issuer: 'IBM · Coursera', year: 'Jun 2026', url: '' },
      { title: 'Machine Learning with Python', issuer: 'HKUST · Coursera', year: 'Apr 2026', url: '' },
      { title: 'Software Engineering Specialization', issuer: 'IBM · Coursera', year: 'Apr 2026', url: '' },
      { title: 'Software Engineering: Implementation and Testing', issuer: 'HKUST · Coursera', year: 'Mar 2026', url: '' },
      { title: 'Flutter and Dart: Developing iOS, Android, and Mobile Apps', issuer: 'IBM · Coursera', year: 'May 2025', url: '' },
    ],
  },
  {
    group: 'Others',
    items: [{ title: 'Certificate of Participation', issuer: 'TCL', year: '', url: '' }],
  },
]

// Leave [] to hide the Achievements tab. Example:
// { title: 'Hackathon Finalist', detail: 'Built X in 24 hours', year: '2026' }
export const achievements = []

// Logos shown in the Tech Stack tab.
// icon = the name used by devicon.dev (e.g. 'react', 'python', 'figma'). Leave '' for no logo.
export const techStack = [
  { name: 'HTML', icon: 'html5' },
  { name: 'CSS', icon: 'css3' },
  { name: 'JavaScript', icon: 'javascript' },
  { name: 'React', icon: 'react' },
  { name: 'Python', icon: 'python' },
  { name: 'Java', icon: 'java' },
  { name: 'C++', icon: 'cplusplus' },
  { name: 'Dart', icon: 'dart' },
  { name: 'Flutter', icon: 'flutter' },
  { name: 'MySQL', icon: 'mysql' },
  { name: 'Supabase', icon: 'supabase' },
  { name: 'Figma', icon: 'figma' },
  { name: 'Xcode', icon: 'xcode' },
  { name: 'VS Code', icon: 'vscode' },
  { name: 'Git', icon: 'git' },
  { name: 'GitHub', icon: 'github' },
  { name: 'Vercel', icon: 'vercel' },
]

// Shown under the logos in the Tech Stack tab
export const skillGroups = [
  { group: 'Programming Languages', items: ['JavaScript (ES6+)', 'HTML5', 'CSS3', 'Python', 'Java', 'C++', 'Dart'] },
  { group: 'Frameworks & Libraries', items: ['React', 'Flutter', 'pandas'] },
  { group: 'Databases & Storage', items: ['MySQL', 'Supabase', 'Browser localStorage'] },
  { group: 'Developer Tools', items: ['Git', 'GitHub', 'Visual Studio Code', 'Xcode', 'Vercel', 'Figma', 'Claude AI'] },
  {
    group: 'Concepts',
    items: [
      'Responsive Web Design',
      'Modular Programming',
      'Software Testing',
      'Deployment & Maintenance',
      'Software Development Life Cycle (SDLC)',
    ],
  },
  {
    group: 'Soft Skills',
    items: ['Teamwork', 'Communication', 'Problem-Solving', 'Adaptability', 'Attention to Detail', 'Technical Documentation'],
  },
]

// Spotify section.
// A playlist / album / track link shows a playable player, e.g. 'https://open.spotify.com/playlist/…'
// A profile link (open.spotify.com/user/…) shows a "Listen with me" button instead.
// Leave '' to hide the section.
export const music = {
  link: 'https://open.spotify.com/user/31bdjrhn7kvb7nz73xiv7pmewslq',
  title: 'Good music.',
  accent: 'Better code.',
  text: 'Whether I am debugging, building a PC or tuning up a bike, there is always something playing. Here is what keeps me going.',
}

// Contact form: create a free form at https://formspree.io and paste its endpoint here,
// e.g. 'https://formspree.io/f/abcdwxyz'. If empty, the form opens the visitor's email app instead.
export const contactForm = {
  formspreeEndpoint: '',
}
