window.PORTFOLIO = {
  ui: {
    siteTitle: "Portfolio",
    categories: { post: "Posts", dev: "Development" },
    dataError: "The data has a formatting error. Please check the browser console."
  },
  profile: {
    name: "ぐみゅけ",
    tagline: "I solve little everyday annoyances with small automations. I'm still learning to program, and I learn by building tools for managing my studies and budget and for making videos.",
    avatar: "assets/avatar.jpg",
    intro: [
      "I'm Gumyuke, a self-proclaimed British-at-heart university student. I'm a second-year student in the Faculty of Commerce at Meiji University, and since September 2026 I've been on an exchange programme at Cardiff University in the UK.",
      "I record the paperwork and the day-to-day of studying abroad, just as it is, in Note articles and laid-back videos. Light on the glitter, I'm afraid.",
      "I also build small tools to cut down on everyday hassles."
    ],
    links: [
      { label: "Note", url: "https://note.com/gmk_in_uk", icon: "N", image: "assets/icons/note.png" },
      { label: "Instagram", url: "https://www.instagram.com/gmy_k_in_uk/", icon: "IG", image: "assets/icons/instagram.webp" },
      { label: "GitHub", url: "https://github.com/Gmy-K", icon: "GH", image: "assets/icons/github.svg" }
    ],
    skills: [
      {
        group: "Programming (still learning)",
        items: [
          { name: "Python", note: "Mainly statistics, within what I learned at GCI" },
          { name: "R" }
        ]
      },
      {
        group: "Want to try",
        wish: true,
        items: [
          { name: "JavaScript", note: "I want to learn to write it myself" },
          { name: "C#", note: "I want to learn to write it myself" },
          { name: "And more (various)" }
        ]
      },
      {
        group: "Languages I can speak and use",
        items: [
          { name: "Japanese" },
          { name: "English" },
          { name: "French (a little)" }
        ]
      },
      {
        group: "Languages I'm studying",
        items: [
          { name: "French" },
          { name: "Korean" }
        ]
      }
    ],
    activities: [
      {
        name: "Note",
        summary: "I write about the paperwork and life on the ground abroad, just as it is.",
        url: "https://note.com/gmk_in_uk"
      },
      {
        name: "Vlog (Instagram)",
        summary: "I put together videos of life abroad on Instagram.",
        url: "https://www.instagram.com/gmy_k_in_uk/"
      },
      {
        name: "Development (everyday tools)",
        summary: "I build small tools around me that cut down on everyday hassles.",
        url: null
      },
      {
        name: "Meiji University Liberal Arts English Society, Meicom",
        summary: "I'm a member of a club that runs activities in English, such as guiding.",
        url: null
      }
    ]
  },
  items: [
    {
      category: "post",
      kind: "Note",
      title: "#1 おい！留学を悩んでる(明治)大学生！見ろ！🫵",
      summary: "A self-introduction for younger students undecided about studying abroad, plus a plain-language explanation of Meiji University's study abroad programmes. (Article in Japanese)",
      date: "2026-08-04",
      url: "https://note.com/gmk_in_uk/n/n78f4d130b313",
      thumb: "assets/thumbs/note-01.png"
    },
    {
      category: "post",
      kind: "Note",
      title: "#2 イギリス渡航記—一日目からこれですかぁ？！",
      summary: "From Narita to Cardiff via Dubai: a travel diary of a first day packed with incidents, from a typhoon to a SIM card and a gas leak. (Article in Japanese)",
      date: "2026-10-01",
      url: "https://note.com/gmk_in_uk/n/nc9eab7a3b4ba",
      thumb: "assets/thumbs/note-02.jpeg"
    },
    {
      category: "post",
      kind: "Reel",
      title: "Reel① 限界大学生、イギリスに流れ着く。",
      summary: "A self-introduction video about studying abroad, built around the gas leak and cancelled services on my first day. Narrated with VOICEVOX. (Video in Japanese)",
      date: "2026-11-12",
      url: "https://www.instagram.com/reel/DfoDLhKPAEC/",
      extraLinks: [
        { label: "Also on Niconico", url: "https://www.nicovideo.jp/shorts/ss47036068" }
      ],
      thumb: "assets/thumbs/reel-01.jpg"
    },
    {
      category: "dev",
      kind: "Skill",
      title: "VOICEVOX Voice-Tuning Skill",
      summary: "A Claude Code skill that suggests voice-tuning parameters such as speed, pitch and intonation from a line, a character and a tone.",
      date: "2026-08-09",
      url: "https://gmy-k.github.io/portfolio/tech.en.html#voicevox",
      thumb: "assets/thumbs/skill.svg"
    },
    {
      category: "dev",
      kind: "Guide",
      title: "Materials site for guiding activities",
      summary: "A site that gathers the materials used in a group's guiding activities, so they can all be viewed in one place.",
      date: "2026-09-01",
      url: null,
      thumb: "assets/thumbs/guide.svg"
    },
    {
      category: "dev",
      kind: "System",
      title: "PKM | Automated Secretary for Study Tasks",
      summary: "Part of my personal knowledge management (PKM). A system that works backward from deadlines and sends \"what's good to do today\" to my phone every morning.",
      date: "2026-11-11",
      url: "https://gmy-k.github.io/portfolio/how-it-works.en.html#secretary",
      thumb: "assets/thumbs/secretary.png"
    },
    {
      category: "dev",
      kind: "Vault",
      title: "PKM | Overall Design of the Obsidian Vault",
      summary: "The big picture of my personal knowledge management (PKM). A design that gathers lectures, tasks, schedules and reviews into one set of notes and links them with automation.",
      date: "2026-04-06",
      url: "https://gmy-k.github.io/portfolio/how-it-works.en.html#vault",
      thumb: "assets/thumbs/vault.svg"
    },
    {
      category: "dev",
      kind: "Skill",
      title: "Claude Code Skills (automating study and posting)",
      summary: "A growing collection of \"skills\" that teach AI the steps of a task, one for each purpose. Once asked, it follows the same steps every time.",
      date: "2026-06-10",
      url: "https://gmy-k.github.io/portfolio/tech.en.html#skills",
      thumb: "assets/thumbs/skills.svg"
    },
    {
      category: "dev",
      kind: "App",
      title: "Study-Abroad Budget Book (logging spending and showing budget pace)",
      summary: "A web app for logging spending from my phone in seconds and seeing my pace against this month's budget.",
      date: "2026-09-22",
      url: "https://gmy-k.github.io/portfolio/tech.en.html#kakeibo",
      thumb: "assets/thumbs/kakeibo.png"
    }
  ]
};
