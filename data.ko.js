window.PORTFOLIO = {
  ui: {
    siteTitle: "포트폴리오",
    categories: { post: "콘텐츠", dev: "개발" },
    dataError: "데이터 형식에 오류가 있어요. 브라우저 콘솔을 확인해 주세요."
  },
  profile: {
    name: "ぐみゅけ",
    tagline: "일상 속 자잘한 불편함을 작은 자동화로 해결하고 있어요. 프로그래밍은 공부 중이라, 학습 관리나 가계 관리, 영상 제작에 쓰는 도구를 직접 만들면서 배우고 있어요.",
    avatar: "assets/avatar.jpg",
    intro: [
      "자칭 ‘영국인 감성’ 대학생, ぐみゅけ(Gumyuke)예요. 메이지대학교 상학부 2학년이고, 2026년 9월부터 영국 카디프대학교에서 교환학생으로 지내고 있어요.",
      "유학 수속이나 현지에서 겪는 이런저런 일들을 Note와 힘 뺀 영상으로 꾸밈없이 기록하고 있어요. 반짝반짝한 느낌은 좀 적은 편이에요.",
      "그 밖에도 일상의 불편함을 줄이기 위한 작은 도구를 만들고 있어요."
    ],
    links: [
      { label: "Note", url: "https://note.com/gmk_in_uk", icon: "N", image: "assets/icons/note.png" },
      { label: "Instagram", url: "https://www.instagram.com/gmy_k_in_uk/", icon: "IG", image: "assets/icons/instagram.webp" },
      { label: "GitHub", url: "https://github.com/Gmy-K", icon: "GH", image: "assets/icons/github.svg" }
    ],
    skills: [
      {
        group: "프로그래밍 (공부 중)",
        items: [
          { name: "Python", note: "주로 통계. GCI에서 배운 범위까지" },
          { name: "R" }
        ]
      },
      {
        group: "해 보고 싶은 것",
        wish: true,
        items: [
          { name: "JavaScript", note: "제 손으로 직접 코드를 짤 수 있게 되고 싶어요" },
          { name: "C#", note: "제 손으로 직접 코드를 짤 수 있게 되고 싶어요" },
          { name: "그 밖에 (이것저것)" }
        ]
      },
      {
        group: "말하고 쓸 수 있는 언어",
        items: [
          { name: "일본어" },
          { name: "영어" },
          { name: "프랑스어 (조금)" }
        ]
      },
      {
        group: "공부 중인 언어",
        items: [
          { name: "프랑스어" },
          { name: "한국어" }
        ]
      }
    ],
    activities: [
      {
        name: "Note",
        summary: "유학 수속과 현지 생활을 있는 그대로 쓰고 있어요.",
        url: "https://note.com/gmk_in_uk"
      },
      {
        name: "Vlog (Instagram)",
        summary: "유학 생활을 Instagram에 영상으로 정리해 올리고 있어요.",
        url: "https://www.instagram.com/gmy_k_in_uk/"
      },
      {
        name: "개발 (일상 속 도구)",
        summary: "일상의 불편함을 줄여 주는 작은 도구를 만들고 있어요.",
        url: null
      },
      {
        name: "메이지대학교 교양영어회 Meicom",
        summary: "영어를 활용한 활동(가이드 등)을 하는 동아리에 소속되어 있어요.",
        url: null
      }
    ]
  },
  items: [
    {
      category: "post",
      kind: "Note",
      title: "#1 おい！留学を悩んでる(明治)大学生！見ろ！🫵",
      summary: "유학을 고민하는 후배들을 위한 자기소개와 함께, 메이지대학교의 유학 제도를 쉽게 풀어 설명했어요. (일본어 글)",
      date: "2026-08-04",
      url: "https://note.com/gmk_in_uk/n/n78f4d130b313",
      thumb: "assets/thumbs/note-01.png"
    },
    {
      category: "post",
      kind: "Note",
      title: "#2 イギリス渡航記—一日目からこれですかぁ？！",
      summary: "나리타에서 두바이를 거쳐 카디프에 도착하기까지. 태풍, SIM 카드, 가스 누출까지 첫날부터 사건투성이였던 영국행 기록이에요. (일본어 글)",
      date: "2026-10-01",
      url: "https://note.com/gmk_in_uk/n/nc9eab7a3b4ba",
      thumb: "assets/thumbs/note-02.jpeg"
    },
    {
      category: "post",
      kind: "Reel",
      title: "Reel① 限界大学生、イギリスに流れ着く。",
      summary: "도착 첫날의 가스 누출과 운행 중단을 중심으로 한 유학 자기소개 영상이에요. 내레이션은 VOICEVOX로 만들었어요. (일본어 영상)",
      date: "2026-11-12",
      url: "https://www.instagram.com/reel/DfoDLhKPAEC/",
      extraLinks: [
        { label: "니코니코 동화에서도 보기", url: "https://www.nicovideo.jp/shorts/ss47036068" }
      ],
      thumb: "assets/thumbs/reel-01.jpg"
    },
    {
      category: "dev",
      kind: "Skill",
      title: "VOICEVOX 음성 조율 스킬",
      summary: "대사·캐릭터·톤을 바탕으로 말하기 속도, 음높이, 억양 같은 음성 조율 파라미터를 제안하는 Claude Code 스킬이에요.",
      date: "2026-08-09",
      url: "https://gmy-k.github.io/portfolio/tech.ko.html#voicevox",
      thumb: "assets/thumbs/skill.svg"
    },
    {
      category: "dev",
      kind: "Guide",
      title: "가이드 활동용 자료 사이트",
      summary: "단체의 가이드 활동에서 쓰는 자료를 한곳에서 볼 수 있게 만든 사이트예요.",
      date: "2026-09-01",
      url: null,
      thumb: "assets/thumbs/guide.svg"
    },
    {
      category: "dev",
      kind: "System",
      title: "PKM | 학습 할 일 자동 비서 시스템",
      summary: "개인 지식 관리(PKM)의 일부예요. 마감일부터 거꾸로 계산해서 ‘오늘 하면 좋은 일’을 매일 아침 스마트폰으로 보내 주는 시스템이에요.",
      date: "2026-11-11",
      url: "https://gmy-k.github.io/portfolio/how-it-works.ko.html#secretary",
      thumb: "assets/thumbs/secretary.png"
    },
    {
      category: "dev",
      kind: "Vault",
      title: "PKM | Obsidian Vault 전체 설계",
      summary: "개인 지식 관리(PKM)의 전체 그림이에요. 강의·할 일·일정·복습을 하나의 노트 모음에 모으고, 자동화로 연결하는 설계예요.",
      date: "2026-04-06",
      url: "https://gmy-k.github.io/portfolio/how-it-works.ko.html#vault",
      thumb: "assets/thumbs/vault.svg"
    },
    {
      category: "dev",
      kind: "Skill",
      title: "Claude Code 스킬 모음 (학습·콘텐츠 제작 자동화)",
      summary: "AI에게 작업 순서를 가르쳐 두는 ‘스킬’을 용도별로 하나씩 만들어 모으고 있어요. 부탁하면 매번 같은 순서로 움직여요.",
      date: "2026-06-10",
      url: "https://gmy-k.github.io/portfolio/tech.ko.html#skills",
      thumb: "assets/thumbs/skills.svg"
    },
    {
      category: "dev",
      kind: "App",
      title: "유학 가계부 (지출 기록과 예산 페이스 표시)",
      summary: "유학 중 지출을 스마트폰으로 몇 초 만에 기록하고, 이번 달 예산에 비해 어떤 페이스로 쓰고 있는지 볼 수 있는 웹 앱이에요.",
      date: "2026-09-22",
      url: "https://gmy-k.github.io/portfolio/tech.ko.html#kakeibo",
      thumb: "assets/thumbs/kakeibo.png"
    }
  ]
};
