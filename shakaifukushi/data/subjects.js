/* =========================================================================
   社会福祉士 国試ドリル ― 試験の枠組み（科目・科目群・試験情報）

   出典：公益財団法人 社会福祉振興・試験センター公表の試験概要、
         厚生労働省「第39回社会福祉士国家試験の施行について」ほか。
   ・第37回（2025年2月）から新カリキュラム（19科目・129問）。
   ・合格基準は「総得点の60％程度を基準に難易度で補正」かつ
     「6科目群すべてで得点があること」。
   ・社会福祉士には（介護福祉士のような）パート合格制度はない。
   ========================================================================= */
var SW_META = {
  exam: {
    name: "第39回社会福祉士国家試験",
    date: "2027-02-07",          // 厚生労働省 公表（令和9年2月7日・日曜）
    applyUntil: "2026-10-02",    // 受験申込の締切（ネット申込は23:59まで）
    total: 129,
    minutes: { am: 140, pm: 85 }, // 午前 10:00〜12:20／午後 14:10〜15:35（第38回の時間割）
    // 過去の合格基準点（参考）
    history: [
      { round: 38, year: 2026, line: 50, total: 129, rate: 60.7 },
      { round: 37, year: 2025, line: 62, total: 129, rate: 56.3 }
    ]
  },

  // 科目群（6群）。1群でも0点があると総得点にかかわらず不合格。
  groups: [
    { id: 1, name: "科目群①", subjects: ["igaku", "shinri", "shakaigaku"] },
    { id: 2, name: "科目群②", subjects: ["genri", "hosho", "kenri"] },
    { id: 3, name: "科目群③", subjects: ["chiiki", "shogai", "keiji"] },
    { id: 4, name: "科目群④", subjects: ["swkiban", "swriron", "chosa"] },
    { id: 5, name: "科目群⑤", subjects: ["korei", "jido", "hinkon", "hoken"] },
    { id: 6, name: "科目群⑥", subjects: ["swkiban2", "swriron2", "keiei"] }
  ],

  // 科目（本番の出題数どおり）。session: 午前=共通科目、午後=専門科目
  subjects: [
    { id: "igaku",      name: "医学概論",                         short: "医学",       cat: "共通", group: 1, count: 6, session: "am" },
    { id: "shinri",     name: "心理学と心理的支援",               short: "心理",       cat: "共通", group: 1, count: 6, session: "am" },
    { id: "shakaigaku", name: "社会学と社会システム",             short: "社会学",     cat: "共通", group: 1, count: 6, session: "am" },
    { id: "genri",      name: "社会福祉の原理と政策",             short: "原理",       cat: "共通", group: 2, count: 9, session: "am" },
    { id: "hosho",      name: "社会保障",                         short: "社会保障",   cat: "共通", group: 2, count: 9, session: "am" },
    { id: "kenri",      name: "権利擁護を支える法制度",           short: "権利擁護",   cat: "共通", group: 2, count: 6, session: "am" },
    { id: "chiiki",     name: "地域福祉と包括的支援体制",         short: "地域福祉",   cat: "共通", group: 3, count: 9, session: "am" },
    { id: "shogai",     name: "障害者福祉",                       short: "障害",       cat: "共通", group: 3, count: 6, session: "am" },
    { id: "keiji",      name: "刑事司法と福祉",                   short: "刑事司法",   cat: "共通", group: 3, count: 6, session: "am" },
    { id: "swkiban",    name: "ソーシャルワークの基盤と専門職",   short: "SW基盤",     cat: "共通", group: 4, count: 6, session: "am" },
    { id: "swriron",    name: "ソーシャルワークの理論と方法",     short: "SW理論",     cat: "共通", group: 4, count: 9, session: "am" },
    { id: "chosa",      name: "社会福祉調査の基礎",               short: "調査",       cat: "共通", group: 4, count: 6, session: "am" },
    { id: "korei",      name: "高齢者福祉",                       short: "高齢",       cat: "専門", group: 5, count: 6, session: "pm" },
    { id: "jido",       name: "児童・家庭福祉",                   short: "児童",       cat: "専門", group: 5, count: 6, session: "pm" },
    { id: "hinkon",     name: "貧困に対する支援",                 short: "貧困",       cat: "専門", group: 5, count: 6, session: "pm" },
    { id: "hoken",      name: "保健医療と福祉",                   short: "保健医療",   cat: "専門", group: 5, count: 6, session: "pm" },
    { id: "swkiban2",   name: "ソーシャルワークの基盤と専門職（専門）", short: "SW基盤(専)", cat: "専門", group: 6, count: 6, session: "pm" },
    { id: "swriron2",   name: "ソーシャルワークの理論と方法（専門）",   short: "SW理論(専)", cat: "専門", group: 6, count: 9, session: "pm" },
    { id: "keiei",      name: "福祉サービスの組織と経営",         short: "組織経営",   cat: "専門", group: 6, count: 6, session: "pm" }
  ]
};

/* 問題バンク。各データファイルが SW_ADD(科目ID, [問題...]) で追加する。
   問題オブジェクト:
     id     固定ID（学習履歴の保存キー。後から変えないこと）
     topic  論点（一問一答や一覧の見出しに使う短い語）
     q      問題文（「…1つ選びなさい。」まで）
     case   事例文（任意）
     opts   選択肢（5つ）
     ans    正答の添字（0始まり）の配列。「2つ選びなさい」は2要素
     neg    true＝「誤っているもの／適切でないもの」を選ぶ問題
     ox     false＝選択肢が単独の文として正誤判定できない（事例・語句選択など）
     set    問題セット（第1回＝1、第2回＝2 …）。各セットが本番と同じ科目別出題数になっている
     oe     選択肢ごとの解説（opts と同じ並び）
     exp    全体の解説（ポイント）
*/
var SW_BANK = [];
function SW_ADD(subj, list, set) {
  for (var i = 0; i < list.length; i++) {
    list[i].subj = subj;
    list[i].set = set || 1;
    SW_BANK.push(list[i]);
  }
}
