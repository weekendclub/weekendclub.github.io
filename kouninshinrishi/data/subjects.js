/* =========================================================================
   公認心理師 国試ドリル ― 試験の枠組み（出題基準の大項目・分野・試験情報）

   出典：一般財団法人 公認心理師試験研修センター公表の試験概要・
         公認心理師試験出題基準（ブループリント）ほか。
   ・154問（午前77問・午後77問、各120分）。一般問題116問（1問1点）、
     事例問題38問（1問3点）で総得点230点。
   ・合格基準は「総得点の60%程度以上を基準とし、問題の難易度で補正した点数以上」。
     社会福祉士の科目群のような足切りはない。
   ・出題基準は24の大項目。本アプリの大項目ごとの問題数は、公表されている
     出題割合の目安を参考にした独自の配分（実際の試験の配分を保証するものではない）。
   ========================================================================= */
var SW_META = {
  app: {
    name: "公認心理師 国試ドリル",
    storeKey: "cppdrill",         // 学習データの保存キー（変えると記録が引き継がれない）
    version: "1.0.0",
    caseFirst: true,              // 本番と同じく「事例 → 問い」の順に表示
    casePoints: "3点",
    heroNote: "154問・230点満点・午前／午後 各120分・事例問題は1問3点",
    mockCard: "本番どおり154問・230点満点・240分。事例問題は3点で採点。ミニ模試・午前のみ・午後のみも。",
    moreMock: "本番形式154問・ミニ模試",
    helpMock: "本番と同じ154問（午前77問・午後77問、各120分）。一般問題1点・事例問題3点の<b>230点満点</b>で採点し、合格点の目安と比べて判定します。ミニ模試（30問）もあります。",
    notice: function (nSets, nQ) {
      return "本アプリの問題は、公認心理師試験出題基準（ブループリント）の24の大項目と出題形式に沿って<strong>独自に作成した練習問題</strong>です（実際の過去問ではありません）。本番と同じ構成（一般問題116問・事例問題38問、計154問）のセットを" + nSets + "回分（" + nQ + "問）収録しています。";
    },
    homeExtra: "",
    helpExamHtml:
      "<h3>試験の概要（第10回）</h3><ul>" +
      "<li>試験日：例年3月上旬の日曜日に実施されています（第9回は2026年3月1日）。第10回の日程は、必ず公式発表で確認し、「設定」の試験日に入力してください。</li>" +
      "<li>154問（午前77問・午後77問）。試験時間は午前・午後とも120分（第9回は午前10:00〜12:00、午後13:30〜15:30）。</li>" +
      "<li>一般問題116問（1問1点）と事例問題38問（1問3点）で、総得点は230点。五肢択一を基本に「2つ選べ」の問題もあります。</li>" +
      "<li>合格基準：総得点の60%程度以上を基準とし、問題の難易度で補正した点数以上。合格点は第7回138点、第8回134点、第9回136点でした。分野ごとの足切りはありません。</li>" +
      "<li>出題基準（ブループリント）は24の大項目。公認心理師としての職責、心理に関する支援、健康・医療、福祉、教育などの比重が大きく、本アプリでは大項目ごとに演習できます。</li></ul>" +
      "<p class=\"small\">試験日程・合格基準・出題基準などは必ず一般財団法人 公認心理師試験研修センターの公式情報で確認してください。</p>",
    searchPlaceholder: "例：守秘義務、愛着、WAIS、ストレスチェック",
    packPlaceholder: "例：第9回 過去問（自分用）",
    labelExample: "第9回 問12",
    printTitle: "公認心理師 練習問題",
    template: {
      subj1: "発達", topic1: "愛着理論", stem1: "J. Bowlbyの愛着理論について、正しいものを1つ選べ。",
      subj2: "心理に関する支援", stem2: "…適切なものを2つ選べ。"
    },
    // 取り込み時に使える別名
    aliases: {
      "公認心理師の職責": "shokuseki", "職責の自覚": "shokuseki", "生涯学習": "mondai", "多職種連携": "renkei", "地域連携": "renkei",
      "心理学概論": "zentai", "臨床心理学概論": "zentai", "研究法": "kenkyu", "心理学研究法": "kenkyu", "統計法": "kenkyu", "心理学統計法": "kenkyu",
      "心理学実験": "jikken", "知覚・認知心理学": "chikaku", "学習・言語心理学": "gakushu", "感情・人格心理学": "kanjo",
      "神経・生理心理学": "noushinkei", "社会・集団・家族心理学": "shakai", "発達心理学": "hattatsu", "障害者・障害児心理学": "shogai",
      "心理的アセスメント": "kansatsu", "アセスメント": "kansatsu", "心理学的支援法": "shien", "心理に関する支援": "shien",
      "健康・医療心理学": "kenko", "福祉心理学": "fukushi", "教育・学校心理学": "kyoiku", "司法・犯罪心理学": "shiho", "産業・組織心理学": "sangyo",
      "人体の構造と機能及び疾病": "jintai", "精神疾患とその治療": "seishin", "関係行政論": "seido", "心の健康教育": "sonota"
    }
  },

  groupLabel: "分野",
  subjLabel: "大項目",            // 出題基準の大項目を単位に演習・集計する
  groupRule: "none",              // 分野ごとの足切りはない
  cats: [["基礎", "基礎心理学"], ["臨床", "臨床・実践"], ["医制", "医学・制度"]],

  mock: {
    scopes: [
      { id: "full", t: "本番形式（午前＋午後）", d: "154問（一般116問・事例38問）・230点満点・240分。午前77問→午後77問の順。", min: 240, offset: 0 },
      { id: "am", t: "午前のみ", d: "77問（一般58問・事例19問）・115点満点・120分。", min: 120, offset: 0 },
      { id: "pm", t: "午後のみ", d: "77問（一般58問・事例19問）・115点満点・120分。", min: 120, offset: 77 },
      { id: "mini", t: "ミニ模試", d: "24の大項目から一般問題を1問ずつ＋事例問題6問、計30問・42点満点・47分。", min: 47 }
    ],
    minPerQ: 240 / 154,
    trendMax: 230,
    refLines: [[138, "60%"]],
    points: function (q) { return q.case ? 3 : 1; },
    judge: function (m, rate) {
      if (m.score >= Math.ceil(m.total * 0.6)) return { label: "合格圏（60%以上）", cls: "pass" };
      if (m.score >= Math.ceil(m.total * 134 / 230)) return { label: "ボーダー圏（年度の補正次第）", cls: "border" };
      return { label: "要強化（過去の合格点に届かず）", cls: "fail" };
    },
    refText: function (m) {
      return m.total === 230 ? "参考：60%＝138点／第9回の合格点 136点／第8回の合格点 134点" : "参考：60%＝" + Math.ceil(m.total * 0.6) + "点（本番は230点満点）";
    },
    noticeHtml: "本番の合格基準は「総得点の60%程度以上を基準とし、問題の難易度で補正した点数以上」です。合格点は第7回が138点、第8回が134点、第9回が136点（いずれも230点満点）でした。本アプリも本番と同じく<strong>一般問題1点・事例問題3点</strong>で採点し、60%（138点）を目安ラインとして判定します。分野ごとの足切りはありません。",
    // 本番形式：一般問題・事例問題を大項目の順に並べて交互に午前・午後へ振り分け、
    // 各時間帯を「一般問題 → 事例問題」の順にする（問題1〜58が一般、59〜77が事例…と同じ形）
    build: function (scope, pool, h) {
      var qs = pool.map(function (id) { return h.BYID[id]; });
      var idx = {};
      SW_META.subjects.forEach(function (s, i) { idx[s.id] = i; });
      var bySubj = function (a, b) { return idx[a.subj] - idx[b.subj]; };
      var ids = function (list) { return list.map(function (q) { return q.id; }); };
      if (scope === 'mini') {
        var gen = [], cas = [], used = {};
        SW_META.subjects.forEach(function (s) {
          gen = gen.concat(h.shuffle(qs.filter(function (q) { return q.subj === s.id && !q.case; })).slice(0, 1));
        });
        h.shuffle(qs.filter(function (q) { return q.case; })).forEach(function (q) {
          if (cas.length < 6 && !used[q.subj]) { used[q.subj] = 1; cas.push(q); }
        });
        return ids(gen.sort(bySubj).concat(cas.sort(bySubj)));
      }
      var am, pm;
      if (h.mix) {
        var sel = [];
        SW_META.subjects.forEach(function (s) {
          sel = sel.concat(h.shuffle(qs.filter(function (q) { return q.subj === s.id && !q.case; })).slice(0, s.gen));
          sel = sel.concat(h.shuffle(qs.filter(function (q) { return q.subj === s.id && q.case; })).slice(0, s.cas));
        });
        var r = CPP_ARRANGE(sel.sort(bySubj));
        am = r.am; pm = r.pm;
      } else {
        am = qs.filter(function (q) { return q.sess === 'am'; });
        pm = qs.filter(function (q) { return q.sess === 'pm'; });
      }
      return ids(scope === 'am' ? am : scope === 'pm' ? pm : am.concat(pm));
    }
  },

  // 回ごとの通し番号（問題1〜154）を本番と同じ並びにする
  order: function (qs) {
    var out = [], bySet = {};
    qs.forEach(function (q) { (bySet[q.set] = bySet[q.set] || []).push(q); });
    Object.keys(bySet).sort(function (a, b) { return a - b; }).forEach(function (k) {
      var r = CPP_ARRANGE(bySet[k]);
      r.am.forEach(function (q) { q.sess = 'am'; });
      r.pm.forEach(function (q) { q.sess = 'pm'; });
      out = out.concat(r.am, r.pm);
    });
    return out;
  },

  exam: {
    name: "第10回公認心理師試験",
    date: null,                   // 未確認のため固定しない（設定で利用者が入力）
    dateNote: "例年3月上旬の日曜に実施。公式発表の日付を「設定」で入力すると、残り日数を表示します",
    applyUntil: null,
    total: 230,
    minutes: { am: 120, pm: 120 },
    history: [
      { round: 9, year: 2026, line: 136, total: 230 },
      { round: 8, year: 2025, line: 134, total: 230 },
      { round: 7, year: 2024, line: 138, total: 230 }
    ]
  },

  // 表示上のまとまり（本アプリ独自の区分）
  groups: [
    { id: 1, name: "①職責・連携", note: "大項目1〜3", subjects: ["shokuseki", "mondai", "renkei"] },
    { id: 2, name: "②心理学の基礎", note: "大項目4〜11", subjects: ["zentai", "kenkyu", "jikken", "chikaku", "gakushu", "kanjo", "noushinkei", "shakai"] },
    { id: 3, name: "③発達・障害", note: "大項目12・13", subjects: ["hattatsu", "shogai"] },
    { id: 4, name: "④アセスメントと支援", note: "大項目14・15", subjects: ["kansatsu", "shien"] },
    { id: 5, name: "⑤5分野の実践", note: "大項目16〜20", subjects: ["kenko", "fukushi", "kyoiku", "shiho", "sangyo"] },
    { id: 6, name: "⑥医学・制度・心の健康教育", note: "大項目21〜24", subjects: ["jintai", "seishin", "seido", "sonota"] }
  ],

  // 出題基準の24の大項目。gen＝一般問題、cas＝事例問題（1回分＝154問の本アプリでの配分）
  subjects: [
    { id: "shokuseki",  name: "公認心理師としての職責の自覚", short: "職責",       cat: "臨床", group: 1, gen: 6, cas: 6 },
    { id: "mondai",     name: "問題解決能力と生涯学習",       short: "生涯学習",   cat: "臨床", group: 1, gen: 2, cas: 1 },
    { id: "renkei",     name: "多職種連携・地域連携",         short: "連携",       cat: "臨床", group: 1, gen: 2, cas: 1 },
    { id: "zentai",     name: "心理学・臨床心理学の全体像",   short: "全体像",     cat: "基礎", group: 2, gen: 4, cas: 0 },
    { id: "kenkyu",     name: "心理学における研究",           short: "研究",       cat: "基礎", group: 2, gen: 3, cas: 0 },
    { id: "jikken",     name: "心理学に関する実験",           short: "実験",       cat: "基礎", group: 2, gen: 3, cas: 0 },
    { id: "chikaku",    name: "知覚及び認知",                 short: "知覚・認知", cat: "基礎", group: 2, gen: 3, cas: 0 },
    { id: "gakushu",    name: "学習及び言語",                 short: "学習・言語", cat: "基礎", group: 2, gen: 3, cas: 0 },
    { id: "kanjo",      name: "感情及び人格",                 short: "感情・人格", cat: "基礎", group: 2, gen: 3, cas: 0 },
    { id: "noushinkei", name: "脳・神経の働き",               short: "脳・神経",   cat: "基礎", group: 2, gen: 3, cas: 0 },
    { id: "shakai",     name: "社会及び集団に関する心理学",   short: "社会・集団", cat: "基礎", group: 2, gen: 3, cas: 0 },
    { id: "hattatsu",   name: "発達",                         short: "発達",       cat: "臨床", group: 3, gen: 5, cas: 2 },
    { id: "shogai",     name: "障害者（児）の心理学",         short: "障害",       cat: "臨床", group: 3, gen: 4, cas: 1 },
    { id: "kansatsu",   name: "心理状態の観察及び結果の分析", short: "アセスメント", cat: "臨床", group: 4, gen: 7, cas: 4 },
    { id: "shien",      name: "心理に関する支援（相談、助言、指導その他の援助）", short: "心理支援", cat: "臨床", group: 4, gen: 9, cas: 4 },
    { id: "kenko",      name: "健康・医療に関する心理学",     short: "健康・医療", cat: "臨床", group: 5, gen: 8, cas: 4 },
    { id: "fukushi",    name: "福祉に関する心理学",           short: "福祉",       cat: "臨床", group: 5, gen: 8, cas: 4 },
    { id: "kyoiku",     name: "教育に関する心理学",           short: "教育",       cat: "臨床", group: 5, gen: 8, cas: 4 },
    { id: "shiho",      name: "司法・犯罪に関する心理学",     short: "司法・犯罪", cat: "臨床", group: 5, gen: 5, cas: 2 },
    { id: "sangyo",     name: "産業・組織に関する心理学",     short: "産業・組織", cat: "臨床", group: 5, gen: 5, cas: 2 },
    { id: "jintai",     name: "人体の構造と機能及び疾病",     short: "人体・疾病", cat: "医制", group: 6, gen: 6, cas: 0 },
    { id: "seishin",    name: "精神疾患とその治療",           short: "精神疾患",   cat: "医制", group: 6, gen: 6, cas: 1 },
    { id: "seido",      name: "公認心理師に関係する制度",     short: "制度",       cat: "医制", group: 6, gen: 7, cas: 2 },
    { id: "sonota",     name: "その他（心の健康教育に関する事項等）", short: "心の健康教育", cat: "医制", group: 6, gen: 3, cas: 0 }
  ]
};
SW_META.subjects.forEach(function (s) { s.count = s.gen + s.cas; });

/* 本番の並びへの振り分け。list は大項目の順に並んでいること。
   一般問題・事例問題をそれぞれ交互に午前・午後へ振り分け、各時間帯を一般→事例の順にする。 */
function CPP_ARRANGE(list) {
  var am = [], pm = [], amc = [], pmc = [], g = 0, c = 0;
  list.forEach(function (q) {
    if (q.case) (c++ % 2 ? pmc : amc).push(q);
    else (g++ % 2 ? pm : am).push(q);
  });
  return { am: am.concat(amc), pm: pm.concat(pmc) };
}

/* 問題バンク。各データファイルが SW_ADD(大項目ID, [問題...], 回) で追加する。
   問題オブジェクト:
     id     固定ID（学習履歴の保存キー。後から変えないこと）
     topic  論点（一問一答や一覧の見出しに使う短い語）
     case   事例文（事例問題のみ。事例問題は1問3点）
     q      問い（「…1つ選べ。」まで）
     opts   選択肢（5つ）
     ans    正答の添字（0始まり）の配列。「2つ選べ」は2要素
     neg    true＝「不適切なもの／誤っているもの」を選ぶ問題
     ox     false＝選択肢が単独の文として正誤判定できない（事例・語句選択など）
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
