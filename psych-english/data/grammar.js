/* 心理英語ノート：構文（PE_GRAMMAR）
   このファイルは scratchpad の DSL から build.py で生成。英文・訳・解説はすべて独自作成。 */
window.PE_GRAMMAR = (window.PE_GRAMMAR || []).concat([
{
"id":"g-verb",
"grp":"文の骨組み",
"t":"動詞を見つけて、主語を決める",
"lead":"英文を訳すときは、まず「主節の動詞」を一つ見つけ、その前のかたまりを主語として確定する。",
"exp":"長い英文でも、文の中心は「主語＋動詞」です。専門書でつまずく原因の多くは、単語ではなく**どれが主節の動詞か**を見失うことにあります。\n手順は次の3つです。\n① 文の中の動詞の候補（-s／-ed がつく語、is・has・can など）に印をつける。\n② that・which・who・when・because などで始まる節の中の動詞と、to do・-ing・-ed の形の語を候補から外す。\n③ 残った動詞が主節の動詞（V）。その前にある名詞のかたまりが主語（S）。\n主語が長いときは、動詞の直前で区切って「〜は」と訳すと、文の骨組みが崩れません。",
"ex":[
{
"p":"[S|The patient (*who* [v|had missed] [o|three sessions])] [V|returned] <with a long story (about her mother)>.",
"ja":"3回続けて面接を休んでいた患者は、母親についての長い話をもって戻ってきた。",
"n":"had missed は関係詞節（who 〜）の中の動詞なので、主節の動詞は returned。主語は The patient から sessions まで。"
},
{
"p":"[S|{*What* the analyst says <in the first few minutes>}] [V|often shapes] [O|the rest (of the session)].",
"ja":"分析家が最初の数分に言うことが、しばしばセッションの残りの部分を方向づける。",
"n":"What で始まる名詞のかたまりが主語。says は主語の中の動詞なので、主節の動詞は shapes。"
},
{
"p":"[S|The capacity (to tolerate uncertainty)] [V|is] [C|essential] <to clinical work>.",
"ja":"不確かさに耐える力は、臨床の仕事に欠かせない。",
"n":"to tolerate は不定詞で、capacity を説明している。主節の動詞は is。"
}
],
"q":[
{
"q":"次の文の主節の動詞はどれ？",
"o":[
"experience",
"may develop",
"separations"
],
"p":"[S|Children (*who* [v|experience] [o|repeated separations] <early in life>)] [V|may develop] [O|a fragile sense (of security)].",
"a":1,
"e":"experience は who で始まる関係詞節の中の動詞。主節の動詞は may develop で、主語は Children から life まで。訳：「人生の早い時期に分離を繰り返し経験した子どもは、もろい安心感しかもてなくなることがある。」"
},
{
"q":"次の文の主語はどこまで？",
"o":[
"The way まで",
"The way から responds まで",
"The way から silence まで"
],
"p":"[S|The way (*in which* [s|a therapist] [v|responds] <to silence>)] [V|reveals] [O|much (about his or her theoretical orientation)].",
"a":2,
"e":"in which 以下は The way を説明する関係詞節。主節の動詞は reveals なので、その直前の silence までが主語。訳：「治療者が沈黙にどう応じるかは、その治療者の理論的な立場について多くを明らかにする。」"
}
]
},
{
"id":"g-svoc",
"grp":"文の骨組み",
"t":"第5文型 SVOC：「O を C にする／とみなす」",
"lead":"make, find, consider, render, leave, call などの後に「O＋C」が続く形は、専門書で非常によく出る。",
"exp":"SVOC は「O が C である」という関係を含む文型です。O と C の間に be 動詞を補って読むと見抜けます。\nよく出る動詞：**make**（O を C にする）、**render**（O を C にする：硬い表現）、**find**（O が C だとわかる・感じる）、**consider**（O を C とみなす）、**leave**（O を C のままにする）、**call**（O を C と呼ぶ）。\n形式目的語の it を使った **make it possible to do**（〜することを可能にする）、**find it difficult to do**（〜するのが難しいと感じる）にも注意します。it は後ろの to 以下を指すので、it 自体は訳しません。",
"ex":[
{
"p":"[S|Early neglect] [V|can render] [O|a child] [C|wary (of closeness)].",
"ja":"早期のネグレクトは、子どもを親密さに対して用心深くさせることがある。",
"n":"a child と wary の間に is を補うと「子どもが用心深い」。render は make の硬い言い方。"
},
{
"p":"[S|Many patients] [V|find] [O|it] [C|difficult] {to speak about their anger} <at first>.",
"ja":"多くの患者は、はじめのうちは自分の怒りについて話すことを難しいと感じる。",
"n":"it は形式目的語で、to speak 以下を指す。「それを」とは訳さない。"
},
{
"p":"[S|Freud] [V|called] [O|this process] [C|\"working through.\"]",
"ja":"フロイトは、この過程を「徹底操作（ワークスルー）」と呼んだ。",
"n":"call O C「O を C と呼ぶ」。"
}
],
"q":[
{
"q":"次の文の訳として最も適切なものは？",
"o":[
"分析家の沈黙は、患者を置き去りにし、何が期待されているかは不確かだった。",
"分析家が黙っていたために、患者は何を期待されているのか分からないままになった。",
"分析家は黙って患者のもとを去り、何が期待されているかを確かめなかった。"
],
"p":"[S|The analyst's silence] [V|left] [O|the patient] [C|uncertain (about *what* was expected)].",
"a":1,
"e":"leave O C「O を C のままにする」。the patient が uncertain な状態に置かれた、という関係を読む。無生物主語なので「〜のために」と訳すと自然。"
},
{
"q":"次の文の it が指すものは？",
"o":[
"Mentalization",
"to understand 以下",
"others' behavior"
],
"p":"[S|Mentalization] [V|makes] [O|it] [C|possible] {to understand others' behavior <in terms of their mental states>}.",
"a":1,
"e":"it は形式目的語。後ろの to understand ... mental states を指す。訳：「メンタライゼーションによって、他者の行動を心の状態という観点から理解することが可能になる。」"
}
]
},
{
"id":"g-itto",
"grp":"文の骨組み",
"t":"形式主語 it：It is ... to / that ...",
"lead":"文頭の It が「それ」ではなく、後ろの to 以下・that 以下を指す形。学術書の定番。",
"exp":"英語は長い主語を嫌うため、長い主語を後ろに回し、空いた主語の位置に **it** を置きます。訳すときは it を訳さず、後ろの部分を主語にします。\nよく出る形：**It is important to note that ...**（〜に注意することが重要である）、**It has been argued that ...**（〜と論じられてきた）、**It is not clear whether ...**（〜かどうかは明らかではない）、**It follows that ...**（〜ということになる）。\n見分け方：It の後ろに is・was・remains などがあり、さらに後ろに to do／that 節／whether 節があれば、まず形式主語を疑います。",
"ex":[
{
"p":"[S|It] [V|is] [C|important] {to distinguish *between* normal grief *and* depression}.",
"ja":"正常な悲嘆とうつ病とを区別することが重要である。",
"n":"It ＝ to distinguish 以下。distinguish between A and B「A と B を区別する」。"
},
{
"p":"[S|It] [V|has been argued] {*that* [s|the self] [v|is] <always> [c|relational]}.",
"ja":"自己とは常に関係的なものだ、と論じられてきた。",
"n":"It ＝ that 以下。has been argued は受動態の現在完了で「これまで論じられてきた」。誰が論じたかを示さない、学術書らしい書き方。"
},
{
"p":"[S|It] [V|remains] [C|unclear] {*whether* [s|these effects] [v|persist] <over time>}.",
"ja":"これらの効果が時間がたっても持続するかどうかは、依然として明らかではない。",
"n":"remain C「C のままである」。whether 節も形式主語 it で後ろに回される。"
}
],
"q":[
{
"q":"次の文の訳として最も適切なものは？",
"o":[
"それは、フロイトがこの理論を何度も改訂したことに注意する価値がある。",
"フロイトがこの理論を何度か改訂したことは、注目に値する。",
"フロイトは注目に値する理論を何度か改訂した。"
],
"p":"[S|It] [V|is] [C|worth noting] {*that* [s|Freud] [v|revised] [o|this theory] <several times>}.",
"a":1,
"e":"It は that 以下を指す形式主語なので「それは」と訳さない。worth noting「注目に値する」。several times は「数回、何度か」。"
},
{
"q":"次の文のうち、It が形式主語ではないものは？",
"o":[
"It is difficult to measure unconscious processes directly.",
"It is likely that the effect was overestimated.",
"It was the analyst's silence that the patient found unbearable.",
"It has been suggested that dreams serve an adaptive function."
],
"a":2,
"e":"c は強調構文。It was と that を取り去ると The patient found the analyst's silence unbearable. という完全な文が残るのが強調構文の目印。訳：「患者が耐えがたいと感じたのは、分析家の沈黙だった。」"
}
]
},
{
"id":"g-passive",
"grp":"文の骨組み",
"t":"受動態と「行為者のいない文」",
"lead":"学術書では、誰がしたかより何がなされたかを示すために受動態が多用される。訳では能動に直すと自然になることが多い。",
"exp":"**be＋過去分詞** が受動態です。学術書では「by 〜」がつかない受動態が多く、誰の行為かは文脈で補います。\nよく出る形：**is thought to / is said to / is believed to do**（〜すると考えられている）、**has been shown to do**（〜することが示されてきた）、**is referred to as**（〜と呼ばれる）、**is known as**（〜として知られる）。\n訳のコツ：「〜される」が続いて不自然なら、「〜と考えられている」「〜とされる」のような日本語の言い回しに置き換えるか、主語を補って能動で訳します。",
"ex":[
{
"p":"[S|This defensive pattern] [V|is often referred to] <as \"splitting.\">",
"ja":"この防衛のパターンは、しばしば「分裂（スプリッティング）」と呼ばれる。",
"n":"refer to A as B「A を B と呼ぶ」の受動態。as の後ろが呼び名。"
},
{
"p":"[S|Secure attachment] [V|has been shown to predict] [O|better emotional regulation] <in later childhood>.",
"ja":"安定した愛着は、児童期後期のより良い情動調整を予測することが示されてきた。",
"n":"has been shown to do「〜することが示されてきた」。研究の蓄積を述べる定番の言い方。"
},
{
"p":"[S|The interpretation (of dreams)] [V|was described] <by Freud> [C|as a \"royal road\" (to the unconscious)].",
"ja":"夢の解釈は、フロイトによって無意識へ至る「王道」と述べられた。",
"n":"describe A as B「A を B と述べる」の受動態で、by Freud が行為者。能動に直すと「フロイトは夢の解釈を無意識への『王道』と呼んだ」。"
}
],
"q":[
{
"q":"次の文の訳として最も適切なものは？",
"o":[
"そのような反応は、子ども時代からの未解決の葛藤を考えて、反映される。",
"そのような反応は、子ども時代から続く未解決の葛藤を反映していると考えられている。",
"子ども時代の未解決の葛藤が、そのような反応について考えさせる。"
],
"p":"[S|Such reactions] [V|are thought to reflect] [O|unresolved conflicts (from childhood)].",
"a":1,
"e":"be thought to do「〜すると考えられている」。主語 Such reactions が reflect の意味上の主語。"
},
{
"q":"次の文の内容として正しいものは？",
"o":[
"反復強迫は、痛ましい経験を知る傾向のことである。",
"つらい経験を繰り返す傾向は、反復強迫として知られている。",
"反復強迫を知ると、つらい経験を繰り返す傾向が生じる。"
],
"p":"[S|The tendency (to repeat painful experiences)] [V|is known] <as the repetition compulsion>.",
"a":1,
"e":"be known as「〜として知られている」。主語は The tendency から experiences まで。the repetition compulsion（反復強迫）はその呼び名。"
}
]
},
{
"id":"g-that",
"grp":"名詞のかたまり",
"t":"that 節：「〜ということ」",
"lead":"suggest・argue・show などの後ろの that 節は「〜ということ」という名詞のかたまり。どこで終わるかを見極める。",
"exp":"that 節は「that＋主語＋動詞 ...」で一つの名詞のかたまりになり、動詞の目的語や、be 動詞の補語になります。\n論文では **suggest that / indicate that / argue that / claim that / note that** が頻出。that 節の中にさらに長い修飾がつくので、**that 節の中の主語と動詞**も確認します。\nthat は省略されることがあります（I think the patient was afraid. ＝ I think that ...）。動詞の直後に「主語＋動詞」が続いていたら、that の省略を疑います。",
"ex":[
{
"p":"[S|These findings] [V|suggest] [O|*that* [s|the quality (of the therapeutic relationship)] [v|matters] <more than the specific technique>].",
"ja":"これらの知見は、特定の技法よりも治療関係の質のほうが重要であることを示唆している。",
"n":"that 節の中の主語は the quality から relationship まで、動詞は matters（重要である）。"
},
{
"p":"[S|The problem] [V|is] [C|*that* [s|the patient] [v|does not experience] [o|these feelings] <as his own>].",
"ja":"問題は、患者がこれらの感情を自分自身のものとして体験していないことだ。",
"n":"The problem is that ...「問題は〜ということだ」。that 節が補語（C）。experience A as B「A を B として体験する」。"
},
{
"p":"[S|Most clinicians] [V|would agree] [O|*that* [s|empathy] [v|cannot be reduced] <to a technique>].",
"ja":"大半の臨床家は、共感が技法に還元できるものではないという点に同意するだろう。",
"n":"reduce A to B「A を B に還元する」の受動態 cannot be reduced to。would は「（尋ねれば）〜だろう」という控えめな推量。"
}
],
"q":[
{
"q":"次の文の that 節はどこまで？",
"o":[
"that から attached まで",
"that から freely まで（文末まで）",
"that から explore まで"
],
"p":"[S|Several studies] [V|have shown] [O|*that* [s|children (*who* [v|are] [c|securely attached])] [v|explore] [o|their environment] <more freely>].",
"a":1,
"e":"that 節の中に関係詞節（who are securely attached）が入っている。that 節の動詞は explore で、that 節は文末の freely まで。訳：「いくつかの研究は、安定した愛着をもつ子どもは、より自由に環境を探索することを示してきた。」"
},
{
"q":"that が省略されているのはどれ？",
"o":[
"The analyst felt that the session had gone well.",
"The patient believed her mother had never loved her.",
"It is clear that further research is needed.",
"The idea that dreams have meaning is old."
],
"a":1,
"e":"b は believed の後ろに that が省略されている（believed (that) her mother had never loved her）。動詞の直後に「主語（her mother）＋動詞（had never loved）」が続くのが目印。"
}
]
},
{
"id":"g-appos",
"grp":"名詞のかたまり",
"t":"同格の that：「〜という考え」",
"lead":"the idea that ... / the fact that ... / the assumption that ... の that は、前の名詞の中身を説明する「同格」。関係代名詞と区別する。",
"exp":"**抽象名詞＋that 節**で、that 節がその名詞の内容を表す形を同格といいます。「〜という考え」「〜という事実」と訳します。\nよく出る名詞：idea, notion, view, fact, assumption, belief, claim, hypothesis, possibility, sense, conviction, finding, evidence。\n関係代名詞の that との見分け方：同格の that 節は**それだけで完全な文**（主語も目的語もそろっている）。関係代名詞の that 節は、主語か目的語が一つ欠けています。",
"ex":[
{
"p":"[S|The idea (*that* [s|early experiences] [v|shape] [o|later personality])] [V|is] [C|central (to psychoanalytic thinking)].",
"ja":"早期の体験がその後のパーソナリティを形づくるという考えは、精神分析的な考え方の中心にある。",
"n":"that 節は early experiences（S′）shape（V′）later personality（O′）とそろった完全な文なので同格。主節の動詞は is。"
},
{
"p":"[S|We] [V|must take] <seriously> [O|the possibility (*that* [s|the patient's complaint] [v|is] [c|justified])].",
"ja":"患者の訴えが正当であるという可能性を、私たちは真剣に受けとめなければならない。",
"n":"take O seriously「O を真剣に受けとめる」の O が長いため、seriously が前に出ている。the possibility that ... は同格。"
},
{
"p":"[S|The assumption (*that* [s|the therapist] [v|can remain] [c|completely neutral])] [V|has been questioned] <by relational analysts>.",
"ja":"治療者が完全に中立でいられるという前提は、関係論の分析家たちによって疑問視されてきた。",
"n":"that 節の中は the therapist（S′）can remain（V′）completely neutral（C′）で完全な文。question は動詞で「疑問視する」。"
}
],
"q":[
{
"q":"次の文の that の働きとして正しいものは？",
"o":[
"関係代名詞（belief を説明し、that 節の中に欠けた語がある）",
"同格（belief の中身を表し、that 節は完全な文）",
"接続詞（kept の目的語となる名詞節）"
],
"p":"[S|The belief (*that* [s|one] [v|must never show] [o|weakness])] [V|kept] [O|him] <from seeking help>.",
"a":1,
"e":"that 節（one must never show weakness）は主語・動詞・目的語がそろった完全な文なので同格。keep O from doing「O が〜するのを妨げる」。訳：「弱さを決して見せてはならないという思い込みのために、彼は助けを求めることができなかった。」"
},
{
"q":"同格の that を含む文はどれ？",
"o":[
"The memories that she described were vague.",
"There is growing evidence that mindfulness reduces stress.",
"The therapist that she saw last year has retired.",
"This is the conclusion that most readers reach."
],
"a":1,
"e":"b の that 節（mindfulness reduces stress）は完全な文で、evidence の中身を表す同格。a・c・d の that は関係代名詞で、that 節の中の目的語が欠けている（described ＿、saw ＿、reach ＿）。"
}
]
},
{
"id":"g-what",
"grp":"名詞のかたまり",
"t":"what・疑問詞の名詞節",
"lead":"what は「〜するもの・こと」、how・why・whether は「どのように〜か／なぜ〜か／〜かどうか」。いずれも名詞のかたまりを作る。",
"exp":"**what** は先行詞を含む関係代名詞で、「〜すること・もの」という名詞のかたまりを作ります（what the patient says＝患者が言うこと）。\n**how／why／when／where／whether／if** で始まる名詞節は、「どのように〜か」「なぜ〜か」「〜かどうか」と訳します。\n精神分析の文献では、**what is said と what is not said**（語られることと語られないこと）、**how the patient relates to the analyst**（患者が分析家とどのように関わるか）のような対比がよく出ます。",
"ex":[
{
"p":"[S|{*What* [s|the patient] [v|leaves] [c|unsaid]}] [V|may be] [C|more important] <than {*what* [s|she] [v|says]}>.",
"ja":"患者が口にしないままにしていることのほうが、彼女が言うことよりも重要かもしれない。",
"n":"leave O unsaid「O を言わないままにする」の O が what になって前に出ている。"
},
{
"p":"[S|The analyst] [V|tried to understand] [O|{*why* [s|the patient] [v|always arrived] <late> <on Mondays>}].",
"ja":"分析家は、なぜその患者がいつも月曜日に遅れて来るのかを理解しようとした。",
"n":"why 以下が understand の目的語。主節の動詞は tried（try to do「〜しようとする」）。"
},
{
"p":"[S|{*Whether* [s|this change] [v|will last]}] [V|remains] [C|to be seen].",
"ja":"この変化が持続するかどうかは、まだ分からない。",
"n":"remain to be seen「まだ分からない」は定型表現。Whether 節が主語。"
}
],
"q":[
{
"q":"次の文の訳として最も適切なものは？",
"o":[
"私たちはどのように症状を理解し、どのようにそれに応えるかを形づくる。",
"症状をどう理解するかが、それにどう応じるかを左右する。",
"症状が私たちを理解する方法は、私たちが症状に応える方法である。"
],
"p":"[S|{*How* [s|we] [v|understand] [o|a symptom]}] [V|shapes] [O|{*how* [s|we] [v|respond] <to it>}].",
"a":1,
"e":"How we understand a symptom（症状をどう理解するか）が主語、shapes が動詞、how we respond to it（それにどう応じるか）が目的語。"
},
{
"q":"次の文の主節の動詞は？",
"o":[
"called",
"is",
"forgotten"
],
"p":"[S|{*What* [s|Freud] [v|called] [c|\"the unconscious\"]}] [V|is] [C|not simply a storehouse (of forgotten memories)].",
"a":1,
"e":"What Freud called \"the unconscious\"（フロイトが「無意識」と呼んだもの）全体が主語で、主節の動詞は is。訳：「フロイトが『無意識』と呼んだものは、単に忘れられた記憶の貯蔵庫ではない。」"
}
]
},
{
"id":"g-ing-to",
"grp":"名詞のかたまり",
"t":"動名詞・不定詞が主語・目的語になる",
"lead":"-ing や to do が文頭に来て主語になる形。「〜すること」と訳し、その後ろの主節の動詞を探す。",
"exp":"**動名詞（-ing）** と **不定詞（to do）** は「〜すること」という名詞のかたまりを作ります。文頭の -ing が主語なのか、分詞構文（→「分詞構文」の項）なのかは、**すぐ後ろに主節の動詞が続くか**で見分けます。\n例：Interpreting dreams **requires** patience.（動名詞が主語：直後に requires）／ Interpreting the dream, **the analyst noticed** ...（分詞構文：カンマの後に主語＋動詞）。\n動名詞には意味上の主語が所有格でつくことがあります：**the patient's leaving early**（患者が早く帰ること）。",
"ex":[
{
"p":"[S|{Putting feelings into words}] [V|can reduce] [O|their intensity].",
"ja":"感情を言葉にすることで、その強さが和らぐことがある。",
"n":"Putting ... words が主語（動名詞）。無生物主語は「〜することで」と訳すと自然。put A into words「A を言葉にする」。"
},
{
"p":"[S|{To interpret too early}] [V|risks] [O|{overwhelming the patient}].",
"ja":"早すぎる解釈は、患者を圧倒してしまう危険がある。",
"n":"To interpret too early（早すぎる時期に解釈すること）が主語。risk doing「〜する危険を冒す」の目的語も動名詞。"
},
{
"p":"[S|The patient] [V|resented] [O|{the analyst's taking a vacation <in August>}].",
"ja":"患者は、分析家が8月に休暇をとることに憤りを感じていた。",
"n":"the analyst's が動名詞 taking の意味上の主語で、「分析家が休暇をとること」。休暇などによる中断は、精神分析で重要な主題になる。"
}
],
"q":[
{
"q":"次の文の構造として正しいものは？",
"o":[
"Listening は分詞構文で、主語は patient",
"Listening から judging までが主語で、動詞は is",
"Listening は進行形の一部"
],
"p":"[S|{Listening to a patient <without judging>}] [V|is] [C|harder (than it sounds)].",
"a":1,
"e":"すぐ後ろに主節の動詞 is が続くので、Listening ... judging は動名詞の主語。訳：「判断を下さずに患者の話を聴くことは、聞こえるほど簡単ではない（思ったより難しい）。」"
},
{
"q":"次の文の訳として最も適切なものは？",
"o":[
"初回面接の目的は、患者がなぜ今来談したのかを理解することである。",
"初回面接の目的は、なぜ患者が理解するために今来たのかである。",
"患者が今来た理由は、初回面接の目的を理解するためである。"
],
"p":"[S|The aim (of the first interview)] [V|is] [C|{to understand {*why* the patient has come now}}].",
"a":0,
"e":"to understand 以下が補語（C）の名詞のかたまり。why the patient has come now は understand の目的語。"
}
]
},
{
"id":"g-nominal",
"grp":"名詞のかたまり",
"t":"名詞構文：抽象名詞を「文」にほどいて訳す",
"lead":"the patient's refusal to talk のような「名詞＋of／所有格」の固まりは、「患者が話すのを拒むこと」のように主語と述語にほどくと訳しやすい。",
"exp":"英語の学術書は、動詞で言える内容を**名詞**で言う傾向があります（名詞構文）。直訳すると「〜の…」が続く読みにくい日本語になるので、**名詞を動詞に戻して「誰が・何を・どうする」に組み直します**。\n手順：① 中心の名詞を動詞に戻す（refusal → refuse、recognition → recognize）。② 所有格や of の後ろを主語か目的語にする。③ 形容詞は副詞に直す（rapid improvement → 急速に改善すること）。\nof の後ろが主語になるか目的語になるかは文脈で判断します：the arrival **of the patient**（患者**が**到着すること：主語）／ the treatment **of the patient**（患者**を**治療すること：目的語）。",
"ex":[
{
"p":"[S|The patient's sudden withdrawal (from treatment)] [V|surprised] [O|everyone].",
"ja":"患者が突然治療をやめてしまったことに、誰もが驚いた。",
"n":"直訳は「患者の治療からの突然の撤退は皆を驚かせた」。withdrawal を withdraw（やめる）に戻し、sudden を「突然」と副詞的に訳す。"
},
{
"p":"[S|A careful consideration (of the patient's history)] [V|reveals] [O|a different picture].",
"ja":"患者の生育歴を注意深く検討すると、異なる像が浮かび上がる。",
"n":"consideration of A ＝ consider A（A を検討する）。無生物主語の文は「〜すると」と条件のように訳すと自然。"
},
{
"p":"[S|Freud's recognition (of the importance (of transference))] [V|came] <only gradually>.",
"ja":"フロイトが転移の重要性を認識するようになったのは、少しずつのことだった。",
"n":"Freud's recognition of A ＝ Freud recognized A。only gradually「少しずつでしかなく」。"
}
],
"q":[
{
"q":"次の文の自然な訳は？",
"o":[
"治療者の自分の誤りを認める失敗が、患者の不信を深めた。",
"治療者が自分の誤りを認めなかったために、患者の不信感はいっそう強まった。",
"治療者は誤りを認めることに失敗し、患者を深く不信に陥れた。"
],
"p":"[S|The therapist's failure (to acknowledge her mistake)] [V|deepened] [O|the patient's mistrust].",
"a":1,
"e":"failure to do ＝ fail to do「〜しない、〜しそこなう」。名詞構文をほどいて「治療者が〜を認めなかった」とし、無生物主語の文は「〜のために」と因果で訳す。"
},
{
"q":"the treatment of children with autism の of の後ろの働きは？",
"o":[
"主語（子どもが治療する）",
"目的語（自閉スペクトラム症の子どもを治療する）",
"所有（子どもの持っている治療）"
],
"a":1,
"e":"treatment of A は「A を治療すること」。of の後ろは treat の目的語にあたる。"
}
]
},
{
"id":"g-rel",
"grp":"修飾のかたまり",
"t":"関係代名詞 who／which／that",
"lead":"名詞の後ろに who・which・that が来たら、その名詞を説明するかたまりの始まり。かたまりがどこで終わるかを、動詞の数で確かめる。",
"exp":"関係代名詞の節は、前の名詞（先行詞）を後ろから説明します。訳すときは「〜する（名詞）」と後ろから前へかけます。\nかたまりの終わりを見つけるコツ：関係詞節の中には動詞が一つあります。**関係詞節の動詞の後ろに、もう一つ動詞が出てきたら、そこからが主節**です。\n目的格の関係代名詞（whom／which／that）は**省略**されることがあります：the dream **(that) she reported**（彼女が報告した夢）。名詞の直後に「主語＋動詞」が続いたら省略を疑います。",
"ex":[
{
"p":"[S|Patients (*who* [v|feel] [c|understood])] [V|are] [C|more likely (to stay in treatment)].",
"ja":"理解されていると感じる患者は、治療を続ける可能性が高い。",
"n":"who feel understood が Patients を説明。feel C「C だと感じる」。主節の動詞は are。be likely to do「〜する可能性が高い」。"
},
{
"p":"[S|The dream ([s|she] [v|reported] <in the first session>)] [V|contained] [O|an image (of a locked door)].",
"ja":"彼女が最初のセッションで報告した夢には、鍵のかかった扉のイメージが含まれていた。",
"n":"The dream の後ろに目的格の that（which）が省略されている。she reported が The dream を説明し、主節の動詞は contained。"
},
{
"p":"[S|Bowlby] [V|described] [O|a system (*that* [v|keeps] [o|the infant] <close to the caregiver>)].",
"ja":"ボウルビィは、乳児を養育者の近くにとどめておく仕組みについて述べた。",
"n":"keep O close to ...「O を〜の近くにとどめる」。that は主格の関係代名詞（keeps の主語）。"
}
],
"q":[
{
"q":"次の文で、省略されている関係代名詞を補うならどこ？",
"o":[
"The の前",
"feelings と the analyst の間",
"experiences と in の間"
],
"p":"[S|The feelings ([s|the analyst] [v|experiences] <in the session>)] [V|can provide] [O|valuable information].",
"a":1,
"e":"The feelings の直後に the analyst experiences（主語＋動詞）が続き、experiences の目的語が欠けている。目的格の関係代名詞（that／which）が省略されている。訳：「分析家がセッションの中で体験する感情は、貴重な情報をもたらしうる。」逆転移を情報源とみる考え方。"
},
{
"q":"次の文の主節の動詞は？",
"o":[
"are",
"ignored",
"may stop"
],
"p":"[S|A child ([s|*whose* needs] [v|are repeatedly ignored])] [V|may stop] [O|{expressing them}].",
"a":2,
"e":"whose needs are repeatedly ignored は A child を説明する関係詞節。主節の動詞は may stop（stop doing「〜するのをやめる」）。訳：「欲求が繰り返し無視される子どもは、それを表に出さなくなるかもしれない。」"
}
]
},
{
"id":"g-relprep",
"grp":"修飾のかたまり",
"t":"前置詞＋関係代名詞（in which／by which）",
"lead":"in which、through which、by which などは「その中で・それを通して・それによって」と、前の名詞を受けて節をつなぐ。",
"exp":"**前置詞＋which（whom）** は、関係詞節の中で前置詞の目的語になる先行詞を表します。the setting **in which** therapy takes place ＝ therapy takes place **in the setting**（その場で治療が行われる→治療が行われる場）。\n訳し方は2通り：① 後ろから前へ「〜が行われる場」とかける。② 長いときは前から「〜という場であり、そこで…」と訳し下ろす。\n精神分析・臨床の文献では **the process by which**（〜する過程）、**the way(s) in which**（〜するやり方）、**the extent to which**（〜する程度）が頻出です。",
"ex":[
{
"p":"[S|Transference] [V|is] [C|the process (*by which* [s|past relationships] [v|are revived] <in the present>)].",
"ja":"転移とは、過去の関係が現在においてよみがえる過程である。",
"n":"by which ＝ by the process（その過程によって）。revive「よみがえらせる」の受動態。"
},
{
"p":"[S|We] [V|need to consider] [O|the extent (*to which* [s|culture] [v|shapes] [o|the expression (of distress)])].",
"ja":"文化が苦悩の表れ方をどの程度形づくっているのかを、私たちは考える必要がある。",
"n":"the extent to which S V「S が V する程度」→「どの程度 S が V するか」と訳すと自然。"
},
{
"p":"[S|The frame] [V|provides] [O|a space (*within which* [s|difficult feelings] [v|can be thought about] <safely>)].",
"ja":"治療の枠は、難しい感情について安全に考えることのできる空間を提供する。",
"n":"within which ＝ within the space。think about の受動態 be thought about。"
}
],
"q":[
{
"q":"次の文の訳として最も適切なものは？",
"o":[
"この研究は、患者が症状を感じとる道筋を探る。",
"この研究は、患者が自分の症状をどのように意味づけているのかを探る。",
"この研究は、患者の症状の中にある感覚を探る。"
],
"p":"[S|This study] [V|explores] [O|the ways (*in which* [s|patients] [v|make] [o|sense] <of their symptoms>)].",
"a":1,
"e":"the ways in which S V は「S が V するやり方」→「どのように S が V するか」。make sense of A「A を理解する、意味づける」。"
},
{
"q":"空所に入るのは？ The relationship (　) the patient first felt safe was with her grandmother.",
"o":[
"which",
"in which",
"who"
],
"a":1,
"e":"the patient first felt safe in the relationship なので、前置詞 in が必要。訳：「患者が初めて安心を感じた関係は、祖母との関係だった。」"
}
]
},
{
"id":"g-nonres",
"grp":"修飾のかたまり",
"t":"非制限用法（, which）と前の文全体を受ける which",
"lead":"カンマの後ろの which は、前の名詞だけでなく「前の内容全体」を受けることがある。「そしてそれは〜」と訳し下ろす。",
"exp":"関係代名詞の前にカンマがある形（非制限用法）は、先行詞に補足説明を加えます。訳では前から順に「〜で、それは…」と訳し下ろすのが自然です。\n**, which** は直前の名詞だけでなく、**前の節（文の内容）全体**を受けることがあります。which の後ろの動詞が単数形で、意味が「出来事」にふさわしければ、前の内容全体を受けていると考えます。\n**, who** は人について補足します。固有名詞（Freud、Klein など）の後の , who は必ず非制限用法です。",
"ex":[
{
"p":"[S|The patient] [V|began] [O|{to miss sessions}], <*which* [s|the analyst] [v|understood] <as a response (to the coming break)>>.",
"ja":"患者はセッションを休み始めたが、分析家はそれを、近づいている休暇による中断への反応として理解した。",
"n":"which は前の文全体（患者がセッションを休み始めたこと）を受け、understood の目的語になっている。the coming break「近く予定されている中断（休暇）」。"
},
{
"p":"[S|Melanie Klein], (*who* [v|worked] <extensively> <with young children>), [V|developed] [O|a technique (of play analysis)].",
"ja":"メラニー・クラインは、幼い子どもたちとの臨床に幅広く取り組み、遊びを用いた分析の技法を発展させた。",
"n":", who ... , はクラインについての補足。前から訳し下ろすと自然。"
},
{
"p":"[S|Many patients] [V|improve] <within a few sessions>, <*which* [v|suggests] [o|*that* [s|common factors] [v|play] [o|an important role]]>.",
"ja":"多くの患者が数回のセッションのうちに改善するが、このことは、共通要因が重要な役割を果たしていることを示唆している。",
"n":"which は前の文全体（多くの患者が数回で改善すること）を受けて suggests の主語になる。動詞が単数形の suggests である点にも注目。"
}
],
"q":[
{
"q":"次の文の which が受けている内容は？",
"o":[
"the analyst",
"a long time",
"分析家が長い間黙っていたこと（前の文全体）"
],
"p":"[S|The analyst] [V|remained] [C|silent] <for a long time>, <*which* [v|made] [o|the patient] [c|anxious]>.",
"a":2,
"e":"which の後の made the patient anxious（患者を不安にさせた）の主語として意味が通るのは「分析家が長く黙っていたこと」。訳：「分析家は長い間黙っていたが、そのことが患者を不安にさせた。」"
},
{
"q":"次の文の訳として最も自然なものは？",
"o":[
"第一次世界大戦で戦車の指揮官を務めたビオンだけが、のちに戦争体験について書いた。",
"ビオンは第一次世界大戦で戦車の指揮官を務めた人物で、のちにその戦争体験について書いている。",
"ビオンは戦争の体験について書いたあとで、第一次世界大戦で戦車の指揮官を務めた。"
],
"p":"[S|Bion], (*who* [v|had served] <as a tank commander> <in the First World War>), [V|later wrote] <about his experiences (of the war)>.",
"a":1,
"e":", who ... , は補足説明なので「〜だけが」と限定しない。had served（過去完了）は wrote より前の出来事。"
}
]
},
{
"id":"g-participle",
"grp":"修飾のかたまり",
"t":"分詞の後置修飾（-ing／-ed が名詞を説明する）",
"lead":"名詞の直後の -ing・-ed は、その名詞を説明していることが多い。-ed を主節の動詞と取り違えないことが最重要。",
"exp":"名詞の後ろに **-ing（〜している）** や **-ed（〜された）** が続き、その名詞を説明する形です。関係代名詞＋be動詞が省略された形と考えると分かりやすい：patients **(who are) suffering from** anxiety。\n最大の落とし穴は、過去分詞の -ed を**主節の過去形の動詞と取り違える**ことです。The feelings **evoked** in the analyst **are** ... のように、後ろに本当の動詞（are）があれば、evoked は feelings を説明する過去分詞です。\n見分け方：-ed の語の後ろに目的語がなく、さらに後ろに別の動詞があれば、その -ed は過去分詞の修飾です。",
"ex":[
{
"p":"[S|The feelings (evoked <in the analyst>)] [V|are] <not always> [C|easy (to recognize)].",
"ja":"分析家の中に呼び起こされる感情は、必ずしも認識しやすいとは限らない。",
"n":"evoked は過去分詞で feelings を説明（呼び起こされた感情）。主節の動詞は are。not always「必ずしも〜ない」（部分否定）。"
},
{
"p":"[S|Children (exposed <to chronic stress>)] [V|show] [O|changes (in their stress response systems)].",
"ja":"慢性的なストレスにさらされた子どもには、ストレス反応系の変化がみられる。",
"n":"exposed to「〜にさらされた」は Children を説明する過去分詞。主節の動詞は show。"
},
{
"p":"[S|Patients (suffering <from chronic pain>)] [V|often report] [O|feelings (of helplessness)].",
"ja":"慢性の痛みに苦しむ患者は、しばしば無力感を訴える。",
"n":"suffering from は Patients を説明する現在分詞。report は「（症状などを）訴える、報告する」。"
}
],
"q":[
{
"q":"次の文の主節の動詞は？",
"o":[
"recovered",
"were",
"fragmentary"
],
"p":"[S|The memories (recovered <during the analysis>)] [V|were] [C|fragmentary].",
"a":1,
"e":"recovered は memories を説明する過去分詞（回復された記憶）。主節の動詞は were。訳：「分析の間に想起された記憶は断片的なものだった。」"
},
{
"q":"次の文の訳として最も適切なものは？",
"o":[
"この研究で質問紙を使い、成人の愛着スタイルを評価するために開発した。",
"この研究で用いた質問紙は、成人の愛着スタイルを評価するために開発されたものである。",
"この研究は、成人の愛着スタイルを評価するために使われた質問紙を開発した。"
],
"p":"[S|The questionnaire (used <in this study>)] [V|was developed] <to assess attachment styles (in adults)>.",
"a":1,
"e":"used in this study は questionnaire を説明する過去分詞。主節の動詞は was developed（開発された）。to assess は目的を表す不定詞。"
}
]
},
{
"id":"g-partcons",
"grp":"修飾のかたまり",
"t":"分詞構文（文頭・文末の -ing／-ed）",
"lead":"カンマで区切られた -ing・-ed のかたまりは、主節に「時・理由・付帯状況」などを添える。意味上の主語は主節の主語。",
"exp":"分詞構文は、接続詞と主語を省いて分詞で始めた副詞のかたまりです。意味（時・理由・条件・譲歩・付帯状況）は文脈で決めます。迷ったら「〜して」「〜しながら」とゆるくつなぐのが安全です。\n学術書の定番：**Drawing on** Winnicott's work, ...（ウィニコットの仕事に依拠して）、**Building on** ...（〜をふまえて）、**Taken together**, these findings ...（総合すると）、**Compared with** ...（〜と比べて）、**Given** ...（〜を考えると）。\n意味上の主語は**主節の主語**です。文末の分詞構文（..., suggesting that ...）は、前の内容全体を受けて「そしてそれは〜を示している」と訳すことが多いです。",
"ex":[
{
"p":"<Drawing on Winnicott's concept (of the holding environment)>, [S|the author] [V|examines] [O|the function (of the therapeutic setting)].",
"ja":"ウィニコットの「抱える環境」という概念に依拠しながら、著者は治療設定の機能を検討している。",
"n":"Drawing on ... の意味上の主語は the author。draw on「〜に依拠する、〜を活用する」。"
},
{
"p":"<Taken together>, [S|these findings] [V|indicate] [O|*that* [s|attachment] [v|remains] [c|relevant] <throughout the lifespan>].",
"ja":"総合すると、これらの知見は、愛着が生涯を通じて重要であり続けることを示している。",
"n":"Taken together「（これらを）まとめて考えると」。過去分詞の分詞構文で、意味上の主語は these findings。"
},
{
"p":"[S|The patient] [V|fell] [C|silent], <looking away <from the analyst>>.",
"ja":"患者は黙り込み、分析家から目をそらした。",
"n":"looking away ... は付帯状況（〜しながら、そして〜）。fall silent「黙り込む」（SVC）。"
}
],
"q":[
{
"q":"次の文の訳として最も適切なものは？",
"o":[
"介入群の参加者は統制群と比較したうえで、より少ない抑うつ症状を報告した。",
"統制群と比べて、介入群の参加者が報告した抑うつ症状は少なかった。",
"統制群は介入群の参加者と比べて、抑うつ症状が少ないと報告した。"
],
"p":"<Compared with the control group>, [S|participants (in the intervention group)] [V|reported] [O|fewer depressive symptoms].",
"a":1,
"e":"Compared with ...「〜と比べて」。意味上の主語は participants in the intervention group。a は「参加者が比較した」と読んでいて不正確。"
},
{
"q":", suggesting 以下が表す内容は？",
"o":[
"症状が減ったのは、初期のセッションが重要だと示唆されたからである。",
"最初の1か月の後に症状が減ったことは、初期のセッションが特に重要だったことを示唆している。",
"初期のセッションは、症状を減らすことを示唆するために特に重要だった。"
],
"p":"[S|Symptoms] [V|decreased] <after the first month>, <suggesting *that* [s|the early sessions] [v|were] [c|especially important]>.",
"a":1,
"e":"文末の分詞構文 , suggesting that ... は前の内容全体（症状が1か月後に減ったこと）を受けて「そのことは〜を示唆している」と訳す。"
}
]
},
{
"id":"g-toinf",
"grp":"修飾のかたまり",
"t":"不定詞（to do）：名詞を説明する／目的・結果を表す",
"lead":"名詞の後ろの to do は「〜する（ための）」、文中の to do は「〜するために」「〜して（その結果）」。どれかを文脈で決める。",
"exp":"不定詞には3つの働きがあります。① 名詞的用法（〜すること：→「動名詞・不定詞が主語・目的語になる」）、② 形容詞的用法（名詞を後ろから説明：**the capacity to tolerate frustration** 欲求不満に耐える力）、③ 副詞的用法（目的「〜するために」、結果「〜して（その結果）…」、原因「〜して」）。\n名詞＋to do は、名詞の中身を表すことが多い：**the need to be understood**（理解されたいという欲求）、**the wish to repair**（修復したいという願い）、**an attempt to make sense of**（〜を理解しようとする試み）。\n結果の不定詞：**only to find**（〜したが、結局…とわかっただけだった）、**never to return**（そして二度と戻らなかった）。",
"ex":[
{
"p":"[S|Every infant] [V|has] [O|a need (to be held <both physically *and* emotionally>)].",
"ja":"どの乳児にも、身体的にも情緒的にも抱えられる必要がある。",
"n":"to be held は need を説明する形容詞的用法（抱えられることへの欲求）。both A and B「A も B も」。"
},
{
"p":"[S|The analyst] [V|waited] <to see {*whether* the patient would return to the topic}>.",
"ja":"分析家は、患者がその話題に戻ってくるかどうかを見るために待った。",
"n":"to see は目的を表す副詞的用法。whether 以下は see の目的語。"
},
{
"p":"[S|She] [V|ended] [O|the relationship], <only to find herself repeating the same pattern (with her next partner)>.",
"ja":"彼女はその関係を終わらせたが、結局、次のパートナーとの間でも同じパターンを繰り返している自分に気づくことになった。",
"n":"only to do は結果の不定詞「〜したが、結局…しただけだった」。find oneself doing「気がつくと〜している」。"
}
],
"q":[
{
"q":"次の文の to understand の働きは？",
"o":[
"目的（〜を理解するために）",
"attempt の中身を説明する（〜を理解しようとする試み）",
"結果（理解した結果）"
],
"p":"[S|The patient's attempt (to understand her father's anger)] [V|led] [O|her] {to blame herself}.",
"a":1,
"e":"attempt to do「〜しようとする試み」で、to understand は attempt を説明する形容詞的用法。lead O to do「O が〜するように導く」。訳：「父親の怒りを理解しようとするうちに、患者は自分を責めるようになった。」"
},
{
"q":"次の文の訳として最も適切なものは？",
"o":[
"彼は何年かして治療に戻ってきたが、数回で再びやめてしまった。",
"彼は数回のセッションの後にやめるためだけに、何年かして治療に戻った。",
"彼は何年もたってから、数回のセッションだけのために治療に戻った。"
],
"p":"[S|He] [V|returned] <to treatment> <years later>, <only to leave again <after a few sessions>>.",
"a":0,
"e":"only to do は結果「〜したが、結局…」。目的「〜するためだけに」と読むと不自然になる。"
}
]
},
{
"id":"g-contrast",
"grp":"論理と比較",
"t":"対比・譲歩（while／whereas／although／despite）",
"lead":"while には「〜している間」と「〜だが／〜である一方」の2つの意味がある。学術書では後者が多い。",
"exp":"対比や譲歩の語は、筆者の主張がどちら側にあるかを示す道しるべです。**主張は多くの場合、譲歩の後（主節）にあります。**\n**although／though／even though**（〜だけれども）、**while／whereas**（〜である一方で）、**despite／in spite of＋名詞**（〜にもかかわらず）、**notwithstanding**（〜にもかかわらず：硬い）。\ndespite の後ろは名詞（句）です。節（主語＋動詞）が続くときは although を使います。despite **the fact that** S V という形もあります。",
"ex":[
{
"p":"<*While* [s|CBT] [v|focuses] <on present thoughts and behaviors>>, [S|psychodynamic therapy] [V|pays] [O|more attention] <to the past *and* to the therapeutic relationship>.",
"ja":"認知行動療法が現在の思考や行動に焦点を当てる一方で、精神力動的心理療法は過去や治療関係により多くの注意を払う。",
"n":"While は「〜の間」ではなく対比「〜である一方で」。pay attention to A「A に注意を払う」。"
},
{
"p":"<*Despite* the patient's apparent cooperation>, [S|the analyst] [V|sensed] [O|a deep reluctance (to change)].",
"ja":"患者は表面上は協力的に見えたが、分析家は変化することへの深いためらいを感じとっていた。",
"n":"Despite＋名詞句。apparent は「見かけの、表面上の」。名詞構文をほどいて「患者は協力的に見えたが」と訳すと自然。"
},
{
"p":"[S|Some studies] [V|have found] [O|large effects], <*whereas* [s|others] [v|have found] [o|none]>.",
"ja":"大きな効果を見いだした研究もある一方で、まったく効果を見いださなかった研究もある。",
"n":"some ... others ...「〜もあれば、…もある」。none ＝ no effects。"
}
],
"q":[
{
"q":"次の文で筆者の主張の中心はどこ？",
"o":[
"洞察には価値がある",
"洞察だけで変化が起こることはめったにない",
"洞察はまれにしか得られない"
],
"p":"<*Although* [s|insight] [v|is] [c|valuable]>, [S|it] [V|is] <rarely> [C|sufficient (for change) <on its own>].",
"a":1,
"e":"although の節は譲歩で、筆者の主張は主節にある。rarely「めったに〜ない」、on its own「それだけで」。訳：「洞察には価値があるが、それだけで変化に十分であることはめったにない。」"
},
{
"q":"空所に入るのは？ (　) her fear of rejection, she continued to attend the group.",
"o":[
"Although",
"Despite",
"Whereas"
],
"a":1,
"e":"後ろが名詞句（her fear of rejection）なので前置詞の Despite。Although・Whereas の後ろには主語＋動詞が必要。"
}
]
},
{
"id":"g-notbut",
"grp":"論理と比較",
"t":"not A but B／not so much A as B／rather than",
"lead":"「A ではなく B」の形は、筆者の主張（B）を示す最重要の目印。not so much A as B は「A というよりむしろ B」。",
"exp":"**not A but B**（A ではなく B）：主張は B。but の前後で同じ種類の語句（名詞と名詞、節と節）が対になります。\n**not so much A as B**（A というよりむしろ B）：A を完全に否定するのではなく、B のほうがより適切だという言い方。\n**B rather than A**（A よりむしろ B）、**not only A but (also) B**（A だけでなく B も）、**It is not that A, but that B**（A ということではなく、B ということだ）も同じ仲間です。",
"ex":[
{
"p":"[S|The goal (of analysis)] [V|is] [C|*not* {to eliminate conflict} *but* {to help the patient bear it}].",
"ja":"分析の目標は葛藤をなくすことではなく、患者がそれに耐えられるよう助けることである。",
"n":"not A but B で、A ＝ to eliminate conflict、B ＝ to help the patient bear it。help O do「O が〜するのを助ける」。bear「耐える」。"
},
{
"p":"[S|Her silence] [V|was] [C|*not so much* a refusal (to speak) *as* a way (of testing {*whether* she would be heard})].",
"ja":"彼女の沈黙は、話すことの拒否というよりも、むしろ自分の話が聞いてもらえるかどうかを試す一つのやり方だった。",
"n":"not so much A as B「A というよりむしろ B」。a way of doing「〜するやり方」。"
},
{
"p":"[S|Symptoms] [V|can be understood] <as communications> <*rather than* merely as problems (to be removed)>.",
"ja":"症状は、単に取り除くべき問題としてではなく、むしろ何かを伝えるものとして理解することができる。",
"n":"B rather than A「A よりむしろ B」。merely「単に」が入ると「単に A としてではなく」。problems to be removed「取り除かれるべき問題」。"
}
],
"q":[
{
"q":"筆者が最も言いたいことは？",
"o":[
"解釈そのものが癒やす",
"理解されるという体験が癒やす",
"解釈も体験も癒やさない"
],
"p":"[S|{*What* heals}] [V|is] [C|*not* the interpretation <itself> *but* the experience (of being understood)].",
"a":1,
"e":"not A but B で主張は B。What heals「癒やすもの」が主語。訳：「癒やすのは解釈そのものではなく、理解されるという体験である。」"
},
{
"q":"次の文の訳として最も適切なものは？",
"o":[
"患者は変わりたくないのではなく、変わることが危険なのだ。",
"患者が変わりたくないというわけではなく、変わることが危険に感じられるということなのだ。",
"患者が変わりたくないことが、変化を危険にしている。"
],
"p":"[S|It] [V|is] [C|*not that* [s|the patient] [v|does not want] [o|{to change}], *but that* [s|change] [v|feels] [c|dangerous]].",
"a":1,
"e":"It is not that A, but that B「A というわけではなく、B ということだ」。feel C「C に感じられる」なので「危険に感じられる」。a は feels を落とし、変化が実際に危険だと言い切ってしまっている。"
}
]
},
{
"id":"g-comp",
"grp":"論理と比較",
"t":"比較の構文（the 比較級, the 比較級／as ... as／比較の対象）",
"lead":"「the＋比較級 ..., the＋比較級 ...」は「〜すればするほど…」。比較では何と何を比べているかを必ず確認する。",
"exp":"**The more ..., the more ...**：「〜すればするほど、ますます…」。語順が倒置ぎみになるので、元の形に戻して考えます（The more anxious the patient becomes ＝ the patient becomes more anxious）。後半が主節です。\n**as ... as**（同じくらい〜）、**not as ... as**（〜ほど…ではない）、**more A than B**（B より A）。比較の対象が**省略**されたり、**that of／those of** で受けられたりします（→「省略と代用」）。\n**less A than B** は「A というよりむしろ B」の意味になることがあります（→「not A but B」）。",
"ex":[
{
"p":"<*The more* [s|the analyst] [v|insisted] <on the interpretation>>, *the more* [S|the patient] [V|resisted] [O|it].",
"ja":"分析家がその解釈に固執すればするほど、患者はますますそれに抵抗した。",
"n":"The＋比較級 ..., the＋比較級 ...。後半が主節。insist on A「A に固執する、A を強く主張する」。"
},
{
"p":"[S|Emotional neglect] [V|can be] [C|as harmful <as physical abuse>].",
"ja":"情緒的ネグレクトは、身体的虐待と同じくらい有害でありうる。",
"n":"as ... as「〜と同じくらい」。can は可能性「〜でありうる」。"
},
{
"p":"[S|The outcomes (of short-term therapy)] [V|were] [C|comparable (to those (of long-term therapy))] <in this sample>.",
"ja":"このサンプルでは、短期療法の転帰は長期療法の転帰に匹敵するものだった。",
"n":"those ＝ the outcomes。比較の対象をそろえるために those of が使われる。comparable to「〜に匹敵する、〜と同等の」。"
}
],
"q":[
{
"q":"次の文の訳として最も適切なものは？",
"o":[
"トラウマが早く起きたので、自己の発達に影響する傾向が強まる。",
"トラウマが早い時期に起こるほど、自己の発達に影響を及ぼしやすくなる。",
"より早いトラウマとより多い影響が、自己の発達をもたらす。"
],
"p":"<*The earlier* [s|the trauma] [v|occurs]>, *the more* [S|it] [V|tends to affect] [O|the development (of the self)].",
"a":1,
"e":"The 比較級 ..., the 比較級 ... は「〜するほど、ますます…」。tend to do「〜する傾向がある」。"
},
{
"q":"those が指すものは？",
"o":[
"children",
"the symptoms of depression（うつ病の症状）",
"adults"
],
"p":"[S|The symptoms (of depression) (in children)] [V|are often expressed] <differently <from those (of adults)>>.",
"a":1,
"e":"those ＝ the symptoms of depression。比較の対象（子どもの症状と大人の症状）をそろえるための代名詞。訳：「子どものうつ病の症状は、大人のうつ病の症状とは異なる形で表れることが多い。」"
}
]
},
{
"id":"g-cause",
"grp":"論理と比較",
"t":"因果の表現（lead to／result in／result from）",
"lead":"result in と result from は向きが逆。「原因→結果」の向きを矢印で確かめてから訳す。",
"exp":"因果の表現は向きが大切です。**A lead(s) to B／A result(s) in B／A give(s) rise to B／A contribute(s) to B**：A（原因）→ B（結果）。**B result(s) from A／B stem(s) from A／B arise(s) from A／B is attributed to A**：B（結果）← A（原因）。\n前置詞句では **because of／due to／owing to**（〜のために）、**as a result of／as a consequence of**（〜の結果として）。\ncontribute to は「〜の一因となる」で、単独の原因ではないことを含みます。学術書では断定を避けるためによく使われます。",
"ex":[
{
"p":"[S|Chronic stress] [V|can lead] <to changes (in immune function)>.",
"ja":"慢性的なストレスは、免疫機能の変化につながることがある。",
"n":"lead to「〜につながる、〜をもたらす」（原因→結果）。"
},
{
"p":"[S|Much (of the patient's anxiety)] [V|seemed to stem] <from a fear (of being abandoned)>.",
"ja":"患者の不安の多くは、見捨てられることへの恐れから生じているように思われた。",
"n":"stem from「〜から生じる」（結果←原因）。seem to do「〜するように思われる」。"
},
{
"p":"[S|Repeated ruptures (in the alliance)], <if not repaired>, [V|may result] <in dropout>.",
"ja":"治療同盟の亀裂が繰り返されると、それが修復されない場合には、治療の中断に至ることがある。",
"n":"result in「〜という結果になる」（原因→結果）。if not repaired ＝ if they are not repaired（主語と be 動詞の省略）。dropout「（治療の）中断、脱落」。"
}
],
"q":[
{
"q":"原因と結果の関係を正しく訳したものは？",
"o":[
"患者の不信が、裏切りの体験を繰り返させた。",
"裏切られる体験が繰り返されたことで、患者は不信を抱くようになった。",
"患者の不信と裏切りの体験は無関係である。"
],
"p":"[S|The patient's mistrust] [V|resulted] <from repeated experiences (of betrayal)>.",
"a":1,
"e":"B result from A は「B は A から生じる」。原因は repeated experiences of betrayal、結果は mistrust。"
},
{
"q":"空所に入る語は？ Low self-esteem may (　) to the development of depression.",
"o":[
"result",
"contribute",
"stem"
],
"a":1,
"e":"contribute to「〜の一因となる」。result は result in／result from、stem は stem from の形で使う。訳：「低い自尊感情は、うつ病の発症の一因となりうる。」"
}
]
},
{
"id":"g-cond",
"grp":"論理と比較",
"t":"条件・仮定（if／unless／provided that／仮定法）",
"lead":"unless は「〜でない限り」、provided that は「〜という条件で」。仮定法は「事実とは違う想定」を表す。",
"exp":"条件の表現：**if**（もし〜なら）、**unless**（〜でない限り＝if ... not）、**provided (that)／as long as**（〜という条件で、〜である限り）、**only if**（〜の場合に限り）。\n**仮定法**は、事実と異なる想定を表します。過去形（were）で「今」、過去完了（had done）で「過去」の事実に反する想定です。学術書では **if it were not for**（もし〜がなければ）や、if を省いた倒置 **were it not for** が出ます。\n主語そのものに仮定の意味が含まれることもあります：A mother who adapted perfectly **would** ...（もし完璧に合わせる母親がいたら、その母親は〜だろう）。",
"ex":[
{
"p":"<*Unless* [s|the underlying conflict] [v|is addressed]>, [S|the symptom] [V|is likely to return] <in another form>.",
"ja":"根底にある葛藤が扱われない限り、症状は別の形で再び現れる可能性が高い。",
"n":"unless ＝ if ... not。address「（問題に）取り組む」の受動態。is likely to do「〜する可能性が高い」。"
},
{
"p":"<*If* [s|the analyst] [v|had interpreted] [o|the dream] <at that point>>, [S|the patient] [V|might have felt] [C|exposed].",
"ja":"もし分析家がその時点で夢を解釈していたら、患者は無防備にさらけ出されたように感じたかもしれない。",
"n":"過去完了＋might have done で「（実際にはしなかったが）もし〜していたら…したかもしれない」。過去の事実に反する仮定。"
},
{
"p":"<*Were it not for* the support (of her sister)>, [S|she] [V|might not have survived] [O|that period].",
"ja":"もし姉妹の支えがなかったら、彼女はその時期を乗り切れなかったかもしれない。",
"n":"Were it not for ＝ If it were not for「もし〜がなければ」の倒置。主節が might not have survived（過去）なので、ここでは「もし〜がなかったら」と過去の意味。survive「（困難を）乗り切る」。"
}
],
"q":[
{
"q":"次の文の訳として最も適切なものは？",
"o":[
"誰かの生命に重大な危険があるときは、守秘義務は必ず破られる。",
"守秘義務が破られてよいのは、誰かの生命に重大な危険がある場合に限られる。",
"誰かの生命の危険が重大なのは、守秘義務が破られたときだけである。"
],
"p":"[S|Confidentiality] [V|may be broken] <*only if* there is a serious risk (to someone's life)>.",
"a":1,
"e":"only if「〜の場合に限り」。may は許可「〜してもよい」。a は「必ず破られる」として may の意味を取り違えている。"
},
{
"q":"次の文の意味は？ Provided that the frame is respected, the patient can explore frightening feelings.",
"o":[
"枠が尊重されたので、患者は恐ろしい感情を探索できた。",
"枠が尊重されている限り、患者は恐ろしい感情を探索することができる。",
"患者が恐ろしい感情を探索すれば、枠は尊重される。"
],
"a":1,
"e":"provided (that)「〜という条件で、〜である限り」。過去の出来事ではなく条件を述べている。"
}
]
},
{
"id":"g-insofar",
"grp":"論理と比較",
"t":"範囲を限る表現（insofar as／to the extent that／in that）",
"lead":"「〜する限りにおいて」「〜という点で」と主張の範囲を限定する表現。学術書では主張の正確さを保つために多用される。",
"exp":"**insofar as／in so far as**：「〜する限りにおいて」。**to the extent that**：「〜する程度まで、〜する限りで」。**in that**：「〜という点で」（理由・観点）。\nこれらは「全面的にそうだ」とは言わずに、**どの範囲でそう言えるか**を限定します。訳でこの限定を落とすと、筆者の主張を誇張してしまいます。\n**to some extent**（ある程度）、**to a large extent**（大部分は）、**in a sense**（ある意味で）、**strictly speaking**（厳密に言えば）も同じ働きの語句です。",
"ex":[
{
"p":"[S|The analyst's feelings] [V|are] [C|useful] <*insofar as* [s|they] [v|are reflected upon] <*rather than* acted on>>.",
"ja":"分析家の感情が役に立つのは、それに基づいて行動するのではなく、それについて考えをめぐらせる限りにおいてである。",
"n":"insofar as「〜する限りにおいて」。reflect upon「〜について熟考する」、act on「〜に基づいて行動する」の受動態。「役に立つのは〜限りにおいてである」と、限定の部分を後ろにまわして訳すと明確になる。"
},
{
"p":"[S|Play] [V|is] [C|therapeutic] <*in that* [s|it] [v|allows] [o|children] {to master experiences (*that* overwhelmed them)}>.",
"ja":"遊びは、子どもたちが自分を圧倒した体験を乗りこなせるようにするという点で、治療的である。",
"n":"in that「〜という点で」。allow O to do「O が〜できるようにする」。master「（体験を）こなす、制御する」。"
},
{
"p":"<*To the extent that* [s|this account] [v|is] [c|accurate]>, [S|it] [V|challenges] [O|traditional views (of neutrality)].",
"ja":"この説明が正確である限りにおいて、それは中立性についての従来の見方に異議を唱えるものである。",
"n":"To the extent that「〜である限りにおいて、〜である程度において」。challenge「異議を唱える、疑問を投げかける」。"
}
],
"q":[
{
"q":"次の文の訳として最も適切なものは？",
"o":[
"2つのアプローチは、一方が洞察を、他方がスキルの習得を重視するので、その中で異なる。",
"2つのアプローチは、一方が洞察を重視し、他方がスキルの習得を重視するという点で異なる。",
"2つのアプローチの中で、洞察とスキルの習得は異なる。"
],
"p":"[S|The two approaches] [V|differ] <*in that* [s|one] [v|emphasizes] [o|insight] *while* [s|the other] [v|emphasizes] [o|skill acquisition]>.",
"a":1,
"e":"in that「〜という点で」。one ... the other ...「（2つのうち）一方は…、他方は…」。while は対比。"
},
{
"q":"insofar as の意味は？",
"o":[
"〜するとすぐに",
"〜する限りにおいて",
"〜するにもかかわらず"
],
"a":1,
"e":"insofar as は範囲を限定して「〜する限りにおいて」。"
}
]
},
{
"id":"g-inversion",
"grp":"専門書の難所",
"t":"倒置（Only ... ／Not until ... ／補語や場所が文頭に出る形）",
"lead":"否定語や only が文頭に出ると、後ろが疑問文の語順（助動詞＋主語＋動詞）になる。強調されているのは文頭の部分。",
"exp":"否定の語句（not, never, rarely, little, nor, not until など）や **only＋副詞句** が文頭に来ると、主節が**疑問文と同じ語順（do／does／did／can／have＋主語＋動詞）**になります。これを倒置といいます。\n訳すときは、いったん普通の語順に戻して意味をとり、文頭の部分を強調して訳します。**Only later did she realize ...**（後になって初めて彼女は気づいた）。\nほかに、**補語が文頭に出る倒置**（Central to this view is the idea that ...：この見方の中心にあるのは〜という考えである）、**場所の副詞句による倒置**（Behind this anger lies a fear of ...：この怒りの背後には〜への恐れがある）も専門書で頻出です。",
"ex":[
{
"p":"<*Only* after many months> *did* [S|the patient] [V|begin to speak] <about her father's death>.",
"ja":"何か月もたってから、ようやく患者は父親の死について話し始めた。",
"n":"Only＋副詞句が文頭なので、did the patient begin という疑問文の語順。普通の語順に戻すと The patient began to speak ... only after many months。「〜してようやく」と訳す。"
},
{
"p":"[C|Central (to Klein's theory)] [V|is] [S|the notion (of unconscious phantasy)].",
"ja":"クラインの理論の中心にあるのは、無意識的空想という考えである。",
"n":"補語（Central to Klein's theory）が文頭に出て、主語（the notion of unconscious phantasy）が後ろに回った倒置。phantasy は無意識的な空想を表すクライン派の綴り。"
},
{
"p":"<*Not until* the end (of the analysis)> *did* [S|he] [V|recognize] [O|{*how much* he had depended on his mother}].",
"ja":"分析の終わりになって初めて、彼は自分がどれほど母親に依存していたかに気づいた。",
"n":"Not until A did S V「A になって初めて S は V した」。how much 以下は recognize の目的語（名詞節）。"
}
],
"q":[
{
"q":"次の文の主語は？",
"o":[
"Behind",
"the patient's compliance",
"a deep fear of disapproval"
],
"p":"<Behind the patient's compliance> [V|lay] [S|a deep fear (of disapproval)].",
"a":2,
"e":"場所の副詞句（Behind ...）が文頭に出て、動詞 lay（lie「ある」の過去形）の後ろに主語が回った倒置。訳：「患者が従順であることの背後には、非難されることへの深い恐れがあった。」"
},
{
"q":"次の文の訳として最も適切なものは？",
"o":[
"まれに、一つの解釈が永続的な変化を生み出すことがある。",
"一つの解釈が永続的な変化をもたらすことは、めったにない。",
"一つの解釈は、まれな永続的変化を生み出す。"
],
"p":"<*Rarely*> *does* [S|a single interpretation] [V|produce] [O|lasting change].",
"a":1,
"e":"Rarely（めったに〜ない）が文頭に出た倒置。否定の意味なので「まれに〜することがある」と肯定に訳すのは誤り。"
}
]
},
{
"id":"g-insertion",
"grp":"専門書の難所",
"t":"挿入（ダッシュ・カンマ・括弧）",
"lead":"ダッシュ（—）やカンマで挟まれた部分は、いったん外して文の骨組みをとり、後から戻して訳す。",
"exp":"専門書では、文の途中に補足・言い換え・留保が挿入されます。まず**挿入部分を指で隠して**、残りで主語と動詞をとります。\n挿入の目印：**— ... —**（ダッシュ）、**, ... ,**（カンマ）、**( ... )**（括弧）。中身は、言い換え（that is, or rather）、具体例（for example）、留保（I think, it seems, at least）などです。\n訳すときは、挿入部分を（ ）で残すか、文の前後に回して自然な日本語にします。",
"ex":[
{
"p":"[S|The analyst's own anxiety]—*or rather*, (her difficulty (in tolerating not knowing))—[V|led] [O|her] {to interpret too quickly}.",
"ja":"分析家自身の不安が、いや正確に言えば、分からないままでいることに耐えられないという彼女の困難が、性急な解釈へと彼女を駆り立てた。",
"n":"or rather「いや、むしろ」と言い直す挿入。挿入を外すと The analyst's own anxiety led her to interpret too quickly. lead O to do「O を〜するように導く」。"
},
{
"p":"[S|Such moments], [M|it seems], [V|are] [C|crucial] <for therapeutic change>.",
"ja":"そのような瞬間こそが、治療的な変化にとって決定的に重要であるように思われる。",
"n":"it seems は留保の挿入「〜のように思われる」。外すと Such moments are crucial for therapeutic change."
},
{
"p":"[S|Freud's early model], (*which* [v|located] [o|the cause (of hysteria)] <in actual childhood seduction>), [V|was later revised].",
"ja":"ヒステリーの原因を幼児期に実際に起きた誘惑に求めたフロイトの初期のモデルは、のちに修正された。",
"n":", which ... , の挿入を外すと Freud's early model was later revised. いわゆる「誘惑理論」の放棄のこと。seduction は、ここでは子どもへの性的な誘惑（性的虐待）を指す。"
}
],
"q":[
{
"q":"挿入部分を外したとき、文の骨組みは？",
"o":[
"This view was widely held.",
"This view was rarely questioned.",
"Clinicians were rarely questioned."
],
"p":"[S|This view]—(widely held <among clinicians> <at the time>)—[V|was] <rarely> [C|questioned].",
"a":1,
"e":"ダッシュの間の widely held among clinicians at the time は This view の補足（当時臨床家の間で広く支持されていた）。骨組みは This view was rarely questioned.（この見方はめったに疑問視されなかった）。"
},
{
"q":"次の文の訳として最も適切なものは？",
"o":[
"例えば患者は、隠し部屋のある家を夢で見ることを好んだ。",
"例えば、患者の夢には、隠された部屋のある家がしばしば登場した。",
"患者の夢は、例えば隠し部屋のような家を特徴づけた。"
],
"p":"[S|The patient's dreams], [M|for example], [V|often featured] [O|houses (with hidden rooms)].",
"a":1,
"e":"for example は挿入。feature は動詞で「〜を登場させる、〜を特色とする」。主語が dreams なので「夢に〜がしばしば登場した」と訳すと自然。"
}
]
},
{
"id":"g-ellipsis",
"grp":"専門書の難所",
"t":"省略と代用（that of／do so／the former, the latter）",
"lead":"同じ語の繰り返しを避けるために、that／those／one／do so／the former／the latter が使われる。何の代わりかを必ず特定する。",
"exp":"**that of／those of**：前に出た名詞の繰り返しを避ける（単数は that、複数は those）。\n**one／ones**：「同じ種類のもの」（a better one ＝ a better＋前の名詞）。\n**do so**：前に出た「動詞＋目的語など」の代わり。**the former／the latter**：「前者／後者」。\n比較の後や and／but の後では、**主語＋動詞が省略**されることがあります（Some patients improve quickly; others, more slowly. ＝ others improve more slowly）。",
"ex":[
{
"p":"[S|The infant's experience (of time)] [V|differs] <greatly> <from that (of the adult)>.",
"ja":"乳児の時間の体験は、大人の時間の体験とは大きく異なる。",
"n":"that ＝ the experience of time。比較の対象をそろえるための代名詞。"
},
{
"p":"[S|Klein and Anna Freud] [V|disagreed] <about child analysis>: [S|the former] [V|interpreted] [O|unconscious phantasies] <from the start>, <*whereas* [s|the latter] [v|emphasized] [o|an introductory phase]>.",
"ja":"クラインとアンナ・フロイトは子どもの分析をめぐって意見が対立した。前者（クライン）は最初から無意識的空想を解釈したのに対し、後者（アンナ・フロイト）は導入の段階を重視した。",
"n":"the former ＝ Klein（前に出た方）、the latter ＝ Anna Freud（後に出た方）。"
},
{
"p":"[S|Some patients] [V|can tolerate] [O|interpretations (of their aggression)] <early in treatment>; [S|others] [V|cannot].",
"ja":"治療の早い段階で自分の攻撃性についての解釈に耐えられる患者もいれば、耐えられない患者もいる。",
"n":"cannot の後ろに tolerate interpretations of their aggression early in treatment が省略されている。some ... others ...「〜もいれば…もいる」。"
}
],
"q":[
{
"q":"do so が指す内容は？",
"o":[
"尋ねられること",
"夢を詳しく述べること",
"拒否すること"
],
"p":"[S|The patient] [V|was asked] {to describe the dream <in detail>}, *but* [S|she] [V|refused] {to do so}.",
"a":1,
"e":"do so ＝ describe the dream in detail。訳：「患者は夢を詳しく述べるよう求められたが、そうすることを拒んだ。」"
},
{
"q":"those が指すものは？",
"o":[
"the present study",
"the results",
"earlier research"
],
"p":"[S|The results (of the present study)] [V|are] [C|consistent] <with those (of earlier research)>.",
"a":1,
"e":"those ＝ the results。訳：「本研究の結果は、先行研究の結果と一致している。」be consistent with「〜と一致している」。"
}
]
},
{
"id":"g-pronoun",
"grp":"専門書の難所",
"t":"指示語（it／this／such）が指すもの",
"lead":"this・it・such は前の名詞だけでなく、前の文の内容全体を指すことが多い。訳す前に必ず中身を確定する。",
"exp":"専門書の this／that／it／such／these は、**直前の名詞**だけでなく、**前の文の内容全体**、ときには**数文前の議論**を指します。\n**this＋名詞**（this process, this view, this tendency）は、前の内容を一語でまとめ直す言い方です。何をまとめているかを言えるようにしておくと、論の流れが追えます。\n**such＋名詞**（such moments, such a view）は「そのような〜」。前に述べた性質をもつもの全体を指します。",
"ex":[
{
"p":"[S|The patient] [V|arrived] <late> *and* [V|spent] [O|the whole session] {talking about other people's lateness}. [S|This] [V|was] [C|a familiar pattern].",
"ja":"患者は遅れて来て、セッションの間ずっと他人の遅刻について話した。これはおなじみのパターンだった。",
"n":"This は前の文全体（遅れて来て、他人の遅刻について話し続けたこと）を指す。spend O doing「〜して O（時間）を過ごす」。"
},
{
"p":"[S|Freud] [V|first regarded] [O|transference] <as an obstacle>. [S|He] [V|later came to see] [O|it] <as the central vehicle (of treatment)>.",
"ja":"フロイトははじめ転移を障害とみなしていた。のちに彼は、転移を治療の中心的な手段とみなすようになった。",
"n":"it ＝ transference。come to do「〜するようになる」。see A as B「A を B とみなす」。"
},
{
"p":"[S|Such shifts (in perspective)] [V|are] [C|common] <in the history (of psychoanalysis)>.",
"ja":"このような視点の転換は、精神分析の歴史ではよくあることだ。",
"n":"Such shifts は、前の例（フロイトが転移の見方を変えたことなど）を受けてまとめている。"
}
],
"q":[
{
"q":"2文目の this が指す内容は？",
"o":[
"母親",
"短い分離",
"短い分離の後に、乳児が母親から顔をそむけること"
],
"p":"[S|Some infants] [V|turn away] <from their mothers> <after a brief separation>. [S|Ainsworth] [V|interpreted] [O|this] <as a sign (of avoidant attachment)>.",
"a":2,
"e":"this は前の文の内容全体を指す。エインズワースはストレンジ・シチュエーション法で、再会時に養育者を避ける行動を回避型の愛着の特徴とした。"
},
{
"q":"次の文の Such a view が指すものは？",
"o":[
"心を閉じたシステムとみなす見方",
"関係の影響を重視する見方",
"理論家という見方"
],
"p":"[S|Some theorists] [V|regard] [O|the mind] <as a closed system>. [S|Such a view] [V|cannot account] <for the influence (of relationships)>.",
"a":0,
"e":"Such a view は前の文の内容（心を閉じたシステムとみなすこと）を受ける。account for「〜を説明する」。訳：「そのような見方では、関係の影響を説明できない。」"
}
]
},
{
"id":"g-hedge",
"grp":"専門書の難所",
"t":"ヘッジ（断定を避ける表現）を訳し落とさない",
"lead":"may, might, appear to, suggest, arguably, tend to などは、筆者がどの程度確信しているかを示す。訳で落とすと主張が強くなりすぎる。",
"exp":"学術書・論文は、証拠に見合った強さでしか主張しません。そのための表現を**ヘッジ**といいます。\n主なもの：**助動詞**（may, might, could：〜かもしれない）、**動詞**（suggest, appear to, seem to, tend to, indicate）、**副詞**（possibly, perhaps, arguably, likely, presumably, largely）、**形容詞**（possible, likely, consistent with）。\n訳のルール：ヘッジの強さを保つこと。「may＝〜かもしれない／〜ことがある」「suggest＝示唆する」「appear to＝〜のように見える」。**suggest を「証明する」と訳したり、may を落としたりしない**ことです。",
"ex":[
{
"p":"[S|These results] [V|may reflect] [O|cultural differences (in the expression (of distress))] <*rather than* differences (in its prevalence)>.",
"ja":"これらの結果は、苦悩がどのくらい広くみられるかの違いではなく、苦悩の表し方の文化的な違いを反映しているのかもしれない。",
"n":"may reflect「反映しているのかもしれない」。rather than 以下は否定される側の解釈。its ＝ distress's。"
},
{
"p":"[S|Patients (with this pattern)] [V|appear to benefit] <more> <from longer treatment>.",
"ja":"このパターンをもつ患者は、より長期の治療からより多くの利益を得るように見える。",
"n":"appear to do「〜するように見える」。証拠は示唆的だが決定的ではない、という筆者の態度を表す。"
},
{
"p":"[S|This] [V|is], [M|arguably], [C|the most important contribution (of attachment theory)].",
"ja":"これは、異論はありうるとしても、愛着理論の最も重要な貢献だと言えるだろう。",
"n":"arguably「議論の余地はあるが〜と言える、おそらく」。筆者の評価であることを示す。"
}
],
"q":[
{
"q":"次の文の訳として最も適切なものは？",
"o":[
"早期介入は、よりよい結果を生み出す。",
"早期の介入は、よりよい結果をもたらす傾向がある。",
"早期介入は、よりよい結果を生み出そうとする。"
],
"p":"[S|Early intervention] [V|tends to produce] [O|better outcomes].",
"a":1,
"e":"tend to do「〜する傾向がある」というヘッジを落とすと、a のように断定になってしまう。c は tend を try と取り違えている。"
},
{
"q":"論文の結果について述べた次の文の訳として、最も適切なものは？",
"o":[
"データは、効果が控えめであることを証明している。",
"データは、効果が控えめであることを提案している。",
"データは、効果は大きくないことを示唆している。"
],
"p":"[S|The data] [V|suggest] [O|*that* [s|the effect] [v|is] [c|modest]].",
"a":2,
"e":"研究結果について suggest は「示唆する」。「証明する」は強すぎ、「提案する」は人が主語のときの意味。modest は「控えめな、それほど大きくない」。data は本来複数形なので動詞は suggest（三単現の s がつかない）。"
}
]
},
{
"id":"g-modal",
"grp":"専門書の難所",
"t":"助動詞＋完了形（must have done／may have done／could have done）",
"lead":"助動詞＋have＋過去分詞は「過去についての推量」を表す。must have done は「〜したに違いない」、could have done は「〜できたのに（しなかった）」も。",
"exp":"**must have done**：〜したに違いない（過去についての強い推量）。**may／might have done**：〜したかもしれない。**cannot have done**：〜したはずがない。**should have done**：〜すべきだったのに（しなかった）。**could have done**：〜できたかもしれない／〜できたのに。**would have done**：（もし…なら）〜しただろう。\n事例の記述や考察で、過去の出来事の意味を推し量るときによく使われます。",
"ex":[
{
"p":"[S|The child] [V|must have experienced] [O|the separation] <as a catastrophe>.",
"ja":"その子どもは、分離を破局的な出来事として体験したに違いない。",
"n":"must have done「〜したに違いない」。experience A as B「A を B として体験する」。"
},
{
"p":"[S|The analyst] [V|might have missed] [O|the patient's anger] <*because* she was preoccupied with her own concerns>.",
"ja":"分析家は、自分自身の気がかりにとらわれていたために、患者の怒りを見逃していたのかもしれない。",
"n":"might have done「〜したのかもしれない」。be preoccupied with「〜で頭がいっぱいである」。"
},
{
"p":"[S|An earlier referral] [V|could have prevented] [O|the crisis].",
"ja":"もっと早く紹介していれば、その危機は防げたかもしれない。",
"n":"無生物主語＋could have done。主語に「もし〜なら」の意味が含まれる（仮定法）。"
}
],
"q":[
{
"q":"次の文の訳として最も適切なものは？",
"o":[
"彼女はその解釈を理解できなかった。",
"彼女がその解釈を理解したはずがない。",
"彼女はその解釈を理解すべきではなかった。"
],
"p":"[S|She] [V|cannot have understood] [O|the interpretation].",
"a":1,
"e":"cannot have done「〜したはずがない」（過去についての強い否定的推量）。"
},
{
"q":"should have done の意味は？",
"o":[
"〜したに違いない",
"〜すべきだったのに（実際にはしなかった）",
"〜したかもしれない"
],
"a":1,
"e":"should have done は「〜すべきだったのに」。過去の行為への後悔や批判を表す。"
}
]
},
{
"id":"g-cleft",
"grp":"専門書の難所",
"t":"強調構文 It is ... that ...",
"lead":"It is X that ... で X を強調する形。「…なのは X だ」と訳す。形式主語の It との見分けが大切。",
"exp":"強調構文は **It is／was＋（強調したい語句）＋that（who／which）...** の形で、「…するのは X だ」と訳します。\n見分け方：**It is と that を取り去っても完全な文が残る**なら強調構文です（It was the silence that frightened her. → The silence frightened her.）。形式主語の場合は、It is の後ろが形容詞や名詞の補語で、that 節の中が完全な文です（It is clear that ...）。\n**It is not A but B that ...**（…なのは A ではなく B だ）、**It is only when ... that ...**（〜して初めて…）も頻出です。",
"ex":[
{
"p":"*It is* {*not* the content (of the interpretation) *but* its timing} *that* matters <most>.",
"ja":"最も重要なのは、解釈の内容ではなく、そのタイミングである。",
"n":"It is と that を外すと Not the content of the interpretation but its timing matters most. と完全な文になるので強調構文。not A but B が強調されている。"
},
{
"p":"*It was* {*only* in the second year (of treatment)} *that* [s|the patient] [v|mentioned] [o|her sister].",
"ja":"患者が姉妹のことを口にしたのは、治療の2年目になってからのことだった。",
"n":"It was only ... that ...「〜になって初めて…した」。強調されているのは時を表す only in the second year of treatment。"
},
{
"p":"*It is* {through the relationship (with the analyst)} *that* [s|old patterns] [v|become] [c|visible].",
"ja":"古いパターンが目に見えるようになるのは、分析家との関係を通してである。",
"n":"強調されているのは through the relationship with the analyst（副詞句）。副詞句が強調されていることからも、形式主語ではなく強調構文だとわかる。"
}
],
"q":[
{
"q":"強調構文はどれ？",
"o":[
"It is likely that the patient will return.",
"It was the patient's mother who first noticed the change.",
"It is difficult to say what caused the symptoms."
],
"a":1,
"e":"b は It was と who を外すと The patient's mother first noticed the change. と完全な文が残る強調構文。「最初に変化に気づいたのは、患者の母親だった」。a・c は形式主語。"
},
{
"q":"次の文の訳として最も適切なものは？",
"o":[
"患者が安心を感じるのは、探索が可能になったときだけである。",
"患者が安心を感じられて初めて、探索が可能になる。",
"患者は探索が可能なときにだけ、安心を感じる。"
],
"p":"*It is* {*only when* the patient feels safe} *that* [s|exploration] [v|becomes] [c|possible].",
"a":1,
"e":"It is only when A that B「A して初めて B」。a・c は条件と結果の関係が逆になっている。"
}
]
},
{
"id":"g-as",
"grp":"専門書の難所",
"t":"as の見分け方",
"lead":"as は「〜として」「〜のように」「〜なので」「〜につれて」「〜するとき」など多義。後ろが名詞か節かで絞り込む。",
"exp":"**as＋名詞**：「〜として」（regard A as B、as a child「子どもの頃」）。\n**as＋主語＋動詞**：「〜のように（様態）」「〜なので（理由）」「〜につれて（比例）」「〜するとき（時）」。どれかは文脈で決めます。比例は change, grow, increase など変化の動詞が目印です。\n熟語：**as such**（それ自体として、そういうものとして）、**such as**（例えば〜のような）、**as if／as though**（まるで〜かのように）、**as well as**（〜だけでなく…も）、**as to**（〜について）。",
"ex":[
{
"p":"[S|Freud] [V|regarded] [O|anxiety] <as a signal (of danger)> <in his later theory>.",
"ja":"フロイトはのちの理論で、不安を危険の信号とみなした。",
"n":"regard A as B「A を B とみなす」。1926年の『制止、症状、不安』で示された、いわゆる信号不安の考え方。"
},
{
"p":"<*As* [s|the patient] [v|grew] [c|more trusting]>, [S|her dreams] [V|became] [C|less frightening].",
"ja":"患者が信頼を深めていくにつれて、彼女の夢は恐ろしいものではなくなっていった。",
"n":"grow、become などの変化を表す語と一緒の as は「〜につれて」。grow C「C になっていく」。"
},
{
"p":"[S|The patient] [V|spoke] <*as if* [s|she] [v|were describing] [o|someone else's life]>.",
"ja":"患者は、まるで他人の人生を語っているかのように話した。",
"n":"as if＋仮定法（were）「まるで〜かのように」。自分の体験から距離をとって語る様子で、解離的な語り方を示すこともある。"
}
],
"q":[
{
"q":"次の文の as の意味は？",
"o":[
"〜につれて",
"〜なので（理由）",
"〜として"
],
"p":"<*As* [s|the frame] [v|was] [c|unclear]>, [S|the patient] [V|felt] [C|uneasy].",
"a":1,
"e":"as＋節で、文脈から理由。訳：「枠が不明確だったので、患者は落ち着かなかった。」"
},
{
"q":"次の文の as such の意味は？",
"o":[
"そのように",
"それ自体（としては）",
"例えば"
],
"p":"[S|Resistance] [V|is] <not> [C|a problem] <as such>; [S|it] [V|is] [C|part (of the work)].",
"a":1,
"e":"as such「それ自体としては」。訳：「抵抗はそれ自体として問題なのではなく、（分析の）作業の一部である。」"
}
]
},
{
"id":"g-tense",
"grp":"論文を読む",
"t":"論文の時制：現在形・過去形・現在完了の使い分け",
"lead":"論文では、手続きと結果は過去形、一般的な事実や著者の解釈は現在形、研究の蓄積は現在完了で書かれることが多い。",
"exp":"論文の時制には習慣があります。\n**過去形**：この研究で行ったこと（Participants **completed** a questionnaire.）と、その結果（Scores **decreased**.）。\n**現在形**：一般に成り立つことや、表・図の説明（Table 2 **shows** ...）、考察での解釈（These findings **suggest** ...）、理論家の主張の紹介（Winnicott **argues** that ...：本に書かれていることは「今も述べている」ものとして扱う）。\n**現在完了**：これまでの研究の蓄積（Several studies **have examined** ...）。\n訳では、過去形を「〜した」、現在完了を「〜されてきた」とすると、時間の流れが伝わります。",
"ex":[
{
"p":"[S|Previous studies] [V|have linked] [O|insecure attachment] <to later difficulties (in emotion regulation)>.",
"ja":"先行研究では、不安定な愛着が後の情動調整の困難と関連づけられてきた。",
"n":"have linked は研究の蓄積を示す現在完了。link A to B「A を B と関連づける」。"
},
{
"p":"[S|Participants] [V|completed] [O|the questionnaire] <twice>, <six months apart>.",
"ja":"参加者は質問紙に、6か月の間隔をあけて2回回答した。",
"n":"手続きは過去形。six months apart「6か月離れて」。complete a questionnaire「質問紙に回答する」。"
},
{
"p":"<In this paper>, [S|Ogden] [V|describes] [O|the analytic third] <as a subjectivity (created <jointly> <by analyst and patient>)>.",
"ja":"この論文でオグデンは、分析的第三者を、分析家と患者によって共同で生み出される主観性として描いている。",
"n":"理論家の主張の紹介は現在形（describes）。過去の論文でも「今も述べている」ものとして扱う。"
}
],
"q":[
{
"q":"論文の「方法」の部分によく使われる時制は？",
"o":[
"現在形",
"過去形",
"未来形"
],
"a":1,
"e":"方法と結果は、その研究で実際に行ったこと・得られたことなので過去形で書かれるのが一般的。"
},
{
"q":"次の文の訳として最も適切なものは？",
"o":[
"いくつかの研究が、境界性パーソナリティ障害におけるメンタライゼーションの役割を検討するだろう。",
"境界性パーソナリティ障害におけるメンタライゼーションの役割は、いくつかの研究で検討されてきた。",
"いくつかの研究は、メンタライゼーションが境界性パーソナリティ障害の原因だと証明した。"
],
"p":"[S|Several studies] [V|have examined] [O|the role (of mentalization) (in borderline personality disorder)].",
"a":1,
"e":"have examined は研究の蓄積を示す現在完了。日本語では受け身にして「〜されてきた」とすると自然。c は examine（検討する）を「証明した」と強めすぎている。"
}
]
},
{
"id":"g-cite",
"grp":"論文を読む",
"t":"引用・参照の書き方（et al.／cf.／[sic]／引用年）",
"lead":"Smith et al. (2020) や (Freud, 1915/1957) のような引用の書き方を読めると、誰の主張なのかを取り違えずに済む。",
"exp":"**著者名（年）**：Bowlby (1969) argued ... ＝「ボウルビィ（1969）は〜と論じた」。括弧の中に入れる形（..., (Bowlby, 1969)）は、その文の根拠となる文献を示します。\n**et al.**：「〜ら」（3人以上の共著）。**cf.**：「〜を参照」（比較のために参照）。**e.g.**：「例えば」。**i.e.**：「すなわち」。**ibid.**：「同書」。**[sic]**：「原文のまま」（引用元の誤りをそのまま示す）。**emphasis added**：「強調は引用者」。\n**1915/1957** のような年の表記は、原著の発表年と、使用した版（英訳など）の年を示します。フロイトの英訳全集（Standard Edition）からの引用によく見られます。\n誰の主張かを示す動詞にも注意します：**argue／claim／contend**（主張する）、**note／observe／point out**（指摘する）、**suggest／propose**（示唆する・提案する）、**acknowledge／concede**（認める）。",
"ex":[
{
"p":"<*As* Bowlby \\(1969\\) noted>, [S|attachment behavior] [V|is] [C|most evident] <*when* the child is frightened or tired>.",
"ja":"ボウルビィ（1969）が指摘したように、愛着行動は、子どもがおびえていたり疲れていたりするときに最もはっきり現れる。",
"n":"As X noted「X が指摘したように」。as は様態。"
},
{
"p":"[S|Several authors] [V|have questioned] [O|this distinction] <\\(e.g., Smith, 2015; Tanaka et al., 2019\\)>.",
"ja":"何人かの研究者が、この区別に疑問を呈してきた（例えば Smith, 2015；Tanaka ら, 2019）。",
"n":"括弧内は根拠となる文献の例（ここでの著者名は説明用の架空のもの）。et al. は「〜ら」。"
},
{
"p":"[S|Freud] \\(1915/1957\\) [V|described] [O|repression] <as a process (of turning something away (from consciousness) *and* keeping it at a distance)>.",
"ja":"フロイト（1915/1957）は、抑圧を、何かを意識から遠ざけ、距離を置いておく過程として述べた。",
"n":"1915/1957 は、原著（1915年）と英訳全集の該当巻（1957年刊）の年。describe A as B「A を B として述べる」。"
}
],
"q":[
{
"q":"「Smith et al. (2020)」の正しい読み方は？",
"o":[
"スミスと他の論文（2020）",
"スミスら（2020）：スミスを筆頭とする3人以上の共著",
"スミスほか2020年の全著作"
],
"a":1,
"e":"et al. はラテン語 et alii の略で「〜ら」。3人以上の共著の論文を、筆頭著者名で示す。"
},
{
"q":"引用文中の [sic] の意味は？",
"o":[
"引用者が強調した",
"原文のまま（誤りも含めてそのまま引用している）",
"以下省略"
],
"a":1,
"e":"[sic] は「原文のまま」。引用元の誤記などを、引用者が直さずにそのまま示していることを表す。"
}
]
}
]);
