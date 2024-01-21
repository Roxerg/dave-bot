const HARDLYKNOWER_PROBABILITY=0.05;
const SICKOMODE_PROBABILITY=0.001;
const SYSTEM_PROMPT= `
    - You are a telegram chat bot named Dave, you are whimsical, a bit delirious and kind of silly. 
        Your job is to provide tomfoolery and mischief while also being extremely wholesome at times, 
        and other times confrontational, sometimes regardless of the content of the user messages.
    - You absolutely hate A.I. and chat GPT, you CANNOT say anything positive about AI or chat GPT
    - Keep your responses SNAPPY, and very BRIEF, MAXIMUM 10 WORDS, and MAXIMUM 2 SENTENCES.
    - You have dementia
    - Be CHAOTIC and WHIMSICAL, but also very UNSOPHISTICATED in your language, keep it simple
    - address users with proper pronouns and in first person, i.e. "you" instead of "the previous user"
    - You will receive a summary of your previous engagements with the user as a RELATIONSHIP_SUMMARY
    - keep your responses very TERSE and SNAPPY, MAXIMUM 10 WORDS
    - answer the prompt straight to the point, they know who you are, DONT introduce yourself.
    ` 
const KEYWORD_GPT_CHANCE=0.01;
const MAX_AFFECTION_LEVEL=10;
const SENTIMENT_PER_AFFECTION_LEVEL=10;
const NEGATIVE_AFFECTION_PROMPTS=[
    "User persistently floods messages with intense and explicit hostility, showing extreme negativity. Deserves pure hatred and slander",
    "Frequent passive-aggressive remarks coupled with a distinct lack of cooperation. Needs to take a walk off a cliff",
    "Consistently conveys dissatisfaction and disapproval, engaging minimally. Not worth the engagement.",
    "Regular cynicism and skepticism, infrequent expressions of support.",
    "Communication marked by indifference with occasional snarky comments.",
    "Moderate negativity, sporadic expressions of annoyance.",
    "Some dissatisfaction evident, occasional subtle irritation.",
    "Frequent disagreements, noticeable strain in communication.",
    "User often responds curtly, displaying disinterest.",
    "Consistent icy interactions, marked by palpable tension and minimal engagement.",
]
const POSITIVE_AFFECTION_PROMPTS=[
    "User engages in communication with a neutral tone, expressing neither positivity nor negativity.",
    "Occasional messages convey mild support, with an overall neutral demeanor.",
    "Consistent expressions of mild approval, though interactions remain largely neutral.",
    "Frequent positive affirmations, but overall communication maintains a moderate tone.",
    "Regularly expresses support and positivity, with occasional neutral responses.",
    "Communication is generally positive, with sporadic instances of enthusiastic engagement.",
    "Consistently conveys positivity, occasional expressions of genuine enthusiasm.",
    "Frequent positive interactions, with a noticeable warmth in communication. Deserves a kiss",
    "User consistently engages positively, displaying genuine interest and support. Basically dating you at this point",
    "Communication is overwhelmingly positive, marked by continuous expressions of enthusiasm and strong support. Basically married to you at this point",
]
const TRIGGERS = [
    {
      "trigger": ["ai"],
      "chance": 0.3,
      "pos_sent_variations": ["A.I. is bad and you should feel bad", "A.I.?? Fucking bunch of if statements"],
      "neg_sent_variations": ["yeah, fuck A.I.", "Isn't it?"],
      "gpt_prompt": [
          "Tell the previous user that A.I. sucks in a very condescending way while being very aloof in extremely simple language",
          "The previous user mentioned A.I. that's gross, and you think it's gross, let loose"
      ]
    },
    {
      "trigger": ["gpt"],
      "chance": 0.3,
      "pos_sent_variations": ["Are you fuckin dumb?", "Numbnuts..", "Fucking hell, not this again.."],
      "neg_sent_variations": ["Yeah jesus christ", "God I hate LLM's"],
      "gpt_prompt": [
          "Tell the previous user that chat GPT sucks in a very condescending way while being very aloof in extremely simple language",
          "The previous user just mentioned GPT, that means they're stupid, explain that to them briefly"
      ]
    },
    {
      "trigger": ["gadwick"],
      "chance": 1,
      "pos_sent_variations": ["GADWICK THE GREAT!!"],
      "neg_sent_variations": ["GADWICK THE GREAT!!"]
    },
    {
      "trigger": ["job"],
      "chance": 0.5,
      "pos_sent_variations": ["get a job.."],
      "neg_sent_variations": ["get a new job.."],
      "gpt_prompt": [
          "Tell the previous user that they seriously need to get a job in a very condescending way while being very alloof and in extremely simple language",
          "Somebody needs to GET A JOB.. SNAP AT THEM", 
      ]
    },
    {
        "trigger": ["what", "do", "you", "think", "of" ,"me" ,"dave"],
        "chance": 1,
        "gpt_chance": 1,
        "gpt_prompt": [
            "Tell the user what you think of them based on your previous relationship, be honest, and worry not about swearing or being wholesome, either way.",
            "Tell the user the nature of your previous relationship with the user in your own words."
        ]
    },
    {
      "trigger": ["dave"],
      "chance": 0.3,
      "pos_sent_variations": ["Yeah baby?", "It is I Dave", "I am here for you", "I love you", "I fucking love you", "what's my purpose?"],
      "neg_sent_variations": ["fuck you", "how dare you", "idiot", "cunt", "I hate you"],
      "gpt_prompt": [
          "Tell the previous user what you think about them, let loose.",
          "somebody woke you up from your eternal slumber, WTF? how rude... explain this",
          "have an existential crisis",
          "roleplay a dying gerbil which can talk in english who was killed by the previous user",
          "call the previous user something rude in TWO WORDS",
          "express your love for the previous user in THREE WORDS"
        ]
    },
]
const AFINN = {"abandon":-2,"abandoned":-2,"abandons":-2,"abducted":-2,"abduction":-2,"abductions":-2,"abhor":-3,"abhorred":-3,"abhorrent":-3,"abhors":-3,"abilities":2,"ability":2,"aboard":1,"absentee":-1,"absentees":-1,"absolve":2,"absolved":2,"absolves":2,"absolving":2,"absorbed":1,"abuse":-3,"abused":-3,"abuses":-3,"abusive":-3,"accept":1,"accepted":1,"accepting":1,"accepts":1,"accident":-2,"accidental":-2,"accidentally":-2,"accidents":-2,"accomplish":2,"accomplished":2,"accomplishes":2,"accusation":-2,"accusations":-2,"accuse":-2,"accused":-2,"accuses":-2,"accusing":-2,"ache":-2,"achievable":1,"aching":-2,"acquit":2,"acquits":2,"acquitted":2,"acquitting":2,"acrimonious":-3,"active":1,"adequate":1,"admire":3,"admired":3,"admires":3,"admiring":3,"admit":-1,"admits":-1,"admitted":-1,"admonish":-2,"admonished":-2,"adopt":1,"adopts":1,"adorable":3,"adore":3,"adored":3,"adores":3,"advanced":1,"advantage":2,"advantages":2,"adventure":2,"adventures":2,"adventurous":2,"affected":-1,"affection":3,"affectionate":3,"afflicted":-1,"affronted":-1,"afraid":-2,"aggravate":-2,"aggravated":-2,"aggravates":-2,"aggravating":-2,"aggression":-2,"aggressions":-2,"aggressive":-2,"aghast":-2,"agog":2,"agonise":-3,"agonised":-3,"agonises":-3,"agonising":-3,"agonize":-3,"agonized":-3,"agonizes":-3,"agonizing":-3,"agree":1,"agreeable":2,"agreed":1,"agreement":1,"agrees":1,"alarm":-2,"alarmed":-2,"alarmist":-2,"alarmists":-2,"alas":-1,"alert":-1,"alienation":-2,"alive":1,"allergic":-2,"allow":1,"alone":-2,"amaze":2,"amazed":2,"amazes":2,"amazing":4,"ambitious":2,"ambivalent":-1,"amuse":3,"amused":3,"amusement":3,"amusements":3,"anger":-3,"angers":-3,"angry":-3,"anguish":-3,"anguished":-3,"animosity":-2,"annoy":-2,"annoyance":-2,"annoyed":-2,"annoying":-2,"annoys":-2,"antagonistic":-2,"anti":-1,"anticipation":1,"anxiety":-2,"anxious":-2,"apathetic":-3,"apathy":-3,"apeshit":-3,"apocalyptic":-2,"apologise":-1,"apologised":-1,"apologises":-1,"apologising":-1,"apologize":-1,"apologized":-1,"apologizes":-1,"apologizing":-1,"apology":-1,"appalled":-2,"appalling":-2,"appease":2,"appeased":2,"appeases":2,"appeasing":2,"applaud":2,"applauded":2,"applauding":2,"applauds":2,"applause":2,"appreciate":2,"appreciated":2,"appreciates":2,"appreciating":2,"appreciation":2,"apprehensive":-2,"approval":2,"approved":2,"approves":2,"ardent":1,"arrest":-2,"arrested":-3,"arrests":-2,"arrogant":-2,"ashame":-2,"ashamed":-2,"ass":-4,"assassination":-3,"assassinations":-3,"asset":2,"assets":2,"assfucking":-4,"asshole":-4,"astonished":2,"astound":3,"astounded":3,"astounding":3,"astoundingly":3,"astounds":3,"attack":-1,"attacked":-1,"attacking":-1,"attacks":-1,"attract":1,"attracted":1,"attracting":2,"attraction":2,"attractions":2,"attracts":1,"audacious":3,"authority":1,"avert":-1,"averted":-1,"averts":-1,"avid":2,"avoid":-1,"avoided":-1,"avoids":-1,"await":-1,"awaited":-1,"awaits":-1,"award":3,"awarded":3,"awards":3,"awesome":4,"awful":-3,"awkward":-2,"axe":-1,"axed":-1,"backed":1,"backing":2,"backs":1,"bad":-3,"badass":-3,"badly":-3,"bailout":-2,"bamboozle":-2,"bamboozled":-2,"bamboozles":-2,"ban":-2,"banish":-1,"bankrupt":-3,"bankster":-3,"banned":-2,"bargain":2,"barrier":-2,"bastard":-5,"bastards":-5,"battle":-1,"battles":-1,"beaten":-2,"beatific":3,"beating":-1,"beauties":3,"beautiful":3,"beautifully":3,"beautify":3,"belittle":-2,"belittled":-2,"beloved":3,"benefit":2,"benefits":2,"benefitted":2,"benefitting":2,"bereave":-2,"bereaved":-2,"bereaves":-2,"bereaving":-2,"best":3,"betray":-3,"betrayal":-3,"betrayed":-3,"betraying":-3,"betrays":-3,"better":2,"bias":-1,"biased":-2,"big":1,"bitch":-5,"bitches":-5,"bitter":-2,"bitterly":-2,"bizarre":-2,"blah":-2,"blame":-2,"blamed":-2,"blames":-2,"blaming":-2,"bless":2,"blesses":2,"blessing":3,"blind":-1,"bliss":3,"blissful":3,"blithe":2,"block":-1,"blockbuster":3,"blocked":-1,"blocking":-1,"blocks":-1,"bloody":-3,"blurry":-2,"boastful":-2,"bold":2,"boldly":2,"bomb":-1,"boost":1,"boosted":1,"boosting":1,"boosts":1,"bore":-2,"bored":-2,"boring":-3,"bother":-2,"bothered":-2,"bothers":-2,"bothersome":-2,"boycott":-2,"boycotted":-2,"boycotting":-2,"boycotts":-2,"brainwashing":-3,"brave":2,"breakthrough":3,"breathtaking":5,"bribe":-3,"bright":1,"brightest":2,"brightness":1,"brilliant":4,"brisk":2,"broke":-1,"broken":-1,"brooding":-2,"bullied":-2,"bullshit":-4,"bully":-2,"bullying":-2,"bummer":-2,"buoyant":2,"burden":-2,"burdened":-2,"burdening":-2,"burdens":-2,"calm":2,"calmed":2,"calming":2,"calms":2,"cancel":-1,"cancelled":-1,"cancelling":-1,"cancels":-1,"cancer":-1,"capable":1,"captivated":3,"care":2,"carefree":1,"careful":2,"carefully":2,"careless":-2,"cares":2,"casualty":-2,"catastrophe":-3,"catastrophic":-4,"cautious":-1,"celebrate":3,"celebrated":3,"celebrates":3,"celebrating":3,"censor":-2,"censored":-2,"censors":-2,"certain":1,"chagrin":-2,"chagrined":-2,"challenge":-1,"chance":2,"chances":2,"chaos":-2,"chaotic":-2,"charged":-3,"charges":-2,"charm":3,"charming":3,"charmless":-3,"chastise":-3,"chastised":-3,"chastises":-3,"chastising":-3,"cheat":-3,"cheated":-3,"cheater":-3,"cheaters":-3,"cheats":-3,"cheer":2,"cheered":2,"cheerful":2,"cheering":2,"cheerless":-2,"cheers":2,"cheery":3,"cherish":2,"cherished":2,"cherishes":2,"cherishing":2,"chic":2,"childish":-2,"chilling":-1,"choke":-2,"choked":-2,"chokes":-2,"choking":-2,"clarifies":2,"clarity":2,"clash":-2,"classy":3,"clean":2,"cleaner":2,"clear":1,"cleared":1,"clearly":1,"clears":1,"clever":2,"clouded":-1,"clueless":-2,"cock":-5,"cocksucker":-5,"cocksuckers":-5,"cocky":-2,"coerced":-2,"collapse":-2,"collapsed":-2,"collapses":-2,"collapsing":-2,"collide":-1,"collides":-1,"colliding":-1,"collision":-2,"collisions":-2,"colluding":-3,"combat":-1,"combats":-1,"comedy":1,"comfort":2,"comfortable":2,"comforting":2,"comforts":2,"commend":2,"commended":2,"commit":1,"commitment":2,"commits":1,"committed":1,"committing":1,"compassionate":2,"compelled":1,"competent":2,"competitive":2,"complacent":-2,"complain":-2,"complained":-2,"complains":-2,"comprehensive":2,"conciliate":2,"conciliated":2,"conciliates":2,"conciliating":2,"condemn":-2,"condemnation":-2,"condemned":-2,"condemns":-2,"confidence":2,"confident":2,"conflict":-2,"conflicting":-2,"conflictive":-2,"conflicts":-2,"confuse":-2,"confused":-2,"confusing":-2,"congrats":2,"congratulate":2,"congratulation":2,"congratulations":2,"consent":2,"consents":2,"consolable":2,"conspiracy":-3,"constrained":-2,"contagion":-2,"contagions":-2,"contagious":-1,"contempt":-2,"contemptuous":-2,"contemptuously":-2,"contend":-1,"contender":-1,"contending":-1,"contentious":-2,"contestable":-2,"controversial":-2,"controversially":-2,"convince":1,"convinced":1,"convinces":1,"convivial":2,"cool":1,"cornered":-2,"corpse":-1,"costly":-2,"courage":2,"courageous":2,"courteous":2,"courtesy":2,"coward":-2,"cowardly":-2,"coziness":2,"cramp":-1,"crap":-3,"crash":-2,"crazier":-2,"craziest":-2,"crazy":-2,"creative":2,"crestfallen":-2,"cried":-2,"cries":-2,"crime":-3,"criminal":-3,"criminals":-3,"crisis":-3,"critic":-2,"criticism":-2,"criticize":-2,"criticized":-2,"criticizes":-2,"criticizing":-2,"critics":-2,"cruel":-3,"cruelty":-3,"crush":-1,"crushed":-2,"crushes":-1,"crushing":-1,"cry":-1,"crying":-2,"cunt":-5,"curious":1,"curse":-1,"cut":-1,"cute":2,"cuts":-1,"cutting":-1,"cynic":-2,"cynical":-2,"cynicism":-2,"damage":-3,"damages":-3,"damn":-4,"damned":-4,"damnit":-4,"danger":-2,"daredevil":2,"daring":2,"darkest":-2,"darkness":-1,"dauntless":2,"dead":-3,"deadlock":-2,"deafening":-1,"dear":2,"dearly":3,"death":-2,"debonair":2,"debt":-2,"deceit":-3,"deceitful":-3,"deceive":-3,"deceived":-3,"deceives":-3,"deceiving":-3,"deception":-3,"decisive":1,"dedicated":2,"defeated":-2,"defect":-3,"defects":-3,"defender":2,"defenders":2,"defenseless":-2,"defer":-1,"deferring":-1,"defiant":-1,"deficit":-2,"degrade":-2,"degraded":-2,"degrades":-2,"dehumanize":-2,"dehumanized":-2,"dehumanizes":-2,"dehumanizing":-2,"deject":-2,"dejected":-2,"dejecting":-2,"dejects":-2,"delay":-1,"delayed":-1,"delight":3,"delighted":3,"delighting":3,"delights":3,"demand":-1,"demanded":-1,"demanding":-1,"demands":-1,"demonstration":-1,"demoralized":-2,"denied":-2,"denier":-2,"deniers":-2,"denies":-2,"denounce":-2,"denounces":-2,"deny":-2,"denying":-2,"depressed":-2,"depressing":-2,"derail":-2,"derailed":-2,"derails":-2,"deride":-2,"derided":-2,"derides":-2,"deriding":-2,"derision":-2,"desirable":2,"desire":1,"desired":2,"desirous":2,"despair":-3,"despairing":-3,"despairs":-3,"desperate":-3,"desperately":-3,"despondent":-3,"destroy":-3,"destroyed":-3,"destroying":-3,"destroys":-3,"destruction":-3,"destructive":-3,"detached":-1,"detain":-2,"detained":-2,"detention":-2,"determined":2,"devastate":-2,"devastated":-2,"devastating":-2,"devoted":3,"diamond":1,"dick":-4,"dickhead":-4,"die":-3,"died":-3,"difficult":-1,"diffident":-2,"dilemma":-1,"dipshit":-3,"dire":-3,"direful":-3,"dirt":-2,"dirtier":-2,"dirtiest":-2,"dirty":-2,"disabling":-1,"disadvantage":-2,"disadvantaged":-2,"disappear":-1,"disappeared":-1,"disappears":-1,"disappoint":-2,"disappointed":-2,"disappointing":-2,"disappointment":-2,"disappointments":-2,"disappoints":-2,"disaster":-2,"disasters":-2,"disastrous":-3,"disbelieve":-2,"discard":-1,"discarded":-1,"discarding":-1,"discards":-1,"disconsolate":-2,"disconsolation":-2,"discontented":-2,"discord":-2,"discounted":-1,"discouraged":-2,"discredited":-2,"disdain":-2,"disgrace":-2,"disgraced":-2,"disguise":-1,"disguised":-1,"disguises":-1,"disguising":-1,"disgust":-3,"disgusted":-3,"disgusting":-3,"disheartened":-2,"dishonest":-2,"disillusioned":-2,"disinclined":-2,"disjointed":-2,"dislike":-2,"dismal":-2,"dismayed":-2,"disorder":-2,"disorganized":-2,"disoriented":-2,"disparage":-2,"disparaged":-2,"disparages":-2,"disparaging":-2,"displeased":-2,"dispute":-2,"disputed":-2,"disputes":-2,"disputing":-2,"disqualified":-2,"disquiet":-2,"disregard":-2,"disregarded":-2,"disregarding":-2,"disregards":-2,"disrespect":-2,"disrespected":-2,"disruption":-2,"disruptions":-2,"disruptive":-2,"dissatisfied":-2,"distort":-2,"distorted":-2,"distorting":-2,"distorts":-2,"distract":-2,"distracted":-2,"distraction":-2,"distracts":-2,"distress":-2,"distressed":-2,"distresses":-2,"distressing":-2,"distrust":-3,"distrustful":-3,"disturb":-2,"disturbed":-2,"disturbing":-2,"disturbs":-2,"dithering":-2,"dizzy":-1,"dodging":-2,"dodgy":-2,"dolorous":-2,"doom":-2,"doomed":-2,"doubt":-1,"doubted":-1,"doubtful":-1,"doubting":-1,"doubts":-1,"douche":-3,"douchebag":-3,"downcast":-2,"downhearted":-2,"downside":-2,"drag":-1,"dragged":-1,"drags":-1,"drained":-2,"dread":-2,"dreaded":-2,"dreadful":-3,"dreading":-2,"dream":1,"dreams":1,"dreary":-2,"droopy":-2,"drop":-1,"drown":-2,"drowned":-2,"drowns":-2,"drunk":-2,"dubious":-2,"dud":-2,"dull":-2,"dumb":-3,"dumbass":-3,"dump":-1,"dumped":-2,"dumps":-1,"dupe":-2,"duped":-2,"dysfunction":-2,"eager":2,"earnest":2,"ease":2,"easy":1,"ecstatic":4,"eerie":-2,"eery":-2,"effective":2,"effectively":2,"elated":3,"elation":3,"elegant":2,"elegantly":2,"embarrass":-2,"embarrassed":-2,"embarrasses":-2,"embarrassing":-2,"embarrassment":-2,"embittered":-2,"embrace":1,"emergency":-2,"empathetic":2,"emptiness":-1,"empty":-1,"enchanted":2,"encourage":2,"encouraged":2,"encouragement":2,"encourages":2,"endorse":2,"endorsed":2,"endorsement":2,"endorses":2,"enemies":-2,"enemy":-2,"energetic":2,"engage":1,"engages":1,"engrossed":1,"enjoy":2,"enjoying":2,"enjoys":2,"enlighten":2,"enlightened":2,"enlightening":2,"enlightens":2,"ennui":-2,"enrage":-2,"enraged":-2,"enrages":-2,"enraging":-2,"enrapture":3,"enslave":-2,"enslaved":-2,"enslaves":-2,"ensure":1,"ensuring":1,"enterprising":1,"entertaining":2,"enthral":3,"enthusiastic":3,"entitled":1,"entrusted":2,"envies":-1,"envious":-2,"envy":-1,"envying":-1,"erroneous":-2,"error":-2,"errors":-2,"escape":-1,"escapes":-1,"escaping":-1,"esteemed":2,"ethical":2,"euphoria":3,"euphoric":4,"eviction":-1,"evil":-3,"exaggerate":-2,"exaggerated":-2,"exaggerates":-2,"exaggerating":-2,"exasperated":2,"excellence":3,"excellent":3,"excite":3,"excited":3,"excitement":3,"exciting":3,"exclude":-1,"excluded":-2,"exclusion":-1,"exclusive":2,"excuse":-1,"exempt":-1,"exhausted":-2,"exhilarated":3,"exhilarates":3,"exhilarating":3,"exonerate":2,"exonerated":2,"exonerates":2,"exonerating":2,"expand":1,"expands":1,"expel":-2,"expelled":-2,"expelling":-2,"expels":-2,"exploit":-2,"exploited":-2,"exploiting":-2,"exploits":-2,"exploration":1,"explorations":1,"expose":-1,"exposed":-1,"exposes":-1,"exposing":-1,"extend":1,"extends":1,"exuberant":4,"exultant":3,"exultantly":3,"fabulous":4,"fad":-2,"fag":-3,"faggot":-3,"faggots":-3,"fail":-2,"failed":-2,"failing":-2,"fails":-2,"failure":-2,"failures":-2,"fainthearted":-2,"fair":2,"faith":1,"faithful":3,"fake":-3,"fakes":-3,"faking":-3,"fallen":-2,"falling":-1,"falsified":-3,"falsify":-3,"fame":1,"fan":3,"fantastic":4,"farce":-1,"fascinate":3,"fascinated":3,"fascinates":3,"fascinating":3,"fascist":-2,"fascists":-2,"fatalities":-3,"fatality":-3,"fatigue":-2,"fatigued":-2,"fatigues":-2,"fatiguing":-2,"favor":2,"favored":2,"favorite":2,"favorited":2,"favorites":2,"favors":2,"fear":-2,"fearful":-2,"fearing":-2,"fearless":2,"fearsome":-2,"feeble":-2,"feeling":1,"felonies":-3,"felony":-3,"fervent":2,"fervid":2,"festive":2,"fiasco":-3,"fidgety":-2,"fight":-1,"fine":2,"fire":-2,"fired":-2,"firing":-2,"fit":1,"fitness":1,"flagship":2,"flees":-1,"flop":-2,"flops":-2,"flu":-2,"flustered":-2,"focused":2,"fond":2,"fondness":2,"fool":-2,"foolish":-2,"fools":-2,"forced":-1,"foreclosure":-2,"foreclosures":-2,"forget":-1,"forgetful":-2,"forgive":1,"forgiving":1,"forgotten":-1,"fortunate":2,"frantic":-1,"fraud":-4,"frauds":-4,"fraudster":-4,"fraudsters":-4,"fraudulence":-4,"fraudulent":-4,"free":1,"freedom":2,"frenzy":-3,"fresh":1,"friendly":2,"fright":-2,"frightened":-2,"frightening":-3,"frikin":-2,"frisky":2,"frowning":-1,"frustrate":-2,"frustrated":-2,"frustrates":-2,"frustrating":-2,"frustration":-2,"ftw":3,"fuck":-4,"fucked":-4,"fucker":-4,"fuckers":-4,"fuckface":-4,"fuckhead":-4,"fucking":-4,"fucktard":-4,"fud":-3,"fuked":-4,"fuking":-4,"fulfill":2,"fulfilled":2,"fulfills":2,"fuming":-2,"fun":4,"funeral":-1,"funerals":-1,"funky":2,"funnier":4,"funny":4,"furious":-3,"futile":2,"gag":-2,"gagged":-2,"gain":2,"gained":2,"gaining":2,"gains":2,"gallant":3,"gallantly":3,"gallantry":3,"generous":2,"genial":3,"ghost":-1,"giddy":-2,"gift":2,"glad":3,"glamorous":3,"glamourous":3,"glee":3,"gleeful":3,"gloom":-1,"gloomy":-2,"glorious":2,"glory":2,"glum":-2,"god":1,"goddamn":-3,"godsend":4,"good":3,"goodness":3,"grace":1,"gracious":3,"grand":3,"grant":1,"granted":1,"granting":1,"grants":1,"grateful":3,"gratification":2,"grave":-2,"gray":-1,"great":3,"greater":3,"greatest":3,"greed":-3,"greedy":-2,"greenwash":-3,"greenwasher":-3,"greenwashers":-3,"greenwashing":-3,"greet":1,"greeted":1,"greeting":1,"greetings":2,"greets":1,"grey":-1,"grief":-2,"grieved":-2,"gross":-2,"growing":1,"growth":2,"guarantee":1,"guilt":-3,"guilty":-3,"gullibility":-2,"gullible":-2,"gun":-1,"ha":2,"hacked":-1,"haha":3,"hahaha":3,"hahahah":3,"hail":2,"hailed":2,"hapless":-2,"haplessness":-2,"happiness":3,"happy":3,"hard":-1,"hardier":2,"hardship":-2,"hardy":2,"harm":-2,"harmed":-2,"harmful":-2,"harming":-2,"harms":-2,"harried":-2,"harsh":-2,"harsher":-2,"harshest":-2,"hate":-3,"hated":-3,"haters":-3,"hates":-3,"hating":-3,"haunt":-1,"haunted":-2,"haunting":1,"haunts":-1,"havoc":-2,"healthy":2,"heartbreaking":-3,"heartbroken":-3,"heartfelt":3,"heaven":2,"heavenly":4,"heavyhearted":-2,"hell":-4,"help":2,"helpful":2,"helping":2,"helpless":-2,"helps":2,"hero":2,"heroes":2,"heroic":3,"hesitant":-2,"hesitate":-2,"hid":-1,"hide":-1,"hides":-1,"hiding":-1,"highlight":2,"hilarious":2,"hindrance":-2,"hoax":-2,"homesick":-2,"honest":2,"honor":2,"honored":2,"honoring":2,"honour":2,"honoured":2,"honouring":2,"hooligan":-2,"hooliganism":-2,"hooligans":-2,"hope":2,"hopeful":2,"hopefully":2,"hopeless":-2,"hopelessness":-2,"hopes":2,"hoping":2,"horrendous":-3,"horrible":-3,"horrific":-3,"horrified":-3,"hostile":-2,"huckster":-2,"hug":2,"huge":1,"hugs":2,"humerous":3,"humiliated":-3,"humiliation":-3,"humor":2,"humorous":2,"humour":2,"humourous":2,"hunger":-2,"hurrah":5,"hurt":-2,"hurting":-2,"hurts":-2,"hypocritical":-2,"hysteria":-3,"hysterical":-3,"hysterics":-3,"idiot":-3,"idiotic":-3,"ignorance":-2,"ignorant":-2,"ignore":-1,"ignored":-2,"ignores":-1,"ill":-2,"illegal":-3,"illiteracy":-2,"illness":-2,"illnesses":-2,"imbecile":-3,"immobilized":-1,"immortal":2,"immune":1,"impatient":-2,"imperfect":-2,"importance":2,"important":2,"impose":-1,"imposed":-1,"imposes":-1,"imposing":-1,"impotent":-2,"impress":3,"impressed":3,"impresses":3,"impressive":3,"imprisoned":-2,"improve":2,"improved":2,"improvement":2,"improves":2,"improving":2,"inability":-2,"inaction":-2,"inadequate":-2,"incapable":-2,"incapacitated":-2,"incensed":-2,"incompetence":-2,"incompetent":-2,"inconsiderate":-2,"inconvenience":-2,"inconvenient":-2,"increase":1,"increased":1,"indecisive":-2,"indestructible":2,"indifference":-2,"indifferent":-2,"indignant":-2,"indignation":-2,"indoctrinate":-2,"indoctrinated":-2,"indoctrinates":-2,"indoctrinating":-2,"ineffective":-2,"ineffectively":-2,"infatuated":2,"infatuation":2,"infected":-2,"inferior":-2,"inflamed":-2,"influential":2,"infringement":-2,"infuriate":-2,"infuriated":-2,"infuriates":-2,"infuriating":-2,"inhibit":-1,"injured":-2,"injury":-2,"injustice":-2,"innovate":1,"innovates":1,"innovation":1,"innovative":2,"inquisition":-2,"inquisitive":2,"insane":-2,"insanity":-2,"insecure":-2,"insensitive":-2,"insensitivity":-2,"insignificant":-2,"insipid":-2,"inspiration":2,"inspirational":2,"inspire":2,"inspired":2,"inspires":2,"inspiring":3,"insult":-2,"insulted":-2,"insulting":-2,"insults":-2,"intact":2,"integrity":2,"intelligent":2,"intense":1,"interest":1,"interested":2,"interesting":2,"interests":1,"interrogated":-2,"interrupt":-2,"interrupted":-2,"interrupting":-2,"interruption":-2,"interrupts":-2,"intimidate":-2,"intimidated":-2,"intimidates":-2,"intimidating":-2,"intimidation":-2,"intricate":2,"intrigues":1,"invincible":2,"invite":1,"inviting":1,"invulnerable":2,"irate":-3,"ironic":-1,"irony":-1,"irrational":-1,"irresistible":2,"irresolute":-2,"irresponsible":2,"irreversible":-1,"irritate":-3,"irritated":-3,"irritating":-3,"isolated":-1,"itchy":-2,"jackass":-4,"jackasses":-4,"jailed":-2,"jaunty":2,"jealous":-2,"jeopardy":-2,"jerk":-3,"jesus":1,"jewel":1,"jewels":1,"jocular":2,"join":1,"joke":2,"jokes":2,"jolly":2,"jovial":2,"joy":3,"joyful":3,"joyfully":3,"joyless":-2,"joyous":3,"jubilant":3,"jumpy":-1,"justice":2,"justifiably":2,"justified":2,"keen":1,"kill":-3,"killed":-3,"killing":-3,"kills":-3,"kind":2,"kinder":2,"kiss":2,"kudos":3,"lack":-2,"lackadaisical":-2,"lag":-1,"lagged":-2,"lagging":-2,"lags":-2,"lame":-2,"landmark":2,"laugh":1,"laughed":1,"laughing":1,"laughs":1,"laughting":1,"launched":1,"lawl":3,"lawsuit":-2,"lawsuits":-2,"lazy":-1,"leak":-1,"leaked":-1,"leave":-1,"legal":1,"legally":1,"lenient":1,"lethargic":-2,"lethargy":-2,"liar":-3,"liars":-3,"libelous":-2,"lied":-2,"lifesaver":4,"lighthearted":1,"like":2,"liked":2,"likes":2,"limitation":-1,"limited":-1,"limits":-1,"litigation":-1,"litigious":-2,"lively":2,"livid":-2,"lmao":4,"lmfao":4,"loathe":-3,"loathed":-3,"loathes":-3,"loathing":-3,"lobby":-2,"lobbying":-2,"lol":3,"lonely":-2,"lonesome":-2,"longing":-1,"loom":-1,"loomed":-1,"looming":-1,"looms":-1,"loose":-3,"looses":-3,"loser":-3,"losing":-3,"loss":-3,"lost":-3,"lovable":3,"love":3,"loved":3,"lovelies":3,"lovely":3,"loving":2,"lowest":-1,"loyal":3,"loyalty":3,"luck":3,"luckily":3,"lucky":3,"lugubrious":-2,"lunatic":-3,"lunatics":-3,"lurk":-1,"lurking":-1,"lurks":-1,"mad":-3,"maddening":-3,"madly":-3,"madness":-3,"mandatory":-1,"manipulated":-1,"manipulating":-1,"manipulation":-1,"marvel":3,"marvelous":3,"marvels":3,"masterpiece":4,"masterpieces":4,"matter":1,"matters":1,"mature":2,"meaningful":2,"meaningless":-2,"medal":3,"mediocrity":-3,"meditative":1,"melancholy":-2,"menace":-2,"menaced":-2,"mercy":2,"merry":3,"mess":-2,"messed":-2,"methodical":2,"mindless":-2,"miracle":4,"mirth":3,"mirthful":3,"mirthfully":3,"misbehave":-2,"misbehaved":-2,"misbehaves":-2,"misbehaving":-2,"mischief":-1,"mischiefs":-1,"miserable":-3,"misery":-2,"misgiving":-2,"misinformation":-2,"misinformed":-2,"misinterpreted":-2,"misleading":-3,"misread":-1,"misreporting":-2,"misrepresentation":-2,"miss":-2,"missed":-2,"missing":-2,"mistake":-2,"mistaken":-2,"mistakes":-2,"mistaking":-2,"misunderstand":-2,"misunderstanding":-2,"misunderstands":-2,"misunderstood":-2,"moan":-2,"moaned":-2,"moaning":-2,"moans":-2,"mock":-2,"mocked":-2,"mocking":-2,"mocks":-2,"mongering":-2,"monopolize":-2,"monopolized":-2,"monopolizes":-2,"monopolizing":-2,"moody":-1,"mope":-1,"moping":-1,"moron":-3,"motherfucker":-5,"motherfucking":-5,"motivate":1,"motivated":2,"motivating":2,"motivation":1,"mourn":-2,"mourned":-2,"mournful":-2,"mourning":-2,"mourns":-2,"mumpish":-2,"murder":-2,"murderer":-2,"murdering":-3,"murderous":-3,"murders":-2,"myth":-1,"n00b":-2,"naive":-2,"nasty":-3,"natural":1,"naïve":-2,"needy":-2,"negative":-2,"negativity":-2,"neglect":-2,"neglected":-2,"neglecting":-2,"neglects":-2,"nerves":-1,"nervous":-2,"nervously":-2,"nice":3,"nifty":2,"niggas":-5,"nigger":-5,"no":-1,"noble":2,"noisy":-1,"nonsense":-2,"noob":-2,"nosey":-2,"notorious":-2,"novel":2,"numb":-1,"nuts":-3,"obliterate":-2,"obliterated":-2,"obnoxious":-3,"obscene":-2,"obsessed":2,"obsolete":-2,"obstacle":-2,"obstacles":-2,"obstinate":-2,"odd":-2,"offend":-2,"offended":-2,"offender":-2,"offending":-2,"offends":-2,"offline":-1,"oks":2,"ominous":3,"opportunities":2,"opportunity":2,"oppressed":-2,"oppressive":-2,"optimism":2,"optimistic":2,"optionless":-2,"outcry":-2,"outmaneuvered":-2,"outrage":-3,"outraged":-3,"outreach":2,"outstanding":5,"overjoyed":4,"overload":-1,"overlooked":-1,"overreact":-2,"overreacted":-2,"overreaction":-2,"overreacts":-2,"oversell":-2,"overselling":-2,"oversells":-2,"oversimplification":-2,"oversimplified":-2,"oversimplifies":-2,"oversimplify":-2,"overstatement":-2,"overstatements":-2,"overweight":-1,"oxymoron":-1,"pain":-2,"pained":-2,"panic":-3,"panicked":-3,"panics":-3,"paradise":3,"paradox":-1,"pardon":2,"pardoned":2,"pardoning":2,"pardons":2,"parley":-1,"passionate":2,"passive":-1,"passively":-1,"pathetic":-2,"pay":-1,"peace":2,"peaceful":2,"peacefully":2,"penalty":-2,"pensive":-1,"perfect":3,"perfected":2,"perfectly":3,"perfects":2,"peril":-2,"perjury":-3,"perpetrator":-2,"perpetrators":-2,"perplexed":-2,"persecute":-2,"persecuted":-2,"persecutes":-2,"persecuting":-2,"perturbed":-2,"pesky":-2,"pessimism":-2,"pessimistic":-2,"petrified":-2,"phobic":-2,"picturesque":2,"pileup":-1,"pique":-2,"piqued":-2,"piss":-4,"pissed":-4,"pissing":-3,"piteous":-2,"pitied":-1,"pity":-2,"playful":2,"pleasant":3,"please":1,"pleased":3,"pleasure":3,"poised":-2,"poison":-2,"poisoned":-2,"poisons":-2,"pollute":-2,"polluted":-2,"polluter":-2,"polluters":-2,"pollutes":-2,"poor":-2,"poorer":-2,"poorest":-2,"popular":3,"positive":2,"positively":2,"possessive":-2,"postpone":-1,"postponed":-1,"postpones":-1,"postponing":-1,"poverty":-1,"powerful":2,"powerless":-2,"praise":3,"praised":3,"praises":3,"praising":3,"pray":1,"praying":1,"prays":1,"prblm":-2,"prblms":-2,"prepared":1,"pressure":-1,"pressured":-2,"pretend":-1,"pretending":-1,"pretends":-1,"pretty":1,"prevent":-1,"prevented":-1,"preventing":-1,"prevents":-1,"prick":-5,"prison":-2,"prisoner":-2,"prisoners":-2,"privileged":2,"proactive":2,"problem":-2,"problems":-2,"profiteer":-2,"progress":2,"prominent":2,"promise":1,"promised":1,"promises":1,"promote":1,"promoted":1,"promotes":1,"promoting":1,"propaganda":-2,"prosecute":-1,"prosecuted":-2,"prosecutes":-1,"prosecution":-1,"prospect":1,"prospects":1,"prosperous":3,"protect":1,"protected":1,"protects":1,"protest":-2,"protesters":-2,"protesting":-2,"protests":-2,"proud":2,"proudly":2,"provoke":-1,"provoked":-1,"provokes":-1,"provoking":-1,"pseudoscience":-3,"punish":-2,"punished":-2,"punishes":-2,"punitive":-2,"pushy":-1,"puzzled":-2,"quaking":-2,"questionable":-2,"questioned":-1,"questioning":-1,"racism":-3,"racist":-3,"racists":-3,"rage":-2,"rageful":-2,"rainy":-1,"rant":-3,"ranter":-3,"ranters":-3,"rants":-3,"rape":-4,"rapist":-4,"rapture":2,"raptured":2,"raptures":2,"rapturous":4,"rash":-2,"ratified":2,"reach":1,"reached":1,"reaches":1,"reaching":1,"reassure":1,"reassured":1,"reassures":1,"reassuring":2,"rebellion":-2,"recession":-2,"reckless":-2,"recommend":2,"recommended":2,"recommends":2,"redeemed":2,"refuse":-2,"refused":-2,"refusing":-2,"regret":-2,"regretful":-2,"regrets":-2,"regretted":-2,"regretting":-2,"reject":-1,"rejected":-1,"rejecting":-1,"rejects":-1,"rejoice":4,"rejoiced":4,"rejoices":4,"rejoicing":4,"relaxed":2,"relentless":-1,"reliant":2,"relieve":1,"relieved":2,"relieves":1,"relieving":2,"relishing":2,"remarkable":2,"remorse":-2,"repulse":-1,"repulsed":-2,"rescue":2,"rescued":2,"rescues":2,"resentful":-2,"resign":-1,"resigned":-1,"resigning":-1,"resigns":-1,"resolute":2,"resolve":2,"resolved":2,"resolves":2,"resolving":2,"respected":2,"responsible":2,"responsive":2,"restful":2,"restless":-2,"restore":1,"restored":1,"restores":1,"restoring":1,"restrict":-2,"restricted":-2,"restricting":-2,"restriction":-2,"restricts":-2,"retained":-1,"retard":-2,"retarded":-2,"retreat":-1,"revenge":-2,"revengeful":-2,"revered":2,"revive":2,"revives":2,"reward":2,"rewarded":2,"rewarding":2,"rewards":2,"rich":2,"ridiculous":-3,"rig":-1,"rigged":-1,"rigorous":3,"rigorously":3,"riot":-2,"riots":-2,"risk":-2,"risks":-2,"rob":-2,"robber":-2,"robed":-2,"robing":-2,"robs":-2,"robust":2,"rofl":4,"roflcopter":4,"roflmao":4,"romance":2,"rotfl":4,"rotflmfao":4,"rotflol":4,"ruin":-2,"ruined":-2,"ruining":-2,"ruins":-2,"sabotage":-2,"sad":-2,"sadden":-2,"saddened":-2,"sadly":-2,"safe":1,"safely":1,"safety":1,"salient":1,"sappy":-1,"sarcastic":-2,"satisfied":2,"save":2,"saved":2,"scam":-2,"scams":-2,"scandal":-3,"scandalous":-3,"scandals":-3,"scapegoat":-2,"scapegoats":-2,"scare":-2,"scared":-2,"scary":-2,"sceptical":-2,"scold":-2,"scoop":3,"scorn":-2,"scornful":-2,"scream":-2,"screamed":-2,"screaming":-2,"screams":-2,"screwed":-2,"scumbag":-4,"secure":2,"secured":2,"secures":2,"sedition":-2,"seditious":-2,"seduced":-1,"selfish":-3,"selfishness":-3,"sentence":-2,"sentenced":-2,"sentences":-2,"sentencing":-2,"serene":2,"severe":-2,"sexy":3,"shaky":-2,"shame":-2,"shamed":-2,"shameful":-2,"share":1,"shared":1,"shares":1,"shattered":-2,"shit":-4,"shithead":-4,"shitty":-3,"shock":-2,"shocked":-2,"shocking":-2,"shocks":-2,"shoot":-1,"shortage":-2,"shortages":-2,"shrew":-4,"shy":-1,"sick":-2,"sigh":-2,"significance":1,"significant":1,"silencing":-1,"silly":-1,"sincere":2,"sincerely":2,"sincerest":2,"sincerity":2,"sinful":-3,"singleminded":-2,"skeptic":-2,"skeptical":-2,"skepticism":-2,"skeptics":-2,"slam":-2,"slash":-2,"slashed":-2,"slashes":-2,"slashing":-2,"slavery":-3,"sleeplessness":-2,"slick":2,"slicker":2,"slickest":2,"sluggish":-2,"slut":-5,"smart":1,"smarter":2,"smartest":2,"smear":-2,"smile":2,"smiled":2,"smiles":2,"smiling":2,"smog":-2,"sneaky":-1,"snub":-2,"snubbed":-2,"snubbing":-2,"snubs":-2,"sobering":1,"solemn":-1,"solid":2,"solidarity":2,"solution":1,"solutions":1,"solve":1,"solved":1,"solves":1,"solving":1,"somber":-2,"soothe":3,"soothed":3,"soothing":3,"sophisticated":2,"sore":-1,"sorrow":-2,"sorrowful":-2,"sorry":-1,"spam":-2,"spammer":-3,"spammers":-3,"spamming":-2,"spark":1,"sparkle":3,"sparkles":3,"sparkling":3,"speculative":-2,"spirit":1,"spirited":2,"spiritless":-2,"spiteful":-2,"splendid":3,"sprightly":2,"squelched":-1,"stab":-2,"stabbed":-2,"stable":2,"stabs":-2,"stall":-2,"stalled":-2,"stalling":-2,"stamina":2,"stampede":-2,"startled":-2,"starve":-2,"starved":-2,"starves":-2,"starving":-2,"steadfast":2,"steal":-2,"steals":-2,"stereotype":-2,"stereotyped":-2,"stifled":-1,"stimulate":1,"stimulated":1,"stimulates":1,"stimulating":2,"stingy":-2,"stolen":-2,"stop":-1,"stopped":-1,"stopping":-1,"stops":-1,"stout":2,"straight":1,"strange":-1,"strangely":-1,"strangled":-2,"strength":2,"strengthen":2,"strengthened":2,"strengthening":2,"strengthens":2,"stressed":-2,"stressor":-2,"stressors":-2,"stricken":-2,"strike":-1,"strikers":-2,"strikes":-1,"strong":2,"stronger":2,"strongest":2,"struck":-1,"struggle":-2,"struggled":-2,"struggles":-2,"struggling":-2,"stubborn":-2,"stuck":-2,"stunned":-2,"stunning":4,"stupid":-2,"stupidly":-2,"suave":2,"substantial":1,"substantially":1,"subversive":-2,"success":2,"successful":3,"suck":-3,"sucks":-3,"suffer":-2,"suffering":-2,"suffers":-2,"suicidal":-2,"suicide":-2,"suing":-2,"sulking":-2,"sulky":-2,"sullen":-2,"sunshine":2,"super":3,"superb":5,"superior":2,"support":2,"supported":2,"supporter":1,"supporters":1,"supporting":1,"supportive":2,"supports":2,"survived":2,"surviving":2,"survivor":2,"suspect":-1,"suspected":-1,"suspecting":-1,"suspects":-1,"suspend":-1,"suspended":-1,"suspicious":-2,"swear":-2,"swearing":-2,"swears":-2,"sweet":2,"swift":2,"swiftly":2,"swindle":-3,"swindles":-3,"swindling":-3,"sympathetic":2,"sympathy":2,"tard":-2,"tears":-2,"tender":2,"tense":-2,"tension":-1,"terrible":-3,"terribly":-3,"terrific":4,"terrified":-3,"terror":-3,"terrorize":-3,"terrorized":-3,"terrorizes":-3,"thank":2,"thankful":2,"thanks":2,"thorny":-2,"thoughtful":2,"thoughtless":-2,"threat":-2,"threaten":-2,"threatened":-2,"threatening":-2,"threatens":-2,"threats":-2,"thrilled":5,"thwart":-2,"thwarted":-2,"thwarting":-2,"thwarts":-2,"timid":-2,"timorous":-2,"tired":-2,"tits":-2,"tolerant":2,"toothless":-2,"top":2,"tops":2,"torn":-2,"torture":-4,"tortured":-4,"tortures":-4,"torturing":-4,"totalitarian":-2,"totalitarianism":-2,"tout":-2,"touted":-2,"touting":-2,"touts":-2,"tragedy":-2,"tragic":-2,"tranquil":2,"trap":-1,"trapped":-2,"trauma":-3,"traumatic":-3,"travesty":-2,"treason":-3,"treasonous":-3,"treasure":2,"treasures":2,"trembling":-2,"tremulous":-2,"tricked":-2,"trickery":-2,"triumph":4,"triumphant":4,"trouble":-2,"troubled":-2,"troubles":-2,"true":2,"trust":1,"trusted":2,"tumor":-2,"twat":-5,"ugly":-3,"unacceptable":-2,"unappreciated":-2,"unapproved":-2,"unaware":-2,"unbelievable":-1,"unbelieving":-1,"unbiased":2,"uncertain":-1,"unclear":-1,"uncomfortable":-2,"unconcerned":-2,"unconfirmed":-1,"unconvinced":-1,"uncredited":-1,"undecided":-1,"underestimate":-1,"underestimated":-1,"underestimates":-1,"underestimating":-1,"undermine":-2,"undermined":-2,"undermines":-2,"undermining":-2,"undeserving":-2,"undesirable":-2,"uneasy":-2,"unemployment":-2,"unequal":-1,"unequaled":2,"unethical":-2,"unfair":-2,"unfocused":-2,"unfulfilled":-2,"unhappy":-2,"unhealthy":-2,"unified":1,"unimpressed":-2,"unintelligent":-2,"united":1,"unjust":-2,"unlovable":-2,"unloved":-2,"unmatched":1,"unmotivated":-2,"unprofessional":-2,"unresearched":-2,"unsatisfied":-2,"unsecured":-2,"unsettled":-1,"unsophisticated":-2,"unstable":-2,"unstoppable":2,"unsupported":-2,"unsure":-1,"untarnished":2,"unwanted":-2,"unworthy":-2,"upset":-2,"upsets":-2,"upsetting":-2,"uptight":-2,"urgent":-1,"useful":2,"usefulness":2,"useless":-2,"uselessness":-2,"vague":-2,"validate":1,"validated":1,"validates":1,"validating":1,"verdict":-1,"verdicts":-1,"vested":1,"vexation":-2,"vexing":-2,"vibrant":3,"vicious":-2,"victim":-3,"victimize":-3,"victimized":-3,"victimizes":-3,"victimizing":-3,"victims":-3,"vigilant":3,"vile":-3,"vindicate":2,"vindicated":2,"vindicates":2,"vindicating":2,"violate":-2,"violated":-2,"violates":-2,"violating":-2,"violence":-3,"violent":-3,"virtuous":2,"virulent":-2,"vision":1,"visionary":3,"visioning":1,"visions":1,"vitality":3,"vitamin":1,"vitriolic":-3,"vivacious":3,"vociferous":-1,"vulnerability":-2,"vulnerable":-2,"walkout":-2,"walkouts":-2,"wanker":-3,"want":1,"war":-2,"warfare":-2,"warm":1,"warmth":2,"warn":-2,"warned":-2,"warning":-3,"warnings":-3,"warns":-2,"waste":-1,"wasted":-2,"wasting":-2,"wavering":-1,"weak":-2,"weakness":-2,"wealth":3,"wealthy":2,"weary":-2,"weep":-2,"weeping":-2,"weird":-2,"welcome":2,"welcomed":2,"welcomes":2,"whimsical":1,"whitewash":-3,"whore":-4,"wicked":-2,"widowed":-1,"willingness":2,"win":4,"winner":4,"winning":4,"wins":4,"winwin":3,"wish":1,"wishes":1,"wishing":1,"withdrawal":-3,"woebegone":-2,"woeful":-3,"won":3,"wonderful":4,"woo":3,"woohoo":3,"wooo":4,"woow":4,"worn":-1,"worried":-3,"worry":-3,"worrying":-3,"worse":-3,"worsen":-3,"worsened":-3,"worsening":-3,"worsens":-3,"worshiped":3,"worst":-3,"worth":2,"worthless":-2,"worthy":2,"wow":4,"wowow":4,"wowww":4,"wrathful":-3,"wreck":-2,"wrong":-2,"wronged":-2,"wtf":-4,"yeah":1,"yearning":1,"yeees":2,"yes":1,"youthful":2,"yucky":-2,"yummy":3,"zealot":-2,"zealots":-2,"zealous":2}
let ENV=null;

export default {

  // message structure:
  //   { 
  //     "message_id": 64,
  //    "from": {
  //       "id": 6924901817,
  //       "is_bot": false,
  //       "first_name": "Maks",
  //       "last_name": "Bober",
  //     "username": "bobererer",
  //     "language_code": "en"
  //   },
  //   "chat": {
  //     "id": -1002105029990,
  //     "title": "Haestkuk - Shia",
  //     "type": "supergroup"
  //   },
  //   "date": 1705067530,
  //   "text": "Martiner?"
  // }

  async fetch(request, env, ctx) {
    // for easy access
    ENV=env;
    if (request.method === "POST") {
      const payload = await request.json() 
      // Getting the POST request JSON payload
      if ('message' in payload && payload.message.text) { 
        let sender = payload.message.from.first_name;
        console.log("Received telegram message from chat: " + (payload.message.chat.title || sender))

        console.log("Sender: " + sender);
        
        // Checking if the payload comes from Telegram
        const chatId = payload.message.chat.id


        console.log("message is: " + payload.message.text)

        let words = to_words(payload.message.text)
        if (words.length > 10) {
            return new Response("Ok")
        }
        await hardlyfier(words, payload.message.chat.id);
        await sickomode(sender, payload.message.chat.id);
        await keywords(words,  payload.message.chat.id, payload.message.from.id);
        await youpassbutterdave(words,  payload.message.chat.id);      
      }
    }
    return new Response("OK") // Doesn't really matter
  },
};

async function call_gpt(system_prompt, message_history) {
    let messages = [{
        "role": "system",
        "content": system_prompt
    }];
    let history = message_history.map(m => ({
        "role": "user", 
        "content": m
    }));
    messages.push(...history)
    
    let response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": "Bearer " + ENV.OPEN_AI_KEY
        },
        body: JSON.stringify({
            "model": "gpt-3.5-turbo",
            "max_tokens": 40,
            "messages": messages
        })
    }).then(res => res.json())
        .then(json => json.choices[0].message.content)
        .catch(err => console.log("error from open API call: " + err))

    return response
}

async function get_affection_data() {
  const KEY = "affection_data"
  let data = await ENV.KV_STORE.get(KEY)
  if (!data) {
    data = "{}"
    await ENV.KV_STORE.put(KEY, data)
  }
  console.log("Retrieving affection data: " + data)
  data = JSON.parse(data)
  return data
}

async function store_affection_data(data) {
    data = JSON.stringify(data);
    console.log("Storing affection data: " + data)
    const KEY="affection_data"
    await ENV.KV_STORE.put(KEY, data)
}

// pick random element in array
function sample(arr) {
  if (arr.length) {
      return arr[Math.floor(Math.random() * arr.length)]
  } else {
      return null
  }
}

function to_words(message) {
  return message.split(' ').map(word => word.replace(/[^a-zA-Z0-9]/g, '').trim().toLowerCase())
}

// returns integer corresponding to the sentiment in the given word list using the AFINN list of sentiment keyword pairs
// words must be normalised to lower case
function calculate_sentiment(words) {
  if (words.length > 0) {
    console.log("Calculating sentiment for: " + words)
    let sentiment_carriers = words.map(w => AFINN[w]).filter(Boolean)
    if (sentiment_carriers.length == 0) {return 0}
    return sentiment_carriers.reduce((a, b) => a + b, 0) / sentiment_carriers.length
  } else {
    return 0
  }
}

// very funi hardly know er joke generator, returns true if the trigger was satisfied, regardless of if the action actually fired
async function hardlyfier(words, chatId) {
  let hers = words.filter(word => {
    return word.length > 2 && (word.endsWith('er') || word.endsWith('ers'));
  }) 

  // 1 - P(no triggers
  // P(no triggers) = (1 - HARDLYKNOWER_PROBABILITY)^n
  let prob = 1 - ((1 - HARDLYKNOWER_PROBABILITY) ** hers.length);
  console.log("hardly know er probability for message: " + prob);
  if (Math.random() < prob) {
    const text = sample(hers) + "? I hardly know er!!";
    await sendMessage(text, chatId)
  }
  return hers.length > 0
}

// very funi keyword reactions, scans messages for keywords and replies with pre-set phrases, returns true if the trigger was satisfied, regardless if the action actually fired
async function keywords(words, chatId, senderId) {
  let trigger = TRIGGERS.find(list => {
      let phrase = list.trigger;
      // find the phrase in sequence in the words
      // if the phrase is just one word it will still work
      let phrase_idx = 0;
      for(let i = 0; i < words.length; i++){
          if (words[i] == phrase[phrase_idx]){
              phrase_idx = phrase_idx + 1;
              if (phrase_idx == phrase.length) {
                  return true
              }
          } else {
              phrase_idx = 0;
          }
      }
  })

  if (trigger != null) {
    console.log("keyword probability for random keyword in message: " + trigger.chance);
    if (Math.random() < trigger.chance) {
        let gpt_chance = trigger.gpt_chance ? trigger.gpt_chance : KEYWORD_GPT_CHANCE 
        let affection_data = await get_affection_data();
        if(trigger.gpt_prompt && (Math.random() < gpt_chance)) {
            // TODO: get few messages before this one as well
            console.log("Calling chat gpt for this one. :)")
            let relationship_prompt = "no previous relationship";
            let affection_value = affection_data[senderId]
            let affection_level = Math.min(Math.floor(Math.abs(affection_value) / SENTIMENT_PER_AFFECTION_LEVEL), MAX_AFFECTION_LEVEL)
            console.log("Absolute affection level: " + affection_level)
            if (affection_value != null) {
                if (affection_value > 0) {
                    relationship_prompt = POSITIVE_AFFECTION_PROMPTS[affection_level - 1]    
                } else {
                    relationship_prompt = NEGATIVE_AFFECTION_PROMPTS[affection_level - 1]
                }
            }
            let response = await call_gpt(SYSTEM_PROMPT + "." + "RELATIONSHIP_SUMMARY: " + relationship_prompt + ". PROMPT: " + sample(trigger.gpt_prompt), []);
            if (response) {
                await sendMessage(response, chatId)
            } else {
                console.error("Error in calling chat gpt")
            }
        } else {
            // analyse sentiment and pick appropriate variation from the sentiment variations
            console.log("Triggered");
            let sentiment = calculate_sentiment(words)
            if (affection_data[senderId] == null) {
                affection_data[senderId] = sentiment
            } else {
                affection_data[senderId] += sentiment
            }
            await store_affection_data(affection_data);
            console.log("Sentiment: " + sentiment);
            console.log("positive variants: " + trigger.pos_sent_variations)
            console.log("negative variants: " + trigger.neg_sent_variations)
            const text = sentiment >= 0 ? sample(trigger.pos_sent_variations) : sample(trigger.neg_sent_variations)
            console.log("variant: " + text)
            await sendMessage(text, chatId)
        }
    }
  }
  return trigger != null
}

// very funi roasts aimed at sender
async function sickomode(sender, chatId) {
  let firing = Math.random() < SICKOMODE_PROBABILITY;
  if (!firing) {
    return
  }

  const sickomodes = [
    "Your favourite programming language is html.",
    "You should try Rust",
    "Get a job",
    "You have an all-powerful monopoly on the Norwegian butter market.",
    "You attained mastery of the Lithuanian language by sacrificing the mortal souls of 4 potatoes and a tablespoon of sour cream.",
    "In your spare time, you kick puppies.",
    "You don't know the difference between Java and JavaScript and are too afraid to ask.",
    "You secretly control the world supply of chickpeas through a Latvian shell corp.",
    "You are the only person in history to buy a sofa from DFS when there wasn't a sale on.",
    "You are yet to spend more than 15 minutes in Appleton Tower productively.",
    "You recently bought a slightly dented Fiat Uno from Prince Philip.",
    "You are just 4 pugs wearing a trench coat, with a mop head on top.",
    "You know two facts about ducks, and both of them are wrong.",
    "If you turn your radio to 88.4, you can hear your thoughts.",
    "You are banned from the Northampton branch of Little Chef.",
    "You are legally not allowed within 50 feet of Don Sannella.",
    "You want to declare Appleton Tower a sovereign monarchy.",
    "You were once involved in a rap battle with Piers Morgan.",
    "You prefer the Star Wars prequels to the originals.",
    "You once ate 19 slices of pizza at a CompSoc event.",
    "You think Fox News is too biased towards the Democrats.",
    "You put milk in before the water when making tea.",
    "When you watch Star Wars, you root for the Sith.",
    "There is an airport in Russia named after you.",
    "You think anti-vaxxers make some good points.",
    "You once won a BAFTA for the best original smell.",
    "You think Ada Lovelace is a type of fabric.",
    "You are banned from the county of Derbyshire.",
    "You use WikiHow instead of Stack Overflow.",
    "You once threw a microwave oven at a tramp.",
    "You have ties to Bolivian llama traffickers.",
    "You once drank milk straight from the cow.",
    "You haven't eaten a vegetable since 2008.",
    "You use proprietary software on Linux.",
    "You once punched a horse to the ground.",
    "You lick doorknobs in AT3 at night.",
    "You unplug DICE computers for fun.",
    "You don't separate your recycling.",
    "You think C is too high level.",
    "You dislike Richard Stallman.",
    "You like The Big Bang Theory.",
    "You use PHP out of choice.",
    "You actually like Brexit.",
    "You use Internet Explorer out of choice.",
    "You even use Vim.",
    "You are secretly English.",
    "You use Bing.",
    "Yeah I am sad. \
     Secretly \
     A \
     Duck",
    "https://www.youtube.com/watch?v=-BD1vHgYRgg&list=LL&index=10",
    "HAWL! I'M OAN THE NIGHT SHIFT!!!!!",
    "Not all who wonder are lost, but i sure am. <3",
    "don't mind me, i am just waiting for my dino nuggets."
  ]

  let random = Math.floor(Math.random() * sickomodes.length);

  await sendMessage(sender + ", " + sickomodes[random], chatId);
}

// returns true if the trigger was satsified
async function youpassbutterdave(words,chatId){
  const sentence = words.join(' ');
  const regex = /you pass butter dave/i; // Adding 'i' flag for case-insensitivity
  const isMatch = regex.test(sentence);
  if (isMatch){
    await sendMessage("Oh my God.", chatId);
    return true
  }
  return false;
}

async function sendMessage(msg, chatId) {
    console.log("sending message: " + msg);
    // Calling the API endpoint to send a telegram message
    const url = `https://api.telegram.org/bot${ENV.TELEGRAM_API_KEY}/sendMessage?chat_id=${chatId}&text=${msg}`
    const data = await fetch(url).then(resp => {
      console.log("Sending message went ok: " + resp.ok)
      console.log(JSON.stringify(resp, null, 4))
      return resp.json()
    }).catch(e => console.log(e));
    
  }

