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
  // アプリ共通エンジン（/drill/app.js）に渡す設定
  app: {
    name: "社会福祉士 国試ドリル",
    storeKey: "swdrill",          // 学習データの保存キー（変えると記録が引き継がれない）
    version: "1.2.0",
    heroNote: "129問・225分（午前140分／午後85分）・6科目群すべてで得点が必要",
    mockCard: "本番どおり129問・225分。6科目群の0点判定つき。ミニ模試・午前のみ・午後のみも。",
    moreMock: "本番形式129問・ミニ模試",
    helpMock: "本番と同じ129問・225分（午前140分／午後85分）。提出後に総得点と<b>6科目群の0点判定</b>を表示。ミニ模試（38問）もあります。",
    notice: function (nSets, nQ) {
      return "本アプリの問題は、社会福祉士国家試験の出題基準（19科目）と出題形式に沿って<strong>独自に作成した練習問題</strong>です（実際の過去問ではありません）。本番と同じ構成（科目ごとに6問または9問・計129問）のセットを" + nSets + "回分（" + nQ + "問）収録しています。";
    },
    helpExamHtml:
      "<h3>試験の概要（第39回）</h3><ul><li>試験日：2027年2月7日（日）。受験申込は2026年10月2日（金）まで。</li><li>19科目・129問（共通科目84問／専門科目45問）。1問1点、五肢択一を基本とする多肢選択式。</li><li>合格基準：総得点の60%程度を基準として問題の難易度で補正した点数以上、かつ<b>6科目群すべてで得点</b>があること。第37回は62点、第38回は50点が合格点でした。</li>" +
      "<li>科目群：①医学概論・心理学と心理的支援・社会学と社会システム／②社会福祉の原理と政策・社会保障・権利擁護を支える法制度／③地域福祉と包括的支援体制・障害者福祉・刑事司法と福祉／④ソーシャルワークの基盤と専門職・ソーシャルワークの理論と方法・社会福祉調査の基礎／⑤高齢者福祉・児童・家庭福祉・貧困に対する支援・保健医療と福祉／⑥ソーシャルワークの基盤と専門職（専門）・ソーシャルワークの理論と方法（専門）・福祉サービスの組織と経営</li></ul>" +
      "<p class=\"small\">試験日程・合格基準などは必ず公益財団法人 社会福祉振興・試験センターの公式情報で確認してください。</p>",
    searchPlaceholder: "例：成年後見、地域包括支援センター、ラベリング",
    packPlaceholder: "例：第37回 過去問（自分用）",
    labelExample: "第37回 問12",
    printTitle: "社会福祉士 練習問題",
    template: {
      subj1: "社会保障", topic1: "社会保険の種類", stem1: "日本の社会保険に関する次の記述のうち、正しいものを1つ選びなさい。",
      subj2: "障害者福祉", stem2: "…適切なものを2つ選びなさい。"
    },
    // 旧カリキュラム（第36回まで）の科目名 → 対応する新科目（問題の取り込み用）
    aliases: {
      "人体の構造と機能及び疾病": "igaku", "心理学理論と心理的支援": "shinri", "社会理論と社会システム": "shakaigaku",
      "現代社会と福祉": "genri", "権利擁護と成年後見制度": "kenri", "地域福祉の理論と方法": "chiiki", "福祉行財政と福祉計画": "chiiki",
      "障害者に対する支援と障害者自立支援制度": "shogai", "更生保護制度": "keiji", "相談援助の基盤と専門職": "swkiban",
      "相談援助の理論と方法": "swriron", "社会調査の基礎": "chosa", "高齢者に対する支援と介護保険制度": "korei",
      "児童や家庭に対する支援と児童・家庭福祉制度": "jido", "低所得者に対する支援と生活保護制度": "hinkon", "保健医療サービス": "hoken"
    }
  },

  groupLabel: "科目群",
  groupRule: "nonzero",           // 1群でも0点なら不合格
  cats: [["共通", "共通科目"], ["専門", "専門科目"]],

  // 模擬試験
  mock: {
    scopes: [
      { id: "full", t: "本番形式（全科目）", d: "129問・225分。午前（共通84問）→午後（専門45問）の順。", min: 225, offset: 0 },
      { id: "am", t: "午前のみ（共通科目）", d: "84問・140分。科目群①〜④。", min: 140, offset: 0 },
      { id: "pm", t: "午後のみ（専門科目）", d: "45問・85分。科目群⑤⑥。", min: 85, offset: 84 },
      { id: "mini", t: "ミニ模試", d: "各科目2問ずつ・38問・66分（本番と同じ1問あたりの時間）。", min: 66 }
    ],
    minPerQ: 225 / 129,
    trendMax: 129,
    refLines: [[77, "60%"], [62, "第37回"], [50, "第38回"]],
    judge: function (m, rate, zeroGroup) {
      if (zeroGroup) return { label: "不合格（0点の科目群あり）", cls: "fail" };
      if (rate >= 60) return { label: "合格圏（60%以上）", cls: "pass" };
      if (rate >= 38.8) return { label: "ボーダー圏（年度の補正次第）", cls: "border" };
      return { label: "要強化（過去の補正後合格点に届かず）", cls: "fail" };
    },
    refText: function (m) {
      return m.total === 129 ? "参考：60%＝77点／第37回の合格点 62点／第38回の合格点 50点" : "参考：60%＝" + Math.ceil(m.total * 0.6) + "点";
    },
    noticeHtml: "本番の合格基準は「総得点の60%程度を基準に、問題の難易度で補正した点数以上」かつ「<strong>6科目群すべてで得点があること</strong>」です。補正後の合格点は第37回が62点（48.1%）、第38回が50点（38.8%）でした。本アプリでは補正前の60%を目安ラインとして判定し、科目群に0点があれば「不合格（0点科目群あり）」と表示します。"
  },

  exam: {
    name: "第39回社会福祉士国家試験",
    date: "2027-02-07",          // 厚生労働省 公表（令和9年2月7日・日曜）
    applyUntil: "2026-10-02",    // 受験申込の締切（ネット申込は23:59まで）
    applyLabel: "第39回の受験申込",
    applyNote: "インターネット申込は締切日の23:59まで。手続きは社会福祉振興・試験センターの公式サイトで。",
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
    { id: 1, name: "科目群①", note: "共通科目", subjects: ["igaku", "shinri", "shakaigaku"] },
    { id: 2, name: "科目群②", note: "共通科目", subjects: ["genri", "hosho", "kenri"] },
    { id: 3, name: "科目群③", note: "共通科目", subjects: ["chiiki", "shogai", "keiji"] },
    { id: 4, name: "科目群④", note: "共通科目", subjects: ["swkiban", "swriron", "chosa"] },
    { id: 5, name: "科目群⑤", note: "専門科目", subjects: ["korei", "jido", "hinkon", "hoken"] },
    { id: 6, name: "科目群⑥", note: "専門科目", subjects: ["swkiban2", "swriron2", "keiei"] }
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
