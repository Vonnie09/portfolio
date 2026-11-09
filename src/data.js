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
  // Photo printed on the 3D badge. Put it in /public and write e.g. '/photo.jpg'. Leave '' to show initials.
  photo: '/badge-photo.jpg',
  // Photo in the About Me section (falls back to the badge photo, then initials)
  aboutPhoto: '/about-photo.jpg',
  location: 'Lucena City, Quezon, Philippines',
  email: 'von.deasis09@gmail.com',
  // Optional: link to a resume PDF placed in /public, e.g. '/resume.pdf'
  resume: '',
}

// The swinging 3D ID badge in the hero
export const badge = {
  cutout: '/badge-cutout.png', // you, with the background removed (PNG with transparency)
  tag: 'JUNIOR',
  title: 'DEVELOPER',
  school: 'MSEUF',
  schoolSub: 'CCMS · LUCENA CITY',
  sideText: 'SOFTWARE ENGINEERING', // vertical text on the front
  motto: ['Code. Ride.', 'Build. Repeat.'],
  // Back of the badge
  qrLink: 'https://www.linkedin.com/in/von-altair-de-asis-b69780447/',
  qrTitle: 'CONNECT WITH ME',
  qrSub: 'SOCIALS',
  backSideText: 'BS COMPUTER SCIENCE',
  lanyardText: 'Von De Asis',
}

// Leave a link as '' to hide that icon
export const socials = [
  { name: 'GitHub', handle: '@Vonnie09', url: 'https://github.com/Vonnie09' },
  { name: 'LinkedIn', handle: 'Von Altair De Asis', url: 'https://www.linkedin.com/in/von-altair-de-asis-b69780447/' },
  { name: 'Instagram', handle: '@von.deasis', url: 'https://www.instagram.com/von.deasis' },
  { name: 'Facebook', handle: 'Sydefx.gamer', url: 'https://www.facebook.com/Sydefx.gamer/' },
  { name: 'TikTok', handle: '@von.de.asis', url: 'https://www.tiktok.com/@von.de.asis' },
]

// short = the abbreviation shown in the little icon box, url = school website (shown after the years)
export const education = [
  {
    school: 'Manuel S. Enverga University Foundation',
    short: 'MSEUF',
    logo: '/schools/mseuf.png',
    url: 'https://mseuf.edu.ph/',
    level: 'BS Computer Science, Major in Software Engineering · College of Computing and Multimedia Studies',
    years: '2023 – 2027 (Expected)',
  },
  {
    school: 'Sacred Heart College',
    short: 'SHC',
    logo: '/schools/shc.png',
    url: 'https://shc.edu.ph/',
    level: 'Senior High School · Lucena City',
    years: '2021 – 2023',
  },
  {
    school: 'Philippine Tong Ho Institute',
    short: 'PTHI',
    logo: '/schools/pthi.png',
    url: 'https://pthi.edu.ph/',
    level: 'Junior High School · Lucena City',
    years: '2017 – 2021',
  },
  {
    school: 'Metro Lucena Integrated Learning Center',
    short: 'MLILC',
    logo: '/schools/mlilc.png',
    url: 'https://mlilc.wela.ph/',
    level: 'Elementary · Lucena City',
    years: '2011 – 2017',
  },
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
  {
    title: 'MoneyBudgeting',
    status: 'On-going', // shown on the image and in place of the Live demo button; remove when finished
    label: 'Personal Project · Oct 2026 – Present',
    description:
      'A personal budget planner and expense tracker. Quick-add entries like "12.50 lunch" with auto-categorizing, monthly budgets with pace alerts, a bills calendar, spending insights, multiple wallets and a built-in calculator. Runs fully in the browser with no backend.',
    tags: ['JavaScript', 'HTML5', 'CSS3', 'localStorage', 'Vercel'],
    image: '/projects/moneybudgeting.jpg',
    live: '', // hidden while on-going (demo: https://money-manager-six-phi.vercel.app)
    code: 'https://github.com/Vonnie09/money-manager',
  },
]

// Certificates are shown in groups. Add more groups or items any time.
//   cert(title, issuer, date, verifyLink, imageName)
//   imageName = the file in public/certificates/ without ".jpg" (a small copy must be in public/certificates/thumbs/)
//   Leave verifyLink or imageName as '' if you don't have one.
const cert = (title, issuer, year, url = '', img = '') => ({
  title,
  issuer,
  year,
  url,
  image: img ? `/certificates/${img}.jpg` : '',
  thumb: img ? `/certificates/thumbs/${img}.jpg` : '',
})
const v = (id) => `https://coursera.org/verify/${id}`

export const certificateGroups = [
  {
    group: 'Specializations',
    items: [
      cert('An Introduction to Programming the Internet of Things (IoT) Specialization', 'University of California, Irvine', 'Jun 2026',
        'https://coursera.org/verify/specialization/TBCU37VAMHYC', 'specialization-an-introduction-to-programming-the-internet-of-things-iot'),
      cert('Software Engineering Specialization', 'The Hong Kong University of Science and Technology', 'Apr 2026',
        'https://coursera.org/verify/specialization/UZX7225XTS0C', 'specialization-software-engineering'),
    ],
  },
  {
    group: 'Courses',
    items: [
      cert('Designing User Interfaces and Experiences (UI/UX)', 'IBM', 'Oct 2026', v('QA500UC3XVOK'), 'designing-user-interfaces-and-experiences-ui-ux'),
      cert('Introduction to User Experience Principles and Processes', 'University of Michigan', 'Oct 2026', v('PF2OYKO9OCT5'), 'introduction-to-user-experience-principles-and-processes'),
      cert('Software Testing Fundamentals and Methodologies', 'Microsoft', 'Oct 2026', v('4ZEHYT4B09CD'), 'software-testing-fundamentals-and-methodologies'),
      cert('Automate Tasks and Processes with Jira', 'Coursera Project Network', 'Sep 2026', v('O1AVQSSVBR71'), 'automate-tasks-and-processes-with-jira'),
      cert('Get Started with Jira', 'Coursera Project Network', 'Sep 2026', v('2ZMAY959NET5'), 'get-started-with-jira'),
      cert('Introduction to CRM with HubSpot', 'Coursera Project Network', 'Sep 2026', v('7WNU6FFF5YTO'), 'introduction-to-crm-with-hubspot'),
      cert('Introduction to UX/UI Design', 'IBM', 'Aug 2026', v('F7A2E7VTB0MG'), 'introduction-to-ux-ui-design'),
      cert('Software Testing, Deployment, and Maintenance Strategies', 'IBM', 'Jun 2026', v('GAAOFCRKWOSS'), 'software-testing-deployment-and-maintenance-strategies'),
      cert('z/Architecture Assembler Language Part 1: The Basics', 'IBM', 'Jun 2026', v('USKZ9PN732DZ'), 'architecture-assembler-language-part-1-the-basics'),
      cert('Introduction to the Internet of Things and Embedded Systems', 'University of California, Irvine', 'Jun 2026', v('RVU78I666XY2'), 'introduction-to-the-internet-of-things-and-embedded-systems'),
      cert('The Arduino Platform and C Programming', 'University of California, Irvine', 'Jun 2026', v('VN0MBPOZP4WQ'), 'the-arduino-platform-and-c-programming'),
      cert('Interfacing with the Arduino', 'University of California, Irvine', 'Jun 2026', v('DPJQGFW3DGFD'), 'interfacing-with-the-arduino'),
      cert('The Raspberry Pi Platform and Python Programming for the Raspberry Pi', 'University of California, Irvine', 'Jun 2026', v('DWZEQDC0BSPH'), 'the-raspberry-pi-platform-and-python-programming-for-the-raspberry-pi'),
      cert('Interfacing with the Raspberry Pi', 'University of California, Irvine', 'Jun 2026', v('5VNYE1W9FRF1'), 'interfacing-with-the-raspberry-pi'),
      cert('Programming for the Internet of Things Project', 'University of California, Irvine', 'Jun 2026', v('84DW12XPOKLI'), 'programming-for-the-internet-of-things-project'),
      cert('Machine Learning with Python', 'IBM', 'Apr 2026', v('LVTYW3X53O9I'), 'machine-learning-with-python-build-real-world-ml-models'),
      cert('Software Engineering: Software Design and Project Management', 'The Hong Kong University of Science and Technology', 'Apr 2026', v('5MZY87IQ7B6Y'), 'software-engineering-software-design-and-project-management'),
      cert('Software Engineering: Implementation and Testing', 'The Hong Kong University of Science and Technology', 'Mar 2026', v('FUX4QNRZFIHY'), 'software-engineering-implementation-and-testing'),
      cert('Software Engineering: Modeling Software Systems using UML', 'The Hong Kong University of Science and Technology', 'Feb 2026', v('YSGKOL0FC4VD'), 'software-engineering-modeling-software-systems-using-uml'),
      cert('Programming Languages I', 'KAIST', 'Feb 2026', v('68VFLKCCHN6P'), 'programming-languages-i'),
      cert('Create the User Interface with SwiftUI', 'Meta', 'Nov 2025', v('4X8DFWXT3BB7'), 'create-the-user-interface-with-swiftui'),
      cert('System Validation: Automata and Behavioural Equivalences', 'EIT Digital', 'Nov 2025', v('BLPLABBXLFOX'), 'system-validation-automata-and-behavioural-equivalences'),
      cert('Data Privacy and Protection Standards', 'Starweaver', 'Oct 2025', v('TUQG10FLIB9X'), 'data-privacy-and-protection-standards'),
      cert('Ethics of Artificial Intelligence', 'Politecnico di Milano', 'Sep 2025', v('ZOBG36HUTLDA'), 'ethics-of-artificial-intelligence'),
      cert('Flutter and Dart: Developing iOS, Android, and Mobile Apps', 'IBM', 'May 2025', v('G6U2R60MNDS8'), 'flutter-and-dart-developing-ios-android-and-mobile-apps'),
      cert('Introduction to Relational Databases (RDBMS)', 'IBM', 'May 2025', v('DAF21WU2342W'), 'introduction-to-relational-databases-rdbms'),
      cert('Dynamic Programming, Greedy Algorithms', 'University of Colorado Boulder', 'May 2025', v('STAMTS9WE4JE'), 'dynamic-programming-greedy-algorithms'),
    ],
  },
  {
    group: 'Others',
    items: [
      cert('TCL Product Training Program — Certificate of Participation', 'TCL · OLED Household Products Trading', 'Oct 2025',
        '', 'tcl-product-training-program'),
    ],
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
