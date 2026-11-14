window.PORTFOLIO = {
  ui: {
    siteTitle: "Portfolio",
    categories: { post: "Publications", dev: "Développement" },
    dataError: "Les données contiennent une erreur de format. Veuillez consulter la console du navigateur."
  },
  profile: {
    name: "ぐみゅけ",
    tagline: "Je règle les petits tracas du quotidien à coups d’automatisations modestes. J’apprends encore la programmation : je progresse en fabriquant des outils pour organiser mes études, tenir mon budget et réaliser mes vidéos.",
    avatar: "assets/avatar.jpg",
    intro: [
      "Je m’appelle ぐみゅけ (Gumyuke) : je fais mes études à l’université et, de mon propre aveu, je suis Britannique dans l’âme. En deuxième année à la faculté de commerce de l’université Meiji, je suis en échange à l’université de Cardiff, au Royaume-Uni, depuis septembre 2026.",
      "Je raconte les démarches de mon séjour et ma vie sur place, sans enjoliver, dans des articles sur Note et des vidéos sans prétention. Peu de paillettes au programme, je vous préviens.",
      "Par ailleurs, je fabrique aussi de petits outils pour avoir moins de tracas au quotidien."
    ],
    links: [
      { label: "Note", url: "https://note.com/gmk_in_uk", icon: "N", image: "assets/icons/note.png" },
      { label: "Instagram", url: "https://www.instagram.com/gmy_k_in_uk/", icon: "IG", image: "assets/icons/instagram.webp" },
      { label: "GitHub", url: "https://github.com/Gmy-K", icon: "GH", image: "assets/icons/github.svg" }
    ],
    skills: [
      {
        group: "Programmation (en cours d’apprentissage)",
        items: [
          { name: "Python", note: "Surtout pour les statistiques, dans la limite de ce que j’ai appris à GCI" },
          { name: "R" }
        ]
      },
      {
        group: "Envie d’essayer",
        wish: true,
        items: [
          { name: "JavaScript", note: "J’aimerais savoir l’écrire moi-même" },
          { name: "C#", note: "J’aimerais savoir l’écrire moi-même" },
          { name: "Et bien d’autres (un peu de tout)" }
        ]
      },
      {
        group: "Langues que je parle et que j’utilise",
        items: [
          { name: "Japonais" },
          { name: "Anglais" },
          { name: "Français (un peu)" }
        ]
      },
      {
        group: "Langues que j’apprends",
        items: [
          { name: "Français" },
          { name: "Coréen" }
        ]
      }
    ],
    activities: [
      {
        name: "Note",
        summary: "J’y raconte, sans enjoliver, les démarches de mon séjour et la vie sur place.",
        url: "https://note.com/gmk_in_uk"
      },
      {
        name: "Vlog (Instagram)",
        summary: "Je mets mon séjour à l’étranger en vidéo sur Instagram.",
        url: "https://www.instagram.com/gmy_k_in_uk/"
      },
      {
        name: "Développement (outils du quotidien)",
        summary: "Je crée de petits outils pour réduire les tracas de tous les jours.",
        url: null
      },
      {
        name: "Meicom, cercle d’anglais de l’université Meiji",
        summary: "Je fais partie d’un cercle étudiant qui mène des activités en anglais, comme des visites guidées.",
        url: null
      }
    ]
  },
  items: [
    {
      category: "post",
      kind: "Note",
      title: "#1 おい！留学を悩んでる(明治)大学生！見ろ！🫵",
      summary: "Je me présente aux étudiants plus jeunes qui hésitent à partir étudier à l’étranger, et j’explique simplement les programmes de séjour à l’étranger de l’université Meiji. (Article en japonais)",
      date: "2026-08-04",
      url: "https://note.com/gmk_in_uk/n/n78f4d130b313",
      thumb: "assets/thumbs/note-01.png"
    },
    {
      category: "post",
      kind: "Note",
      title: "#2 イギリス渡航記—一日目からこれですかぁ？！",
      summary: "De Narita à Cardiff via Dubaï : le récit d’un voyage où les péripéties s’enchaînent dès le premier jour, entre typhon, carte SIM et fuite de gaz. (Article en japonais)",
      date: "2026-10-01",
      url: "https://note.com/gmk_in_uk/n/nc9eab7a3b4ba",
      thumb: "assets/thumbs/note-02.jpeg"
    },
    {
      category: "post",
      kind: "Reel",
      title: "Reel① 限界大学生、イギリスに流れ着く。",
      summary: "Une vidéo de présentation de mon séjour, construite autour de la fuite de gaz et des transports à l’arrêt de mon premier jour. La narration est assurée par VOICEVOX. (Vidéo en japonais)",
      date: "2026-11-12",
      url: "https://www.instagram.com/reel/DfoDLhKPAEC/",
      extraLinks: [
        { label: "Voir aussi sur Niconico", url: "https://www.nicovideo.jp/shorts/ss47036068" }
      ],
      thumb: "assets/thumbs/reel-01.jpg"
    },
    {
      category: "dev",
      kind: "Skill",
      title: "Skill de réglage vocal pour VOICEVOX",
      summary: "Un skill Claude Code qui propose des paramètres de réglage vocal (vitesse, hauteur, intonation, etc.) à partir d’une réplique, d’un personnage et d’un ton.",
      date: "2026-08-09",
      url: "https://gmy-k.github.io/portfolio/tech.fr.html#voicevox",
      thumb: "assets/thumbs/skill.svg"
    },
    {
      category: "dev",
      kind: "Guide",
      title: "Site de supports pour les visites guidées",
      summary: "Un site qui réunit au même endroit les supports utilisés lors des visites guidées de notre association.",
      date: "2026-09-01",
      url: null,
      thumb: "assets/thumbs/guide.svg"
    },
    {
      category: "dev",
      kind: "System",
      title: "PKM | Secrétaire automatique pour mes tâches d’études",
      summary: "Une partie de ma gestion des connaissances personnelles (PKM). Un système qui part des échéances pour déterminer « ce qu’il serait bon de faire aujourd’hui », et me l’envoie chaque matin sur mon téléphone.",
      date: "2026-11-11",
      url: "https://gmy-k.github.io/portfolio/how-it-works.fr.html#secretary",
      thumb: "assets/thumbs/secretary.png"
    },
    {
      category: "dev",
      kind: "Vault",
      title: "PKM | Conception d’ensemble du Vault Obsidian",
      summary: "La vue d’ensemble de ma gestion des connaissances personnelles (PKM) : cours, tâches, emploi du temps et révisions réunis dans un seul ensemble de notes, reliés entre eux par l’automatisation.",
      date: "2026-04-06",
      url: "https://gmy-k.github.io/portfolio/how-it-works.fr.html#vault",
      thumb: "assets/thumbs/vault.svg"
    },
    {
      category: "dev",
      kind: "Skill",
      title: "Collection de skills Claude Code (automatiser études et publications)",
      summary: "Des « skills » — des modes d’emploi qui apprennent à l’IA comment mener une tâche — que je constitue au fil de mes besoins, un par usage. Sur simple demande, l’IA suit à chaque fois la même procédure.",
      date: "2026-06-10",
      url: "https://gmy-k.github.io/portfolio/tech.fr.html#skills",
      thumb: "assets/thumbs/skills.svg"
    },
    {
      category: "dev",
      kind: "App",
      title: "Carnet de comptes du séjour (saisie des dépenses et suivi du rythme budgétaire)",
      summary: "Une application web pour noter une dépense en quelques secondes depuis mon téléphone et voir où j’en suis par rapport au budget du mois.",
      date: "2026-09-22",
      url: "https://gmy-k.github.io/portfolio/tech.fr.html#kakeibo",
      thumb: "assets/thumbs/kakeibo.png"
    }
  ]
};
