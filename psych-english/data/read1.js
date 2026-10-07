/* 心理英語ノート：訳読 レベル1（PE_READ）
   このファイルは scratchpad の DSL から build.py で生成。英文・訳・解説はすべて独自作成。 */
window.PE_READ = (window.PE_READ || []).concat([
{
"id":"p1-01",
"lv":1,
"tag":"心理学概論",
"t":"心理学とは何か",
"te":"What Is Psychology?",
"w":[
[
"behavior",
"行動"
],
[
"mental process",
"心的過程（考える・感じる・覚えるなどの心の働き）"
],
[
"intuition",
"直感"
],
[
"systematic",
"体系的な"
],
[
"measurement",
"測定"
],
[
"turn out to be",
"結局〜だと分かる"
],
[
"range from A to B",
"AからBにまで及ぶ"
],
[
"apply A to B",
"AをBに応用する"
]
],
"s":[
{
"p":"[S|Psychology] [V|is] [C|the scientific study (of behavior *and* mental processes)].",
"ja":"心理学とは、行動と心的過程についての科学的な研究である。",
"n":[
"定義の文の典型「A is B」。study は「研究、学問」。of 以下が study を後ろから説明している。"
],
"g":[
"g-verb"
]
},
{
"p":"[S|Mental processes] [V|include] [O|thinking, feeling, remembering, *and* perceiving].",
"ja":"心的過程には、考えること、感じること、記憶すること、知覚することが含まれる。",
"n":[
"include「〜を含む」。-ing の語が4つ、and で並んで目的語になっている（動名詞）。"
],
"g":[
"g-ing-to"
]
},
{
"p":"<*Unlike* everyday intuition>, [S|psychology] [V|relies] <on systematic observation *and* careful measurement>.",
"ja":"日常的な直感とは異なり、心理学は体系的な観察と注意深い測定に依拠している。",
"n":[
"Unlike「〜とは違って」は前置詞。rely on「〜に頼る、〜に依拠する」。"
]
},
{
"p":"[S|Even simple questions, (*such as* {*why* we forget people's names}),] [V|often turn out to be] [C|surprisingly complex].",
"ja":"人の名前をなぜ忘れるのかといった、一見単純な問いでさえ、驚くほど複雑だと分かることが多い。",
"n":[
"such as「例えば〜のような」の部分は挿入。turn out to be C「（結局）C だと分かる」。Even は「〜でさえ」。"
],
"g":[
"g-insertion"
]
},
{
"p":"[S|The field (of psychology)] [V|ranges] <from the study (of brain cells)> <to the study (of whole societies)>.",
"ja":"心理学という分野は、脳の細胞の研究から社会全体の研究にまで及んでいる。",
"n":[
"range from A to B「A から B にまで及ぶ」。主語は The field of psychology。"
]
},
{
"p":"[S|Many psychologists] [V|also apply] [O|this knowledge] <to practical problems, (*such as* {helping people (*who* [v|are struggling] <with depression or anxiety>)})>.",
"ja":"多くの心理学者は、この知識を、うつや不安に苦しむ人を援助するといった実際的な問題にも応用している。",
"n":[
"apply A to B「A を B に応用する」。such as 以下は practical problems の具体例。who 以下は people を説明。"
],
"g":[
"g-rel"
]
}
],
"q":[
{
"q":"この文章の内容と合うものは？",
"o":[
"心理学は日常的な直感をもとにした学問である。",
"心理学は体系的な観察と測定に依拠する。",
"心理学は個人の脳だけを研究対象にする。"
],
"a":1,
"e":"3文目に relies on systematic observation and careful measurement とある。直感とは「異なり（Unlike）」と述べている点に注意。5文目から、研究対象は脳の細胞から社会全体にまで及ぶ。"
},
{
"q":"4文目の turn out to be の意味は？",
"o":[
"〜になるよう変える",
"（結局）〜だと分かる",
"〜を断る"
],
"a":1,
"e":"turn out to be C は「結局 C だと分かる、判明する」。"
}
],
"intro":"心理学の入門書の冒頭にありそうな文章です。まずは各文の主語と動詞を見つけることに集中しましょう。"
},
{
"id":"p1-02",
"lv":1,
"tag":"認知心理学",
"t":"記憶の仕組み",
"te":"How Memory Works",
"w":[
[
"encoding",
"符号化"
],
[
"storage",
"貯蔵"
],
[
"retrieval",
"検索、想起"
],
[
"transform",
"変換する"
],
[
"working memory",
"作業記憶（ワーキングメモリ）"
],
[
"capacity",
"容量"
],
[
"reconstruct",
"再構成する"
],
[
"vivid",
"鮮明な"
]
],
"s":[
{
"p":"[S|Psychologists] [V|often describe] [O|memory] <in terms of three stages: encoding, storage, *and* retrieval>.",
"ja":"心理学者はしばしば、記憶を符号化・貯蔵・検索という3つの段階で説明する。",
"n":[
"in terms of「〜の観点から、〜によって」。コロン（:）の後ろは three stages の中身を具体的に並べたもの。"
]
},
{
"p":"[S|Information] [V|must first be encoded], <*that is*, transformed <into a form (*that* [s|the brain] [v|can store])>>.",
"ja":"情報はまず符号化される、つまり脳が貯蔵できる形に変換されなければならない。",
"n":[
"must be encoded は受動態「符号化されなければならない」。that is「すなわち」で言い換え、transformed の前に must be が省略されている。a form that the brain can store「脳が貯蔵できる形」（that は目的格の関係代名詞）。"
],
"g":[
"g-passive"
]
},
{
"p":"[S|Working memory], (*which* [v|holds] [o|information] <for a short time>), [V|has] [O|a very limited capacity].",
"ja":"作業記憶は、情報を短い時間保持するものだが、その容量は非常に限られている。",
"n":[
", which ... , は Working memory についての補足（非制限用法）。capacity「容量」。"
],
"g":[
"g-nonres"
]
},
{
"p":"[S|Retrieval] [V|is] <often> [C|easier] <*when* [s|the context (of recall)] [v|matches] [o|the context (of learning)]>.",
"ja":"想起するときの状況が覚えたときの状況と一致していると、検索はしばしば容易になる。",
"n":[
"when 以下は条件のように「〜すると」と訳すと自然。match「〜と一致する」。context of recall「想起の文脈」、context of learning「学習の文脈」。"
]
},
{
"p":"[S|Memory] [V|is] <not> [C|a perfect recording (of the past)].",
"ja":"記憶は、過去を完全に記録したものではない。",
"n":[
"a perfect recording of the past「過去の完全な記録」→「過去を完全に記録したもの」と動詞的に訳すと自然。"
],
"g":[
"g-nominal"
]
},
{
"p":"<*Each time* [s|we] [v|remember] [o|an event]>, [S|we] [V|partly reconstruct] [O|it], <*which* [v|is] [c|{*why* even vivid memories can be inaccurate}]>.",
"ja":"私たちはある出来事を思い出すたびに、それを部分的に作り直している。鮮明な記憶でさえ不正確でありうるのはそのためである。",
"n":[
"Each time S V「S が V するたびに」。, which is why ... は「そしてそれが〜の理由である」→「〜なのはそのためである」。前の内容全体を which が受けている。"
],
"g":[
"g-nonres",
"g-what"
]
}
],
"q":[
{
"q":"作業記憶について、文章の内容と合うものは？",
"o":[
"情報を長期間にわたって保持する。",
"容量が非常に限られている。",
"鮮明な記憶を作り出す。"
],
"a":1,
"e":"3文目 has a very limited capacity。holds information for a short time（短い時間保持する）とあるので a は誤り。"
},
{
"q":"最後の文で筆者が述べていることは？",
"o":[
"鮮明な記憶は必ず正確である。",
"思い出すたびに記憶は部分的に再構成されるので、鮮明な記憶でも不正確なことがある。",
"出来事は一度しか思い出せない。"
],
"a":1,
"e":"partly reconstruct（部分的に再構成する）ことが、vivid memories can be inaccurate の理由として述べられている。"
}
],
"intro":"記憶の基本的な考え方を説明した文章です。受動態（be＋過去分詞）と、前の内容全体を受ける which に注目しましょう。"
},
{
"id":"p1-03",
"lv":1,
"tag":"発達心理学",
"t":"愛着",
"te":"Attachment",
"w":[
[
"attachment",
"愛着、アタッチメント"
],
[
"caregiver",
"養育者"
],
[
"seek",
"求める"
],
[
"secure base",
"安全基地"
],
[
"explore",
"探索する"
],
[
"separation",
"分離"
],
[
"reunion",
"再会"
],
[
"avoidant",
"回避型の"
],
[
"physiological",
"生理的な"
]
],
"s":[
{
"p":"[S|John Bowlby] [V|proposed] [O|*that* [s|infants] [v|are born] <with a tendency (to seek closeness (to a caregiver))>].",
"ja":"ジョン・ボウルビィは、乳児は養育者への近さを求める傾向をもって生まれてくると提唱した。",
"n":[
"propose that ...「〜と提唱する」。be born with「〜をもって生まれる」。seek closeness to「〜への近さを求める」。"
],
"g":[
"g-that"
]
},
{
"p":"[S|This tendency] [V|is] [C|especially strong] <*when* [s|the infant] [v|feels] [c|frightened, tired, *or* ill]>.",
"ja":"この傾向は、乳児がおびえていたり、疲れていたり、具合が悪かったりするときに、とりわけ強くなる。",
"n":[
"This tendency は前の文の a tendency to seek closeness を受ける。feel C「C だと感じる」。"
],
"g":[
"g-pronoun"
]
},
{
"p":"[S|A caregiver (*who* [v|responds] <sensitively> <to the infant's signals>)] [V|becomes] [C|a \"secure base\" (*from which* [s|the child] [v|can explore] [o|the world])].",
"ja":"乳児の発するサインに敏感に応じる養育者は、子どもがそこから世界を探索できる「安全基地」となる。",
"n":[
"who 以下が caregiver を説明し、主節の動詞は becomes。from which ＝ from the secure base。"
],
"g":[
"g-rel",
"g-relprep"
]
},
{
"p":"[S|Mary Ainsworth] [V|developed] [O|the Strange Situation], (a laboratory procedure (for observing infants' reactions <to brief separations from *and* reunions with their caregivers>)).",
"ja":"メアリー・エインズワースは、養育者からの短い分離と養育者との再会に対する乳児の反応を観察するための実験室での手続き、ストレンジ・シチュエーション法を考案した。",
"n":[
"カンマの後ろの a laboratory procedure ... は the Strange Situation の言い換え（同格）。separations from and reunions with their caregivers は「養育者からの分離と、養育者との再会」で、their caregivers が from と with の両方にかかる。"
]
},
{
"p":"[S|Securely attached infants] [V|may protest] <*when* the caregiver leaves> *but* [V|are quickly comforted] <*when* the caregiver returns>.",
"ja":"安定型の愛着をもつ乳児は、養育者がいなくなると抗議することはあっても、養育者が戻ってくるとすぐに落ち着く。",
"n":[
"主語が一つで、動詞が may protest と are comforted の2つ（but でつながる）。comfort「なだめる、安心させる」の受動態。"
]
},
{
"p":"[S|Avoidant infants], <by contrast>, [V|tend to ignore] [O|the caregiver] <on reunion>, <*even though* their physiological stress may remain high>.",
"ja":"対照的に、回避型の乳児は、再会の場面で養育者を無視する傾向があるが、その生理的なストレスは高いままであることもある。",
"n":[
"by contrast は挿入「対照的に」。tend to do「〜する傾向がある」。even though「〜ではあるけれども」。may は「〜こともある」。"
],
"g":[
"g-contrast",
"g-hedge"
]
}
],
"q":[
{
"q":"「安全基地」について文章の内容と合うものは？",
"o":[
"乳児が一人で探索するための部屋のこと。",
"乳児のサインに敏感に応じる養育者が、子どもにとっての安全基地になる。",
"実験室の手続きの名前である。"
],
"a":1,
"e":"3文目。A caregiver who responds sensitively ... becomes a \"secure base\"。実験室の手続きはストレンジ・シチュエーション法。"
},
{
"q":"回避型の乳児について正しいものは？",
"o":[
"再会するとすぐに養育者に抱きつく。",
"再会の場面で養育者を無視しがちだが、生理的なストレスが高いままのこともある。",
"分離の場面で強く抗議し、なかなか落ち着かない。"
],
"a":1,
"e":"最終文。ignore the caregiver on reunion、even though their physiological stress may remain high。"
}
],
"intro":"ボウルビィとエインズワースの愛着理論を紹介した文章です。関係代名詞のかたまりがどこまでかを確かめながら読みましょう。"
},
{
"id":"p1-04",
"lv":1,
"tag":"学習心理学",
"t":"古典的条件づけ",
"te":"Classical Conditioning",
"w":[
[
"physiologist",
"生理学者"
],
[
"salivate",
"唾液を分泌する"
],
[
"footstep",
"足音"
],
[
"stimulus (pl. stimuli)",
"刺激"
],
[
"neutral",
"中性の"
],
[
"pair A with B",
"AをBと対にする"
],
[
"trigger",
"引き起こす"
],
[
"extinction",
"消去"
]
],
"s":[
{
"p":"[S|Ivan Pavlov], (a Russian physiologist), [V|noticed] [O|*that* [s|the dogs (in his laboratory)] [v|began to salivate] <*before* food was actually given to them>].",
"ja":"ロシアの生理学者イワン・パブロフは、実験室の犬たちが、実際にえさを与えられる前から唾液を出し始めることに気づいた。",
"n":[
"a Russian physiologist は Ivan Pavlov の言い換え（同格の挿入）。notice that ...「〜ということに気づく」。"
]
},
{
"p":"[S|They] [V|salivated], <for example>, <*when* they heard the footsteps (of the assistant (*who* usually fed them))>.",
"ja":"例えば犬たちは、いつもえさをくれる助手の足音を聞くと唾液を出した。",
"n":[
"They ＝ the dogs。who usually fed them は assistant を説明する関係詞節。"
],
"g":[
"g-pronoun"
]
},
{
"p":"<In classical conditioning>, [S|a neutral stimulus] [V|comes to produce] [O|a response] <*after* it has been repeatedly paired with a stimulus (*that* naturally produces that response)>.",
"ja":"古典的条件づけでは、中性の刺激が、その反応を自然に引き起こす刺激と繰り返し対にされた後に、その反応を引き起こすようになる。",
"n":[
"come to do「〜するようになる」。pair A with B「A を B と対にする」の受動態。that naturally produces ... は a stimulus を説明。"
]
},
{
"p":"[S|Fears] [V|can be learned] <in a similar way>.",
"ja":"恐怖も同じようなしかたで学習されうる。",
"n":[
"can be learned「学習されうる」。in a similar way「同様のしかたで」。"
]
},
{
"p":"<*If* [s|a frightening event] [v|occurs] <in a particular place>>, [S|that place] [V|may later trigger] [O|anxiety] <on its own>.",
"ja":"ある場所で恐ろしい出来事が起こると、のちにはその場所そのものが不安を引き起こすことがある。",
"n":[
"trigger「引き起こす、誘発する」。on its own「それだけで、単独で」。"
]
},
{
"p":"[S|Such conditioned responses] [V|gradually weaken] <*when* the conditioned stimulus is repeatedly presented <without the original stimulus>>, <a process (known <as extinction>)>.",
"ja":"そのような条件づけられた反応は、元の刺激なしで条件刺激が繰り返し提示されると、しだいに弱まっていく。これは消去と呼ばれる過程である。",
"n":[
"文末の , a process known as extinction は、前の内容全体を言い換える同格（「〜という過程」）。known as「〜として知られる」は過去分詞の後置修飾。曝露療法はこの原理を応用している。"
],
"g":[
"g-participle"
]
}
],
"q":[
{
"q":"パブロフが気づいたことは？",
"o":[
"犬はえさを食べた後にだけ唾液を出す。",
"犬はえさを与えられる前から唾液を出し始める。",
"助手がえさを与えないと犬は唾液を出さない。"
],
"a":1,
"e":"1文目。began to salivate before food was actually given to them。"
},
{
"q":"「消去」の説明として正しいものは？",
"o":[
"中性の刺激を元の刺激と対にし続けること。",
"元の刺激なしで条件刺激を繰り返し提示すると、条件反応が弱まっていくこと。",
"恐ろしい出来事の記憶を忘れること。"
],
"a":1,
"e":"最終文。repeatedly presented without the original stimulus で反応が gradually weaken する過程が extinction。"
}
],
"intro":"学習の基本である古典的条件づけの説明です。when や after の節と、主節を区別して読みましょう。"
},
{
"id":"p1-05",
"lv":1,
"tag":"健康心理学",
"t":"ストレスと対処",
"te":"Stress and Coping",
"w":[
[
"transaction",
"相互作用、やりとり"
],
[
"appraise",
"評価する"
],
[
"appraisal",
"評価（認知的評価）"
],
[
"threat",
"脅威"
],
[
"resource",
"資源"
],
[
"deal with",
"〜に対処する"
],
[
"problem-focused",
"問題焦点型の"
],
[
"emotion-focused",
"情動焦点型の"
],
[
"adaptive",
"適応的な"
]
],
"s":[
{
"p":"<According to Richard Lazarus *and* Susan Folkman>, [S|stress] [V|arises] <from the transaction (between a person *and* the environment)>.",
"ja":"リチャード・ラザルスとスーザン・フォルクマンによれば、ストレスは人と環境との相互作用から生じる。",
"n":[
"According to「〜によれば」。arise from「〜から生じる」。"
],
"g":[
"g-cause"
]
},
{
"p":"[S|{*What* matters}] [V|is] [C|*not only* the event <itself> *but also* {*how* [s|the person] [v|appraises] [o|it]}].",
"ja":"重要なのは、出来事そのものだけでなく、その人がそれをどのように評価するかである。",
"n":[
"What matters「重要なこと」が主語。not only A but also B「A だけでなく B も」。how 以下は名詞のかたまり。"
],
"g":[
"g-what",
"g-notbut"
]
},
{
"p":"<In primary appraisal>, [S|the person] [V|asks] [O|{*whether* the situation is a threat}]; <in secondary appraisal>, [S|the person] [V|considers] [O|{*whether* they have the resources (to deal with it)}].",
"ja":"一次的評価では、その人は状況が脅威であるかどうかを問い、二次的評価では、それに対処するための資源が自分にあるかどうかを検討する。",
"n":[
"セミコロン（;）は、関連する2つの文をつなぐ。they は the person を受ける単数の they（性別を特定しない書き方）。resources to deal with it「それに対処するための資源」（不定詞の形容詞的用法）。"
],
"g":[
"g-toinf"
]
},
{
"p":"[S|Problem-focused coping] [V|aims] {to change the situation <itself>}, <*whereas* [s|emotion-focused coping] [v|aims] {to manage the feelings (*that* [s|the situation] [v|produces])}>.",
"ja":"問題焦点型の対処は状況そのものを変えることを目指すのに対し、情動焦点型の対処は、その状況が生み出す感情をうまく扱うことを目指す。",
"n":[
"aim to do「〜することを目指す」。whereas「〜であるのに対して」。manage は「（感情を）うまく扱う、調整する」。"
],
"g":[
"g-contrast"
]
},
{
"p":"[S|Neither type] [V|is] [C|superior] <in all circumstances>.",
"ja":"どちらの型も、あらゆる状況において優れているわけではない。",
"n":[
"Neither「どちらも〜ない」。in all circumstances と組み合わさって「どちらもあらゆる状況で優れているわけではない」。"
]
},
{
"p":"<*When* [s|a situation] [v|cannot be changed]>, <for instance>, [S|{managing one's emotional response}] [V|may be] [C|the most adaptive strategy].",
"ja":"例えば、状況を変えることができないときには、自分の情動反応を調整することが最も適応的な方略かもしれない。",
"n":[
"主語は動名詞の managing one's emotional response。adaptive「適応的な」。may be「〜かもしれない」。"
],
"g":[
"g-ing-to"
]
}
],
"q":[
{
"q":"ラザルスとフォルクマンの考えとして合うものは？",
"o":[
"ストレスの大きさは出来事の種類だけで決まる。",
"ストレスは人と環境の相互作用から生じ、出来事をどう評価するかが重要である。",
"一次的評価では、対処の資源があるかどうかを考える。"
],
"a":1,
"e":"1・2文目。資源について考えるのは二次的評価（secondary appraisal）なので c は誤り。"
},
{
"q":"文章の内容と合うものは？",
"o":[
"問題焦点型の対処は、常に情動焦点型より優れている。",
"状況を変えられないときには、情動の調整が最も適応的な場合がある。",
"情動焦点型の対処は、状況そのものを変えることを目指す。"
],
"a":1,
"e":"5・6文目。Neither type is superior in all circumstances、そして状況を変えられないときは managing one's emotional response may be the most adaptive。"
}
],
"intro":"ラザルスとフォルクマンのストレス理論の紹介です。「評価（appraisal）」という語の使われ方と、単数の they に注目しましょう。"
},
{
"id":"p1-06",
"lv":1,
"tag":"精神分析入門",
"t":"無意識という考え",
"te":"The Idea of the Unconscious",
"w":[
[
"the unconscious",
"無意識"
],
[
"awareness",
"気づき、意識"
],
[
"take place",
"起こる"
],
[
"depth",
"深み"
],
[
"dynamic",
"力動的な"
],
[
"unacceptable",
"受け入れがたい"
],
[
"slip of the tongue",
"言い間違い"
],
[
"glimpse",
"垣間見る"
]
],
"s":[
{
"p":"[S|Sigmund Freud] [V|was] <not> [C|the first (to suggest {*that* much (of mental life) takes place <outside awareness>})].",
"ja":"心の生活の多くが意識の外で生じていると示唆したのは、ジークムント・フロイトが最初ではなかった。",
"lit":"フロイトは、心の生活の多くが意識の外で生じていると示唆した最初の人ではなかった。",
"n":[
"the first to do「〜した最初の人」。take place「起こる、生じる」。much of A「A の多く」。"
]
},
{
"p":"<However>, [S|he] [V|gave] [O1|this idea] [O2|a new depth *and* a clinical method].",
"ja":"しかし、フロイトはこの考えに新たな深みと臨床の方法を与えた。",
"n":[
"give O₁ O₂「O₁ に O₂ を与える」（第4文型）。this idea は前の文の「心の多くは意識の外で生じる」という考え。"
],
"g":[
"g-pronoun"
]
},
{
"p":"<For Freud>, [S|the unconscious] [V|was] <not simply> [C|a place (*where* [s|forgotten memories] [v|are stored])].",
"ja":"フロイトにとって、無意識とは、忘れられた記憶がしまわれている単なる場所ではなかった。",
"n":[
"not simply「単に〜ではない」。where は関係副詞で a place を説明。"
]
},
{
"p":"[S|It] [V|was] [C|dynamic]: [S|wishes *and* fears (*that* [v|were] [c|unacceptable] <to the conscious mind>)] [V|were actively kept] <out of awareness>, *yet* [V|continued to influence] [O|behavior].",
"ja":"無意識は力動的なものだった。意識にとって受け入れがたい願望や恐れは、積極的に意識の外へ締め出されていたが、それでもなお行動に影響を及ぼし続けていた。",
"n":[
"It ＝ the unconscious。コロン（:）の後ろが dynamic の中身の説明。were kept と continued が主語 wishes and fears を共有している。yet「それでも、しかし」。"
],
"g":[
"g-passive"
]
},
{
"p":"[S|Slips (of the tongue), forgotten appointments, *and* dreams] [V|were], <in his view>, [C|places (*where* this hidden activity could be glimpsed)].",
"ja":"彼の見方では、言い間違いや約束を忘れること、そして夢は、この隠れた心の働きを垣間見ることのできる場所だった。",
"n":[
"主語は and で並んだ3つ。in his view は挿入。glimpse「垣間見る」の受動態 could be glimpsed。"
],
"g":[
"g-insertion"
]
},
{
"p":"[S|It] [V|is] [C|important] {to remember *that* Freud's theory changed <considerably> <over his long career>}.",
"ja":"フロイトの理論が、その長い経歴の中で大きく変化したことを覚えておくのは大切である。",
"n":[
"It は形式主語で、to remember 以下を指す。considerably「かなり、大きく」。"
],
"g":[
"g-itto"
]
}
],
"q":[
{
"q":"フロイトにとっての無意識として、文章の内容と合うものは？",
"o":[
"忘れられた記憶をしまっておくだけの場所",
"受け入れがたい願望や恐れが締め出されながらも、行動に影響し続ける力動的なもの",
"意識と同じように自由に観察できるもの"
],
"a":1,
"e":"3・4文目。not simply a place where forgotten memories are stored、It was dynamic。"
},
{
"q":"1文目の内容として正しいものは？",
"o":[
"フロイトが初めて無意識という考えを示した。",
"心の多くが意識の外で生じるという考えは、フロイト以前からあった。",
"フロイトは無意識という考えを否定した。"
],
"a":1,
"e":"was not the first to suggest ... は「〜を示唆した最初の人ではなかった」、つまりフロイト以前にも同様の考えがあった。"
}
],
"intro":"フロイトの無意識の考え方を、入門書の調子で紹介した文章です。形式主語の it と、that 節の範囲に注意しましょう。"
},
{
"id":"p1-07",
"lv":1,
"tag":"精神分析入門",
"t":"防衛機制",
"te":"Defense Mechanisms",
"w":[
[
"defense mechanism",
"防衛機制"
],
[
"protect A from B",
"AをBから守る"
],
[
"guilt",
"罪悪感"
],
[
"shame",
"恥"
],
[
"repression",
"抑圧"
],
[
"projection",
"投影"
],
[
"attribute A to B",
"AをBに帰属させる"
],
[
"hostile",
"敵意のある"
],
[
"pathological",
"病的な"
],
[
"rigid",
"硬直した"
],
[
"distort",
"ゆがめる"
]
],
"s":[
{
"p":"[S|Defense mechanisms] [V|are] [C|mental processes (*that* [v|protect] [o|the person] <from painful feelings, (*such as* anxiety, guilt, *or* shame)>)].",
"ja":"防衛機制とは、不安・罪悪感・恥などのつらい感情から人を守る心の過程である。",
"n":[
"protect A from B「A を B から守る」。such as 以下は painful feelings の例。"
]
},
{
"p":"<In repression>, [S|a disturbing thought or memory] [V|is kept] <out of conscious awareness>.",
"ja":"抑圧においては、心をかき乱す考えや記憶が意識の外に締め出される。",
"n":[
"is kept out of「〜の外にとどめておかれる」。disturbing「心をかき乱す、不穏な」。"
]
},
{
"p":"<In projection>, [S|a person] [V|attributes] [O|his or her own unacceptable feelings] <to someone else>.",
"ja":"投影においては、人は自分自身の受け入れがたい感情を、他の誰かのものとみなす。",
"n":[
"attribute A to B「A を B に帰属させる」→「A を B のものとみなす」。his or her は性別を特定しない書き方。"
]
},
{
"p":"[S|A man (*who* [v|is] [c|angry] <with his colleague>)], <for example>, [V|may believe] [O|*that* *it is* the colleague *who* is hostile <to him>].",
"ja":"例えば、同僚に腹を立てている男性が、自分に敵意をもっているのは同僚のほうだと思い込むことがある。",
"n":[
"for example は挿入。that 節の中の it is ... who ... は強調構文「〜なのは…のほうだ」。"
],
"g":[
"g-cleft"
]
},
{
"p":"[S|Defenses] [V|are] <not necessarily> [C|pathological]; <in moderation>, [S|they] [V|help] [O|us] {cope with everyday stress}.",
"ja":"防衛は必ずしも病的なものではない。ほどほどであれば、日常のストレスに対処する助けになる。",
"n":[
"not necessarily「必ずしも〜ない」（部分否定）。help O do「O が〜するのを助ける」。in moderation「適度に、ほどほどに」。"
]
},
{
"p":"[S|Problems] [V|arise] <*when* [s|defenses] [v|become] [c|so rigid] <*that* [s|they] [v|distort] [o|reality] *or* [v|limit] [o|the person's life]>>.",
"ja":"問題が生じるのは、防衛が硬直しすぎて、現実をゆがめたり、その人の生活を狭めたりするようになるときである。",
"n":[
"so ... that ...「とても〜なので…」。「〜するときに問題が生じる」を「問題が生じるのは〜ときだ」と訳すと、筆者の言いたいこと（条件）が伝わりやすい。"
]
}
],
"q":[
{
"q":"投影の例として、文章の内容に合うものは？",
"o":[
"つらい記憶を意識の外に締め出す。",
"同僚に腹を立てている人が、同僚のほうが自分に敵意をもっていると思い込む。",
"怒りの感情を芸術活動に向ける。"
],
"a":1,
"e":"3・4文目。a は抑圧、c は昇華の例。"
},
{
"q":"防衛機制について文章の内容と合うものは？",
"o":[
"防衛機制はすべて病的なものである。",
"ほどほどの防衛は日常のストレスへの対処を助けるが、硬直しすぎると問題が生じる。",
"防衛機制は現実を正確にとらえるための過程である。"
],
"a":1,
"e":"5・6文目。not necessarily pathological、in moderation they help us cope、rigid になると問題。"
}
],
"intro":"防衛機制を紹介した文章です。「A を B に帰属させる」のような型と、so ... that ... に注目しましょう。"
},
{
"id":"p1-08",
"lv":1,
"tag":"精神分析入門",
"t":"夢と精神分析",
"te":"Dreams and Psychoanalysis",
"w":[
[
"random",
"でたらめな"
],
[
"manifest content",
"顕在内容"
],
[
"latent content",
"潜在内容"
],
[
"consist of",
"〜から成る"
],
[
"dream-work",
"夢作業（夢の作業）"
],
[
"condensation",
"圧縮"
],
[
"displacement",
"置き換え（移動）"
],
[
"free association",
"自由連想"
]
],
"s":[
{
"p":"<In his book The Interpretation of Dreams \\(1900\\)>, [S|Freud] [V|argued] [O|*that* [s|dreams] [v|are] [c|meaningful psychological acts], <not random products (of the sleeping brain)>].",
"ja":"フロイトは著書『夢解釈』（1900）で、夢は眠っている脳が生み出すでたらめな産物ではなく、意味のある心的な営みであると論じた。",
"n":[
"argue that ...「〜と論じる」。not random products ... は前の meaningful psychological acts と対比して言い直したもの。邦題は『夢判断』『夢解釈』など訳書によって異なる。実際の刊行は1899年11月だが、刊行年は1900年と表記された。"
]
},
{
"p":"[S|He] [V|distinguished] <*between* the manifest content (of a dream), (*which* [v|is] [c|{*what* the dreamer remembers}]), *and* the latent content, (*which* [v|consists] <of the hidden thoughts *and* wishes (behind it)>)>.",
"ja":"彼は、夢の顕在内容、つまり夢を見た人が覚えている内容と、潜在内容、つまりその背後にある隠れた思考や願望とを区別した。",
"n":[
"distinguish between A and B「A と B を区別する」。, which ... は manifest content と latent content それぞれの説明。consist of「〜から成る」。"
],
"g":[
"g-nonres"
]
},
{
"p":"[S|The latent thoughts] [V|are transformed] <into the manifest dream> <by a process (*that* [s|Freud] [v|called] [c|the dream-work])>.",
"ja":"潜在的な思考は、フロイトが「夢作業」と呼んだ過程によって、顕在的な夢へと変形される。",
"n":[
"be transformed into「〜へと変形される」。that Freud called the dream-work は a process を説明（call O C の O が that になっている）。"
],
"g":[
"g-passive"
]
},
{
"p":"[S|Two (of its main mechanisms)] [V|are] [C|condensation, (*in which* [s|several ideas] [v|are combined] <into a single image>), *and* displacement, (*in which* [s|emotional importance] [v|is shifted] <from one element to another>)].",
"ja":"夢作業の主な仕組みのうちの2つは、いくつかの観念が一つのイメージにまとめられる「圧縮」と、情緒的な重要性がある要素から別の要素へ移される「置き換え」である。",
"n":[
"its ＝ the dream-work's。in which ＝ in condensation／in displacement。displacement は「移動」と訳されることもある。"
],
"g":[
"g-relprep"
]
},
{
"p":"[S|The meaning (of a dream)] [V|cannot be read] <directly> <from its images>.",
"ja":"夢の意味は、そのイメージからそのまま読みとることはできない。",
"n":[
"cannot be read「読みとられえない」→「読みとることはできない」と能動的に訳す。"
]
},
{
"p":"[S|It] [V|emerges] <only gradually>, <through the dreamer's free associations (to each element)>.",
"ja":"夢の意味は、夢を見た人が夢の各要素から自由に連想していくことを通して、ようやく少しずつ明らかになっていく。",
"n":[
"It ＝ the meaning of a dream。the dreamer's free associations to each element は名詞構文で、「夢を見た人が各要素から自由連想すること」とほどく。"
],
"g":[
"g-nominal"
]
}
],
"q":[
{
"q":"「顕在内容」の説明として正しいものは？",
"o":[
"夢の背後にある隠れた願望",
"夢を見た人が覚えている夢の内容",
"夢作業の仕組みの一つ"
],
"a":1,
"e":"2文目。the manifest content ..., which is what the dreamer remembers。"
},
{
"q":"「置き換え（displacement）」の説明として正しいものは？",
"o":[
"いくつかの観念が一つのイメージにまとめられること",
"情緒的な重要性が、ある要素から別の要素へ移されること",
"夢の意味を自由連想によって明らかにすること"
],
"a":1,
"e":"4文目。a は condensation（圧縮）の説明。"
}
],
"intro":"フロイトの夢の理論の基本を述べた文章です。対になる語（manifest／latent）と、前置詞＋関係代名詞に注意しましょう。"
},
{
"id":"p1-09",
"lv":1,
"tag":"臨床心理学",
"t":"治療関係",
"te":"The Therapeutic Relationship",
"w":[
[
"approach",
"アプローチ、取り組み方"
],
[
"consistently",
"一貫して"
],
[
"be associated with",
"〜と関連している"
],
[
"outcome",
"転帰、治療の結果"
],
[
"regardless of",
"〜にかかわらず"
],
[
"therapeutic alliance",
"治療同盟"
],
[
"component",
"要素"
],
[
"negotiate",
"すり合わせる"
],
[
"inevitable",
"避けられない"
],
[
"rupture",
"亀裂"
]
],
"s":[
{
"p":"[S|Many approaches (to psychotherapy)] [V|differ] <in their theories *and* techniques>.",
"ja":"心理療法へのアプローチの多くは、理論や技法の点で互いに異なっている。",
"n":[
"differ in「〜の点で異なる」。approach to「〜への取り組み方」。"
]
},
{
"p":"<Yet> [S|research] [V|has consistently found] [O|*that* [s|the quality (of the therapeutic relationship)] [v|is associated] <with outcome>, <regardless of the type (of therapy)>].",
"ja":"それでも研究では、治療関係の質が治療の結果と関連していることが、療法の種類にかかわらず一貫して見いだされてきた。",
"n":[
"Yet「それでも、しかし」。has found は研究の蓄積を示す現在完了。be associated with「〜と関連している」。regardless of「〜にかかわらず」。"
],
"g":[
"g-tense"
]
},
{
"p":"[S|Edward Bordin] [V|described] [O|the therapeutic alliance] <as having three components: agreement (on goals), agreement (on tasks), *and* an emotional bond (between client *and* therapist)>.",
"ja":"エドワード・ボーディンは、治療同盟には、目標についての合意、課題についての合意、そしてクライエントと治療者の間の情緒的な絆という3つの要素があると述べた。",
"n":[
"describe A as B「A を B と述べる」。as having は as＋動名詞「〜をもつものとして」。コロンの後ろが3つの要素の中身。"
],
"g":[
"g-as"
]
},
{
"p":"[S|The alliance] [V|is] <not> [C|something (*that* [s|the therapist] [v|simply creates] <at the beginning>)].",
"ja":"治療同盟は、治療者が最初に一度つくれば済むようなものではない。",
"n":[
"something that ...「〜するもの」。simply「単に」があるので「単に最初につくるだけのものではない」→「一度つくれば済むものではない」と意訳できる。"
]
},
{
"p":"[S|It] [V|is negotiated] <continuously>, *and* [S|misunderstandings] [V|are] [C|inevitable].",
"ja":"治療同盟は絶えずすり合わされていくものであり、行き違いは避けられない。",
"n":[
"It ＝ the alliance。negotiate「交渉する、（関係を）すり合わせる」の受動態。inevitable「避けられない」。"
]
},
{
"p":"[S|Some researchers] [V|suggest] [O|*that* [s|{repairing these ruptures}] [v|can be] [c|one (of the most important therapeutic experiences)]].",
"ja":"これらの亀裂を修復することは、最も重要な治療的体験の一つになりうる、と示唆する研究者もいる。",
"n":[
"that 節の主語は動名詞の repairing these ruptures。rupture は「亀裂、決裂」で、治療同盟の緊張や行き違いを指す。these ruptures は前の文の misunderstandings を言い換えたもの。"
],
"g":[
"g-ing-to",
"g-hedge"
]
}
],
"q":[
{
"q":"ボーディンの治療同盟の3要素として正しい組み合わせは？",
"o":[
"共感・受容・自己一致",
"目標についての合意・課題についての合意・情緒的な絆",
"理論・技法・結果"
],
"a":1,
"e":"3文目。a はロジャーズの中核条件で、ここでは述べられていない。"
},
{
"q":"文章の内容と合うものは？",
"o":[
"治療同盟は治療の最初に治療者がつくれば変わらない。",
"治療同盟は絶えずすり合わされるもので、亀裂の修復が重要な治療的体験になりうる。",
"療法の種類によって、治療関係の質と結果の関連はまったく異なる。"
],
"a":1,
"e":"4〜6文目。2文目では regardless of the type of therapy とあるので c は誤り。"
}
],
"intro":"心理療法における治療関係についての文章です。研究の蓄積を示す現在完了と、as＋動名詞に注意しましょう。"
},
{
"id":"p1-10",
"lv":1,
"tag":"臨床心理学",
"t":"認知行動療法の基本",
"te":"Basics of Cognitive Behavioral Therapy",
"w":[
[
"be based on",
"〜に基づく"
],
[
"interpret",
"解釈する"
],
[
"automatic thought",
"自動思考"
],
[
"deliberate",
"意図的な"
],
[
"reflection",
"熟考"
],
[
"evidence",
"証拠"
],
[
"replace A with B",
"AをBに置き換える"
],
[
"behavioral experiment",
"行動実験"
]
],
"s":[
{
"p":"[S|Cognitive behavioral therapy \\(CBT\\)] [V|is based] <on the idea (*that* [s|our feelings] [v|are shaped] <by {*how* we interpret events}>)>.",
"ja":"認知行動療法（CBT）は、私たちの感情は出来事をどう解釈するかによって形づくられる、という考えに基づいている。",
"n":[
"be based on「〜に基づいている」。the idea that ... は同格「〜という考え」。how we interpret events は前置詞 by の目的語になる名詞のかたまり。"
],
"g":[
"g-appos"
]
},
{
"p":"[S|Aaron Beck] [V|observed] [O|*that* [s|depressed patients] [v|often had] [o|quick, negative thoughts (about themselves, the world, *and* the future)]].",
"ja":"アーロン・ベックは、うつ病の患者が、自分自身・世界・将来について、すばやく浮かぶ否定的な思考をしばしば抱いていることに気づいた。",
"n":[
"observe that ...「〜ということに気づく、観察する」。自己・世界・将来についての否定的な見方は「認知の3徴」と呼ばれる。"
]
},
{
"p":"[S|He] [V|called] [O|these] [C|\"automatic thoughts\"] <*because* they seemed to arise <without deliberate reflection>>.",
"ja":"彼は、それらが意図的に考えることなく浮かんでくるように思われたので、「自動思考」と呼んだ。",
"n":[
"call O C「O を C と呼ぶ」。these ＝ these thoughts。without deliberate reflection「意図的な熟考なしに」。"
],
"g":[
"g-svoc"
]
},
{
"p":"<In therapy>, [S|the client *and* therapist] [V|examine] [O|the evidence (for *and* against such thoughts)] <together>.",
"ja":"治療では、クライエントと治療者が一緒に、そうした思考を支持する証拠と支持しない証拠を検討する。",
"n":[
"the evidence for and against「〜を支持する証拠と反証」。together は協同的な姿勢を示す。"
]
},
{
"p":"[S|The goal] [V|is] [C|*not* {to replace negative thoughts <with positive ones>} *but* {to find more realistic *and* flexible ways (of thinking)}].",
"ja":"目標は、否定的な思考を肯定的な思考に置き換えることではなく、より現実的で柔軟な考え方を見つけることである。",
"n":[
"not A but B「A ではなく B」。replace A with B「A を B に置き換える」。ones ＝ thoughts。"
],
"g":[
"g-notbut",
"g-ellipsis"
]
},
{
"p":"[S|Clients] [V|are also encouraged] {to test their beliefs <through behavioral experiments> <between sessions>}.",
"ja":"クライエントはまた、セッションとセッションの間に行動実験を通して自分の信念を確かめるよう勧められる。",
"n":[
"encourage O to do「O に〜するよう勧める」の受動態。between sessions「セッションの合間に」（ホームワークとして）。"
]
}
],
"q":[
{
"q":"自動思考についての説明として合うものは？",
"o":[
"治療者が意図的に与える肯定的な考え",
"意図的に考えることなく、すばやく浮かんでくる否定的な思考",
"行動実験で得られる新しい信念"
],
"a":1,
"e":"2・3文目。quick, negative thoughts、arise without deliberate reflection。"
},
{
"q":"認知行動療法の目標として文章の内容と合うものは？",
"o":[
"否定的な思考をすべて肯定的な思考に置き換える。",
"より現実的で柔軟な考え方を見つける。",
"過去の体験の意味を自由連想で明らかにする。"
],
"a":1,
"e":"5文目の not A but B。主張は B（to find more realistic and flexible ways of thinking）。"
}
],
"intro":"認知行動療法の基本的な考え方の説明です。call O C、encourage O to do などの型と、not A but B を確認しましょう。"
}
]);
