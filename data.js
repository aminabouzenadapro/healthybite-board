/* HealthyBite board — plan content and interface text.
   Edit the 7-week plan in WEEKS. Every text is { en, fr, ar }. */

const ROLES = {
  coord:   { icon: "🧭", color: "#2f7d4f", t: { en: "Coordinator", fr: "Coordinateur·rice", ar: "المنسق(ة)" } },
  content: { icon: "✍️", color: "#c2410c", t: { en: "Content pair", fr: "Binôme contenu", ar: "ثنائي المحتوى" } },
  visuals: { icon: "📸", color: "#7c3aed", t: { en: "Visuals pair", fr: "Binôme visuels", ar: "ثنائي المرئيات" } },
  data:    { icon: "📊", color: "#0369a1", t: { en: "Client & data pair", fr: "Binôme client & données", ar: "ثنائي العميل والبيانات" } },
};
/* 7 seats, one per member. Rotation: member i sits in seat (i + week - 1) % 7,
   so over 7 weeks everyone is Coordinator once and sits in every pair. */
const SEATS = ["coord", "content", "content", "visuals", "visuals", "data", "data"];

const PHASES = {
  1: { t: { en: "Phase 1 · Practice", fr: "Phase 1 · Entraînement", ar: "المرحلة 1 · التدريب" }, weeks: [1, 2] },
  2: { t: { en: "Phase 2 · Real client", fr: "Phase 2 · Vrai client", ar: "المرحلة 2 · عميل حقيقي" }, weeks: [3, 4, 5, 6, 7] },
};

const WEEKS = [
  {
    n: 1, phase: 1,
    focus: { en: "Set up the practice brand and shoot products", fr: "Lancer la marque d'entraînement et photographier les produits", ar: "إطلاق علامة التدريب وتصوير المنتجات" },
    lesson: { en: "Phone product photography & how Instagram/Facebook pages work", fr: "Photo produit au téléphone & fonctionnement des pages Instagram/Facebook", ar: "تصوير المنتجات بالهاتف وكيف تعمل صفحات إنستغرام وفيسبوك" },
    tasks: {
      coord: [
        { en: "Set up the board, roles and session agenda", fr: "Préparer le tableau, les rôles et l'agenda de séance", ar: "إعداد اللوحة والأدوار وجدول الجلسة" },
        { en: "Create the practice Instagram & Facebook page", fr: "Créer la page Instagram & Facebook d'entraînement", ar: "إنشاء صفحة التدريب على إنستغرام وفيسبوك" },
      ],
      content: [
        { en: "Write the practice page bio and 5 practice captions", fr: "Écrire la bio de la page et 5 légendes d'entraînement", ar: "كتابة نبذة الصفحة و5 تعليقات تدريبية" },
      ],
      visuals: [
        { en: "Shoot 20 product photos (natural light, clean background)", fr: "Prendre 20 photos produits (lumière naturelle, fond propre)", ar: "التقاط 20 صورة منتجات (ضوء طبيعي، خلفية نظيفة)" },
        { en: "Start the Canva template kit: post, story, highlight covers", fr: "Démarrer le kit Canva : post, story, couvertures à la une", ar: "بدء مجموعة قوالب كانفا: منشور، ستوري، أغلفة القصص المميزة" },
      ],
      data: [
        { en: "List 15 healthy food sellers in Algeria to pitch", fr: "Lister 15 vendeurs d'alimentation saine en Algérie à démarcher", ar: "إعداد قائمة بـ15 بائع أغذية صحية في الجزائر للتواصل معهم" },
        { en: "Set up the post tracking sheet", fr: "Mettre en place le tableau de suivi des posts", ar: "إعداد جدول متابعة المنشورات" },
      ],
    },
    done: [
      { en: "Practice page created on Instagram and Facebook", fr: "Page d'entraînement créée sur Instagram et Facebook", ar: "تم إنشاء صفحة التدريب على إنستغرام وفيسبوك" },
      { en: "20 product photos shot and sorted", fr: "20 photos produits prises et triées", ar: "تم التقاط وترتيب 20 صورة منتجات" },
      { en: "Canva kit started (3 templates)", fr: "Kit Canva démarré (3 modèles)", ar: "بدء مجموعة كانفا (3 قوالب)" },
      { en: "List of 15 sellers ready", fr: "Liste de 15 vendeurs prête", ar: "قائمة 15 بائعًا جاهزة" },
      { en: "Handoff note written for week 2", fr: "Note de passation écrite pour la semaine 2", ar: "كتابة ملاحظة التسليم للأسبوع 2" },
    ],
  },
  {
    n: 2, phase: 1,
    focus: { en: "Finish the kit, build the showcase site, pitch sellers", fr: "Finir le kit, créer le site vitrine, démarcher les vendeurs", ar: "إنهاء القوالب، بناء موقع العرض، التواصل مع البائعين" },
    lesson: { en: "Pitching small sellers & building a one-page website", fr: "Démarcher les petits vendeurs & créer un site d'une page", ar: "كيف نعرض خدماتنا على البائعين الصغار وننشئ موقعًا من صفحة واحدة" },
    tasks: {
      coord: [
        { en: "Build the one-page showcase website (Google Sites or Carrd)", fr: "Créer le site vitrine d'une page (Google Sites ou Carrd)", ar: "بناء موقع العرض من صفحة واحدة (Google Sites أو Carrd)" },
      ],
      content: [
        { en: "Write the pitch message (WhatsApp / DM) and the website text", fr: "Écrire le message de démarchage (WhatsApp / DM) et les textes du site", ar: "كتابة رسالة العرض (واتساب / رسائل) ونصوص الموقع" },
        { en: "Publish 6 practice posts", fr: "Publier 6 posts d'entraînement", ar: "نشر 6 منشورات تدريبية" },
      ],
      visuals: [
        { en: "Finish the Canva template kit", fr: "Terminer le kit de modèles Canva", ar: "إنهاء مجموعة قوالب كانفا" },
        { en: "Edit 2 practice Reels in CapCut", fr: "Monter 2 Reels d'entraînement sur CapCut", ar: "مونتاج 2 ريلز تدريبية على CapCut" },
      ],
      data: [
        { en: "Pitch 10–15 sellers and log every reply in the pipeline", fr: "Démarcher 10–15 vendeurs et noter chaque réponse dans le suivi", ar: "التواصل مع 10–15 بائعًا وتسجيل كل رد في المتابعة" },
      ],
    },
    done: [
      { en: "Showcase website online", fr: "Site vitrine en ligne", ar: "موقع العرض منشور على الإنترنت" },
      { en: "Canva kit finished", fr: "Kit Canva terminé", ar: "مجموعة كانفا مكتملة" },
      { en: "6 practice posts and 2 Reels published", fr: "6 posts et 2 Reels d'entraînement publiés", ar: "نشر 6 منشورات و2 ريلز تدريبية" },
      { en: "10–15 sellers pitched", fr: "10–15 vendeurs démarchés", ar: "تم التواصل مع 10–15 بائعًا" },
      { en: "At least 2 meetings booked", fr: "Au moins 2 rendez-vous fixés", ar: "تحديد موعدين على الأقل" },
    ],
  },
  {
    n: 3, phase: 2,
    focus: { en: "Sign the pilot client and record the baseline", fr: "Signer le client pilote et relever le point de départ", ar: "التعاقد مع العميل التجريبي وتسجيل نقطة البداية" },
    lesson: { en: "Onboarding a client & measuring a starting point", fr: "Accueillir un client & mesurer un point de départ", ar: "استقبال العميل وقياس نقطة البداية" },
    tasks: {
      coord: [
        { en: "Run the client meeting and agree the scope in writing (WhatsApp)", fr: "Mener le rendez-vous client et valider le périmètre par écrit (WhatsApp)", ar: "إدارة لقاء العميل والاتفاق على نطاق العمل كتابيًا (واتساب)" },
      ],
      content: [
        { en: "Draft the 3-week content calendar", fr: "Rédiger le calendrier de contenu sur 3 semaines", ar: "إعداد مسودة رزنامة المحتوى لـ3 أسابيع" },
      ],
      visuals: [
        { en: "Shoot the client's products and adapt the Canva kit to their brand", fr: "Photographier les produits du client et adapter le kit Canva à sa marque", ar: "تصوير منتجات العميل وتكييف قوالب كانفا مع علامته" },
      ],
      data: [
        { en: "Record the baseline: followers, average reach, likes, messages per week", fr: "Relever le point de départ : abonnés, portée moyenne, j'aime, messages par semaine", ar: "تسجيل نقطة البداية: المتابعون، متوسط الوصول، الإعجابات، الرسائل أسبوعيًا" },
      ],
    },
    done: [
      { en: "1–2 pilot clients signed", fr: "1–2 clients pilotes signés", ar: "التعاقد مع 1–2 عميل تجريبي" },
      { en: "Baseline numbers recorded", fr: "Chiffres de départ relevés", ar: "تسجيل أرقام البداية" },
      { en: "Content calendar approved by the client", fr: "Calendrier de contenu validé par le client", ar: "موافقة العميل على رزنامة المحتوى" },
      { en: "Client products photographed", fr: "Produits du client photographiés", ar: "تصوير منتجات العميل" },
    ],
  },
  {
    n: 4, phase: 2,
    focus: { en: "Create and publish batch 1", fr: "Créer et publier le lot 1", ar: "إنتاج ونشر الدفعة الأولى" },
    lesson: { en: "Captions that sell — without health claims", fr: "Des légendes qui vendent — sans allégations santé", ar: "تعليقات تبيع — دون ادعاءات صحية" },
    tasks: {
      coord: [
        { en: "Get the client's approval for batch 1", fr: "Obtenir la validation du client pour le lot 1", ar: "الحصول على موافقة العميل على الدفعة الأولى" },
      ],
      content: [
        { en: "Write batch 1 captions and pass the no-health-claims check", fr: "Écrire les légendes du lot 1 et passer le contrôle sans allégations santé", ar: "كتابة تعليقات الدفعة الأولى واجتياز فحص عدم الادعاءات الصحية" },
      ],
      visuals: [
        { en: "Design batch 1 posts and 1 Reel", fr: "Créer les visuels du lot 1 et 1 Reel", ar: "تصميم منشورات الدفعة الأولى وريل واحد" },
      ],
      data: [
        { en: "Schedule batch 1 in Meta Business Suite and log each post", fr: "Programmer le lot 1 dans Meta Business Suite et noter chaque post", ar: "جدولة الدفعة الأولى في Meta Business Suite وتسجيل كل منشور" },
      ],
    },
    done: [
      { en: "Batch 1 designed", fr: "Lot 1 créé", ar: "تصميم الدفعة الأولى" },
      { en: "Every caption passed the no-health-claims check", fr: "Chaque légende a passé le contrôle sans allégations santé", ar: "اجتياز كل التعليقات لفحص الادعاءات الصحية" },
      { en: "Client approved batch 1", fr: "Le client a validé le lot 1", ar: "موافقة العميل على الدفعة الأولى" },
      { en: "Batch 1 scheduled or published", fr: "Lot 1 programmé ou publié", ar: "جدولة أو نشر الدفعة الأولى" },
    ],
  },
  {
    n: 5, phase: 2,
    focus: { en: "Catalog page and batch 2", fr: "Page catalogue et lot 2", ar: "صفحة الكتالوج والدفعة الثانية" },
    lesson: { en: "Product catalogs & ordering through WhatsApp", fr: "Catalogues produits & commandes via WhatsApp", ar: "كتالوج المنتجات والطلب عبر واتساب" },
    tasks: {
      coord: [
        { en: "Review batch 1 results with the client", fr: "Faire le point sur les résultats du lot 1 avec le client", ar: "مراجعة نتائج الدفعة الأولى مع العميل" },
      ],
      content: [
        { en: "Write the catalog text and batch 2 captions", fr: "Écrire les textes du catalogue et les légendes du lot 2", ar: "كتابة نصوص الكتالوج وتعليقات الدفعة الثانية" },
      ],
      visuals: [
        { en: "Build the catalog page and design batch 2", fr: "Créer la page catalogue et les visuels du lot 2", ar: "بناء صفحة الكتالوج وتصميم الدفعة الثانية" },
      ],
      data: [
        { en: "Log batch 1 numbers and schedule batch 2", fr: "Noter les chiffres du lot 1 et programmer le lot 2", ar: "تسجيل أرقام الدفعة الأولى وجدولة الدفعة الثانية" },
      ],
    },
    done: [
      { en: "Catalog page online", fr: "Page catalogue en ligne", ar: "صفحة الكتالوج منشورة" },
      { en: "Batch 2 approved and scheduled", fr: "Lot 2 validé et programmé", ar: "الموافقة على الدفعة الثانية وجدولتها" },
      { en: "Batch 1 numbers logged", fr: "Chiffres du lot 1 notés", ar: "تسجيل أرقام الدفعة الأولى" },
    ],
  },
  {
    n: 6, phase: 2,
    focus: { en: "Measure against the baseline", fr: "Mesurer par rapport au point de départ", ar: "القياس مقارنة بنقطة البداية" },
    lesson: { en: "Reading Meta insights & simple charts", fr: "Lire les statistiques Meta & graphiques simples", ar: "قراءة إحصائيات ميتا والرسوم البيانية البسيطة" },
    tasks: {
      coord: [
        { en: "Plan the case study structure", fr: "Construire le plan de l'étude de cas", ar: "تخطيط هيكل دراسة الحالة" },
      ],
      content: [
        { en: "Draft the case study story", fr: "Rédiger le récit de l'étude de cas", ar: "كتابة مسودة قصة دراسة الحالة" },
      ],
      visuals: [
        { en: "Make before/after visuals and charts", fr: "Créer les visuels avant/après et les graphiques", ar: "إعداد صور قبل/بعد والرسوم البيانية" },
      ],
      data: [
        { en: "Compare the current numbers with the baseline", fr: "Comparer les chiffres actuels au point de départ", ar: "مقارنة الأرقام الحالية بنقطة البداية" },
      ],
    },
    done: [
      { en: "All published posts logged", fr: "Tous les posts publiés sont notés", ar: "تسجيل كل المنشورات المنشورة" },
      { en: "Baseline vs. current table complete", fr: "Tableau départ vs. actuel complet", ar: "اكتمال جدول البداية مقابل الحالي" },
      { en: "Case study draft ready", fr: "Brouillon de l'étude de cas prêt", ar: "مسودة دراسة الحالة جاهزة" },
    ],
  },
  {
    n: 7, phase: 2,
    focus: { en: "Case study, lessons learned and final presentation", fr: "Étude de cas, leçons apprises et présentation finale", ar: "دراسة الحالة والدروس المستفادة والعرض النهائي" },
    lesson: { en: "Presenting results to a client", fr: "Présenter des résultats à un client", ar: "عرض النتائج على العميل" },
    tasks: {
      coord: [
        { en: "Rehearse the final presentation", fr: "Répéter la présentation finale", ar: "التدرب على العرض النهائي" },
      ],
      content: [
        { en: "Write the lessons-learned report", fr: "Rédiger le rapport des leçons apprises", ar: "كتابة تقرير الدروس المستفادة" },
      ],
      visuals: [
        { en: "Design the case study and presentation slides", fr: "Mettre en page l'étude de cas et les slides", ar: "تصميم دراسة الحالة وشرائح العرض" },
      ],
      data: [
        { en: "Hand over files and numbers to the client", fr: "Remettre les fichiers et les chiffres au client", ar: "تسليم الملفات والأرقام للعميل" },
      ],
    },
    done: [
      { en: "Case study finished", fr: "Étude de cas terminée", ar: "اكتمال دراسة الحالة" },
      { en: "Lessons-learned report finished", fr: "Rapport des leçons apprises terminé", ar: "اكتمال تقرير الدروس المستفادة" },
      { en: "Final presentation given", fr: "Présentation finale faite", ar: "تقديم العرض النهائي" },
      { en: "Files handed over to the client", fr: "Fichiers remis au client", ar: "تسليم الملفات للعميل" },
    ],
  },
];

/* The 3-hour in-person session. Minutes per block. */
const AGENDA = [
  { min: 15,  t: { en: "Recap & handoff", fr: "Récap & passation", ar: "مراجعة وتسليم" } },
  { min: 30,  t: { en: "Lesson", fr: "Leçon", ar: "الدرس" } },
  { min: 105, t: { en: "Pair work", fr: "Travail en binômes", ar: "العمل في ثنائيات" } },
  { min: 30,  t: { en: "Presentation", fr: "Présentation", ar: "العرض" } },
];

/* Caption review: every content card must pass this before Done. */
const CLAIM_CHECKS = [
  { en: "No claim that it cures, treats or prevents an illness", fr: "Aucune affirmation qu'il guérit, soigne ou prévient une maladie", ar: "لا ادعاء بأنه يعالج أو يشفي أو يقي من مرض" },
  { en: "No weight-loss or body promises", fr: "Aucune promesse de perte de poids ou de silhouette", ar: "لا وعود بإنقاص الوزن أو تغيير الجسم" },
  { en: "No doctor or medical wording", fr: "Aucun vocabulaire médical ou de médecin", ar: "لا مصطلحات طبية أو ذكر للأطباء" },
  { en: "Ingredients and prices checked with the seller", fr: "Ingrédients et prix vérifiés avec le vendeur", ar: "التحقق من المكونات والأسعار مع البائع" },
  { en: "Client approved the caption", fr: "Le client a validé la légende", ar: "وافق العميل على التعليق" },
];
/* Words that trigger a warning in captions (lowercase, any language). */
const CLAIM_WORDS = [
  "cure", "cures", "heal", "heals", "treat", "treats", "prevent", "prevents", "disease", "diabetes", "diabetic", "cholesterol",
  "blood pressure", "cancer", "weight loss", "lose weight", "burn fat", "fat burning", "detox", "immunity", "immune", "medical",
  "doctor", "miracle", "slimming", "guaranteed",
  "guérit", "guérir", "soigne", "soigner", "prévient", "maladie", "diabète", "cholestérol", "tension artérielle", "maigrir",
  "perte de poids", "minceur", "brûle les graisses", "brûler les graisses", "détox", "immunité", "médical", "médecin", "miracle", "garanti",
  "يعالج", "علاج", "شفاء", "يشفي", "مرض", "السكري", "الكوليسترول", "ضغط الدم", "السرطان", "تخسيس", "التنحيف", "حرق الدهون",
  "ديتوكس", "المناعة", "معجزة", "طبيب",
];

const SELLER_STAGES = ["todo", "contacted", "replied", "meeting", "signed", "no"];

const SEED_RISKS = [
  { risk: { en: "No seller signs by week 3", fr: "Aucun vendeur ne signe avant la semaine 3", ar: "لا يتعاقد أي بائع قبل الأسبوع 3" }, level: "high",
    plan: { en: "Pitch 15 sellers in week 2; keep the practice page as a backup client", fr: "Démarcher 15 vendeurs en semaine 2 ; garder la page d'entraînement comme client de secours", ar: "التواصل مع 15 بائعًا في الأسبوع 2؛ الإبقاء على صفحة التدريب كعميل احتياطي" } },
  { risk: { en: "Client is slow to approve posts", fr: "Le client tarde à valider les posts", ar: "تأخر العميل في الموافقة على المنشورات" }, level: "medium",
    plan: { en: "Send batches 3 days early on WhatsApp with a clear deadline", fr: "Envoyer les lots 3 jours à l'avance sur WhatsApp avec une date limite", ar: "إرسال الدفعات قبل 3 أيام عبر واتساب مع موعد نهائي واضح" } },
  { risk: { en: "A caption makes a health claim", fr: "Une légende contient une allégation santé", ar: "تعليق يحتوي على ادعاء صحي" }, level: "high",
    plan: { en: "Every content card goes through the Review column and the checklist", fr: "Chaque carte contenu passe par la colonne Relecture et la checklist", ar: "تمر كل بطاقة محتوى بعمود المراجعة وقائمة التحقق" } },
  { risk: { en: "A member misses a session", fr: "Un membre rate une séance", ar: "غياب أحد الأعضاء عن جلسة" }, level: "medium",
    plan: { en: "Handoff note every week; the pair partner covers the task", fr: "Note de passation chaque semaine ; le binôme reprend la tâche", ar: "ملاحظة تسليم كل أسبوع؛ الشريك في الثنائي يغطي المهمة" } },
  { risk: { en: "Low engagement on posts", fr: "Faible engagement sur les posts", ar: "تفاعل ضعيف مع المنشورات" }, level: "low",
    plan: { en: "Test Reels vs. photos and posting times; compare in the Posts tab", fr: "Tester Reels vs. photos et horaires ; comparer dans l'onglet Posts", ar: "تجربة الريلز مقابل الصور وأوقات النشر؛ المقارنة في تبويب المنشورات" } },
];

const I18N = {
  en: {
    tagline: "Team board", week: "Week", weekN: "Week {n}", phase: "Phase",
    tab_week: "This week", tab_board: "Board", tab_session: "Session", tab_posts: "Posts", tab_sellers: "Sellers",
    tab_budget: "Budget", tab_risks: "Risks", tab_settings: "Settings",
    sync_local: "Saved on this device", sync_live: "Live · shared with the team", sync_connecting: "Connecting…", sync_error: "Sync error",
    focus: "Focus", lesson: "Lesson", team_this_week: "Who does what this week", tasks_by_role: "Tasks by role",
    done_by_end: "Done by the end of the session", cards_progress: "Board cards this week", handoff: "Handoff notes",
    handoff_done: "What we finished", handoff_left: "What's left for next week's team", handoff_between: "Client & data: between sessions",
    handoff_hint: "Saved automatically when you click outside the box.",
    col_todo: "To do", col_doing: "Doing", col_review: "Review", col_done: "Done",
    all_weeks: "All weeks", all_roles: "All roles", all_people: "Everyone", search: "Search cards…", new_card: "New card",
    add: "Add", edit: "Edit", delete: "Delete", save: "Save", cancel: "Cancel", close: "Close", confirm_delete: "Delete this?",
    title: "Title", description: "Description", role: "Role", assignee: "Assigned to", auto_role: "Role holders that week", due: "Due date",
    type: "Type", type_task: "Task", type_content: "Content (caption)", caption: "Caption", status: "Status",
    claims_review: "No-health-claims review", claims_flagged: "Words to check:", claims_ok: "Passed — ready to publish",
    claims_block: "This caption hasn't passed the no-health-claims review. Tick every check and remove flagged words before moving it to Done.",
    claims_pending: "Review needed", move_to: "Move to", comments: "Comments",
    timer_title: "Session timer", start: "Start", pause: "Pause", reset: "Reset", next_block: "Next block", total: "Total",
    remaining: "remaining", timer_shared: "The timer is shared: everyone sees the same clock.",
    between_log: "Between-sessions log", between_hint: "Client & data pair: about 15 minutes each between sessions.",
    date: "Date", who: "Who", what: "What was done",
    posts_title: "Post tracking", account: "Account", post: "Post", format: "Format", reach: "Reach", likes: "Likes",
    saves: "Saves", messages: "Messages", totals: "Totals", add_row: "Add row",
    baseline_title: "Baseline vs. current", baseline: "Baseline", current: "Current", change: "Change",
    followers: "Followers", avg_reach: "Average reach", avg_likes: "Average likes", msgs_week: "Messages / week",
    add_client: "Add client", client_name: "Client name", practice_page: "Practice page",
    sellers_title: "Seller pitch pipeline", sellers_goal: "Goal: pitch 10–15 sellers, sign 1–2 pilot clients.", new_seller: "New seller",
    stage_todo: "To contact", stage_contacted: "Contacted", stage_replied: "Replied", stage_meeting: "Meeting", stage_signed: "Signed", stage_no: "Not now",
    pitched: "Pitched", seller_name: "Shop name", contact: "Contact (Instagram / phone)", city: "City", products: "Products", notes: "Notes",
    budget_title: "Budget", budget_limit: "Budget limit (DZD)", item: "Item", category: "Category", amount: "Amount (DZD)", paid_by: "Paid by",
    spent: "Spent", left: "Left",
    risks_title: "Risks", risk: "Risk", level: "Level", plan: "What we do about it", owner: "Owner",
    level_low: "Low", level_medium: "Medium", level_high: "High", open: "Open", closed: "Closed",
    members: "Team members", members_hint: "Roles rotate automatically every week from this order.", start_date: "Date of the week 1 session",
    current_week: "Current week", auto: "Automatic (from the date)",
    sharing: "Live sharing (Firebase)", sharing_on: "Live sharing is on. Team space:", sharing_off: "Live sharing is off. Data stays in this browser until Firebase is set up — see README.md.",
    paste_config: "Firebase config (paste the firebaseConfig object)", team_space: "Team space name", connect: "Connect", disconnect: "Use this device only",
    backup: "Backup", export: "Export file", import: "Import file", reset_plan: "Reset to the HealthyBite plan",
    confirm_reset: "This erases every card, post and note and reloads the original plan. Continue?",
    imported: "Imported.", empty: "Nothing here yet.", rule_banner: "Rule: never make health claims in content.",
    of: "of", none: "—",
  },
  fr: {
    tagline: "Tableau d'équipe", week: "Semaine", weekN: "Semaine {n}", phase: "Phase",
    tab_week: "Cette semaine", tab_board: "Tableau", tab_session: "Séance", tab_posts: "Posts", tab_sellers: "Vendeurs",
    tab_budget: "Budget", tab_risks: "Risques", tab_settings: "Réglages",
    sync_local: "Enregistré sur cet appareil", sync_live: "En direct · partagé avec l'équipe", sync_connecting: "Connexion…", sync_error: "Erreur de synchro",
    focus: "Objectif", lesson: "Leçon", team_this_week: "Qui fait quoi cette semaine", tasks_by_role: "Tâches par rôle",
    done_by_end: "Fait à la fin de la séance", cards_progress: "Cartes de la semaine", handoff: "Notes de passation",
    handoff_done: "Ce que nous avons terminé", handoff_left: "Ce qui reste pour l'équipe suivante", handoff_between: "Client & données : entre les séances",
    handoff_hint: "Enregistré automatiquement quand vous cliquez en dehors.",
    col_todo: "À faire", col_doing: "En cours", col_review: "Relecture", col_done: "Terminé",
    all_weeks: "Toutes les semaines", all_roles: "Tous les rôles", all_people: "Tout le monde", search: "Chercher…", new_card: "Nouvelle carte",
    add: "Ajouter", edit: "Modifier", delete: "Supprimer", save: "Enregistrer", cancel: "Annuler", close: "Fermer", confirm_delete: "Supprimer ?",
    title: "Titre", description: "Description", role: "Rôle", assignee: "Assigné à", auto_role: "Titulaires du rôle cette semaine", due: "Échéance",
    type: "Type", type_task: "Tâche", type_content: "Contenu (légende)", caption: "Légende", status: "Statut",
    claims_review: "Contrôle sans allégations santé", claims_flagged: "Mots à vérifier :", claims_ok: "Validé — prêt à publier",
    claims_block: "Cette légende n'a pas passé le contrôle sans allégations santé. Cochez chaque point et retirez les mots signalés avant de la passer en Terminé.",
    claims_pending: "Contrôle requis", move_to: "Déplacer vers", comments: "Commentaires",
    timer_title: "Minuteur de séance", start: "Démarrer", pause: "Pause", reset: "Réinitialiser", next_block: "Bloc suivant", total: "Total",
    remaining: "restant", timer_shared: "Le minuteur est partagé : tout le monde voit la même horloge.",
    between_log: "Journal entre les séances", between_hint: "Binôme client & données : environ 15 minutes chacun entre les séances.",
    date: "Date", who: "Qui", what: "Ce qui a été fait",
    posts_title: "Suivi des posts", account: "Compte", post: "Post", format: "Format", reach: "Portée", likes: "J'aime",
    saves: "Enregistrements", messages: "Messages", totals: "Totaux", add_row: "Ajouter une ligne",
    baseline_title: "Départ vs. actuel", baseline: "Départ", current: "Actuel", change: "Évolution",
    followers: "Abonnés", avg_reach: "Portée moyenne", avg_likes: "J'aime moyens", msgs_week: "Messages / semaine",
    add_client: "Ajouter un client", client_name: "Nom du client", practice_page: "Page d'entraînement",
    sellers_title: "Suivi du démarchage", sellers_goal: "Objectif : démarcher 10–15 vendeurs, signer 1–2 clients pilotes.", new_seller: "Nouveau vendeur",
    stage_todo: "À contacter", stage_contacted: "Contacté", stage_replied: "A répondu", stage_meeting: "Rendez-vous", stage_signed: "Signé", stage_no: "Pas pour l'instant",
    pitched: "Démarchés", seller_name: "Nom de la boutique", contact: "Contact (Instagram / téléphone)", city: "Ville", products: "Produits", notes: "Notes",
    budget_title: "Budget", budget_limit: "Plafond (DZD)", item: "Dépense", category: "Catégorie", amount: "Montant (DZD)", paid_by: "Payé par",
    spent: "Dépensé", left: "Reste",
    risks_title: "Risques", risk: "Risque", level: "Niveau", plan: "Ce que nous faisons", owner: "Responsable",
    level_low: "Faible", level_medium: "Moyen", level_high: "Élevé", open: "Ouvert", closed: "Clos",
    members: "Membres de l'équipe", members_hint: "Les rôles tournent automatiquement chaque semaine selon cet ordre.", start_date: "Date de la séance de la semaine 1",
    current_week: "Semaine en cours", auto: "Automatique (selon la date)",
    sharing: "Partage en direct (Firebase)", sharing_on: "Le partage en direct est actif. Espace d'équipe :", sharing_off: "Le partage en direct est désactivé. Les données restent dans ce navigateur jusqu'à la configuration de Firebase — voir README.md.",
    paste_config: "Config Firebase (collez l'objet firebaseConfig)", team_space: "Nom de l'espace d'équipe", connect: "Connecter", disconnect: "Cet appareil uniquement",
    backup: "Sauvegarde", export: "Exporter", import: "Importer", reset_plan: "Revenir au plan HealthyBite",
    confirm_reset: "Cela efface toutes les cartes, posts et notes et recharge le plan d'origine. Continuer ?",
    imported: "Importé.", empty: "Rien pour l'instant.", rule_banner: "Règle : jamais d'allégations santé dans le contenu.",
    of: "sur", none: "—",
  },
  ar: {
    tagline: "لوحة الفريق", week: "الأسبوع", weekN: "الأسبوع {n}", phase: "المرحلة",
    tab_week: "هذا الأسبوع", tab_board: "اللوحة", tab_session: "الجلسة", tab_posts: "المنشورات", tab_sellers: "البائعون",
    tab_budget: "الميزانية", tab_risks: "المخاطر", tab_settings: "الإعدادات",
    sync_local: "محفوظ على هذا الجهاز", sync_live: "مباشر · مشترك مع الفريق", sync_connecting: "جارٍ الاتصال…", sync_error: "خطأ في المزامنة",
    focus: "الهدف", lesson: "الدرس", team_this_week: "من يفعل ماذا هذا الأسبوع", tasks_by_role: "المهام حسب الدور",
    done_by_end: "منجز بنهاية الجلسة", cards_progress: "بطاقات هذا الأسبوع", handoff: "ملاحظات التسليم",
    handoff_done: "ما أنجزناه", handoff_left: "ما تبقى لفريق الأسبوع القادم", handoff_between: "العميل والبيانات: بين الجلسات",
    handoff_hint: "يُحفظ تلقائيًا عند النقر خارج المربع.",
    col_todo: "للإنجاز", col_doing: "قيد التنفيذ", col_review: "مراجعة", col_done: "منجز",
    all_weeks: "كل الأسابيع", all_roles: "كل الأدوار", all_people: "الجميع", search: "ابحث في البطاقات…", new_card: "بطاقة جديدة",
    add: "إضافة", edit: "تعديل", delete: "حذف", save: "حفظ", cancel: "إلغاء", close: "إغلاق", confirm_delete: "حذف هذا العنصر؟",
    title: "العنوان", description: "الوصف", role: "الدور", assignee: "مسندة إلى", auto_role: "أصحاب الدور هذا الأسبوع", due: "تاريخ التسليم",
    type: "النوع", type_task: "مهمة", type_content: "محتوى (تعليق)", caption: "التعليق", status: "الحالة",
    claims_review: "فحص عدم الادعاءات الصحية", claims_flagged: "كلمات يجب مراجعتها:", claims_ok: "تم الاجتياز — جاهز للنشر",
    claims_block: "لم يجتز هذا التعليق فحص الادعاءات الصحية. أكمل كل نقاط التحقق واحذف الكلمات المنبَّه عليها قبل نقله إلى منجز.",
    claims_pending: "يحتاج مراجعة", move_to: "نقل إلى", comments: "تعليقات",
    timer_title: "مؤقت الجلسة", start: "ابدأ", pause: "إيقاف مؤقت", reset: "إعادة", next_block: "الجزء التالي", total: "المجموع",
    remaining: "متبقٍ", timer_shared: "المؤقت مشترك: يرى الجميع نفس الساعة.",
    between_log: "سجل ما بين الجلسات", between_hint: "ثنائي العميل والبيانات: حوالي 15 دقيقة لكل واحد بين الجلسات.",
    date: "التاريخ", who: "من", what: "ما تم إنجازه",
    posts_title: "متابعة المنشورات", account: "الحساب", post: "المنشور", format: "الصيغة", reach: "الوصول", likes: "الإعجابات",
    saves: "الحفظ", messages: "الرسائل", totals: "المجموع", add_row: "إضافة سطر",
    baseline_title: "البداية مقابل الحالي", baseline: "البداية", current: "الحالي", change: "التغير",
    followers: "المتابعون", avg_reach: "متوسط الوصول", avg_likes: "متوسط الإعجابات", msgs_week: "الرسائل / أسبوع",
    add_client: "إضافة عميل", client_name: "اسم العميل", practice_page: "صفحة التدريب",
    sellers_title: "متابعة التواصل مع البائعين", sellers_goal: "الهدف: التواصل مع 10–15 بائعًا والتعاقد مع 1–2 عميل تجريبي.", new_seller: "بائع جديد",
    stage_todo: "للتواصل", stage_contacted: "تم التواصل", stage_replied: "ردّ", stage_meeting: "موعد", stage_signed: "تم التعاقد", stage_no: "ليس الآن",
    pitched: "تم التواصل معهم", seller_name: "اسم المتجر", contact: "التواصل (إنستغرام / هاتف)", city: "المدينة", products: "المنتجات", notes: "ملاحظات",
    budget_title: "الميزانية", budget_limit: "سقف الميزانية (دج)", item: "البند", category: "الفئة", amount: "المبلغ (دج)", paid_by: "دفعه",
    spent: "المصروف", left: "المتبقي",
    risks_title: "المخاطر", risk: "الخطر", level: "المستوى", plan: "ما نفعله حياله", owner: "المسؤول",
    level_low: "منخفض", level_medium: "متوسط", level_high: "مرتفع", open: "مفتوح", closed: "مغلق",
    members: "أعضاء الفريق", members_hint: "تتناوب الأدوار تلقائيًا كل أسبوع حسب هذا الترتيب.", start_date: "تاريخ جلسة الأسبوع 1",
    current_week: "الأسبوع الحالي", auto: "تلقائي (حسب التاريخ)",
    sharing: "المشاركة المباشرة (Firebase)", sharing_on: "المشاركة المباشرة مفعلة. مساحة الفريق:", sharing_off: "المشاركة المباشرة غير مفعلة. تبقى البيانات في هذا المتصفح حتى إعداد Firebase — راجع README.md.",
    paste_config: "إعدادات Firebase (الصق كائن firebaseConfig)", team_space: "اسم مساحة الفريق", connect: "اتصال", disconnect: "هذا الجهاز فقط",
    backup: "نسخة احتياطية", export: "تصدير ملف", import: "استيراد ملف", reset_plan: "العودة إلى خطة HealthyBite",
    confirm_reset: "سيؤدي هذا إلى حذف كل البطاقات والمنشورات والملاحظات وإعادة تحميل الخطة الأصلية. متابعة؟",
    imported: "تم الاستيراد.", empty: "لا شيء هنا بعد.", rule_banner: "قاعدة: لا ادعاءات صحية أبدًا في المحتوى.",
    of: "من", none: "—",
  },
};

/* What each week hands in. Teams submit links and photos; the week's Coordinator approves.
   Editable from the app (Week page → Edit week plan). */
const DELIVERABLES = {
  1: [
    { en: "Practice page link (Instagram / Facebook)", fr: "Lien de la page d'entraînement (Instagram / Facebook)", ar: "رابط صفحة التدريب (إنستغرام / فيسبوك)" },
    { en: "20 product photos (Drive folder + best shots)", fr: "20 photos produits (dossier Drive + meilleures photos)", ar: "20 صورة منتجات (مجلد درايف + أفضل الصور)" },
    { en: "Canva kit v1 (3 templates)", fr: "Kit Canva v1 (3 modèles)", ar: "مجموعة كانفا الأولى (3 قوالب)" },
    { en: "List of 15 sellers", fr: "Liste de 15 vendeurs", ar: "قائمة 15 بائعًا" },
  ],
  2: [
    { en: "Showcase website link", fr: "Lien du site vitrine", ar: "رابط موقع العرض" },
    { en: "Final Canva kit", fr: "Kit Canva final", ar: "مجموعة كانفا النهائية" },
    { en: "6 practice posts and 2 Reels (links)", fr: "6 posts et 2 Reels d'entraînement (liens)", ar: "6 منشورات و2 ريلز تدريبية (روابط)" },
    { en: "Pitch message and seller replies", fr: "Message de démarchage et réponses des vendeurs", ar: "رسالة العرض وردود البائعين" },
  ],
  3: [
    { en: "Client agreement (WhatsApp screenshot)", fr: "Accord du client (capture WhatsApp)", ar: "موافقة العميل (لقطة شاشة واتساب)" },
    { en: "Baseline numbers (Insights screenshots)", fr: "Chiffres de départ (captures des statistiques)", ar: "أرقام البداية (لقطات الإحصائيات)" },
    { en: "3-week content calendar", fr: "Calendrier de contenu sur 3 semaines", ar: "رزنامة المحتوى لـ3 أسابيع" },
    { en: "Client product photos", fr: "Photos des produits du client", ar: "صور منتجات العميل" },
  ],
  4: [
    { en: "Batch 1 designs", fr: "Visuels du lot 1", ar: "تصاميم الدفعة الأولى" },
    { en: "Batch 1 captions (checked: no health claims)", fr: "Légendes du lot 1 (contrôlées : sans allégations santé)", ar: "تعليقات الدفعة الأولى (بدون ادعاءات صحية)" },
    { en: "Client approval (screenshot)", fr: "Validation du client (capture)", ar: "موافقة العميل (لقطة شاشة)" },
    { en: "Scheduled posts in Meta Business Suite (screenshot)", fr: "Posts programmés dans Meta Business Suite (capture)", ar: "المنشورات المجدولة في Meta Business Suite (لقطة شاشة)" },
  ],
  5: [
    { en: "Catalog page link", fr: "Lien de la page catalogue", ar: "رابط صفحة الكتالوج" },
    { en: "Batch 2 designs and captions", fr: "Visuels et légendes du lot 2", ar: "تصاميم وتعليقات الدفعة الثانية" },
    { en: "Batch 1 results (Insights screenshots)", fr: "Résultats du lot 1 (captures des statistiques)", ar: "نتائج الدفعة الأولى (لقطات الإحصائيات)" },
  ],
  6: [
    { en: "Baseline vs. current comparison", fr: "Comparaison départ vs. actuel", ar: "مقارنة البداية بالحالي" },
    { en: "Case study draft", fr: "Brouillon de l'étude de cas", ar: "مسودة دراسة الحالة" },
  ],
  7: [
    { en: "Final case study", fr: "Étude de cas finale", ar: "دراسة الحالة النهائية" },
    { en: "Lessons-learned report", fr: "Rapport des leçons apprises", ar: "تقرير الدروس المستفادة" },
    { en: "Final presentation slides", fr: "Slides de la présentation finale", ar: "شرائح العرض النهائي" },
  ],
};

Object.assign(I18N.en, {
  nav_dashboard: "Dashboard", tab_deliverables: "Deliverables", weeks: "Weeks", workspace: "Workspace", tracking: "Tracking",
  hello: "Hi, {name}", hello_anon: "Welcome to HealthyBite", week_of_7: "Week {n} of 7",
  your_role: "Your role this week", with: "with", your_tasks: "Your tasks this week", no_tasks_you: "No open tasks for you this week.",
  needs_review: "Waiting for review", nothing_to_review: "Nothing waiting for review.", project_progress: "Project progress",
  tasks_done: "Tasks done", deliv_approved: "Deliverables approved", posts_logged: "Posts logged", open_week: "Open week",
  start_session: "Start session", who_are_you: "Who are you?", who_hint: "Pick your name so your submissions, reviews and comments are signed. Saved on this device only.",
  switch_user: "Change", not_set: "Pick your name", edit_plan: "Edit week plan", plan_saved: "Week plan saved.",
  add_item: "Add", add_task: "Add a task", add_task_ph: "New task, then Enter", subtasks: "Subtasks", add_subtask: "Add a subtask, then Enter",
  checklist: "Checklist", expected_deliverables: "Deliverables to submit", deliv_missing: "Not submitted", deliv_submitted: "Waiting for review",
  deliv_approved_s: "Approved", deliv_changes: "Needs changes", submit: "Submit", resubmit: "Edit & resubmit", approve: "Approve",
  request_changes: "Ask for changes", review_comment: "Comment for the team (optional)", links: "Links", link_ph: "https://… (Canva, Drive, Instagram…)",
  add_link: "Add link", photos: "Photos", add_photos: "Add photos", photos_hint: "Up to 6 photos, compressed automatically. For PDFs or videos, paste a Google Drive link.",
  submitted_by: "Submitted by", reviewer: "Reviewer", coordinator_reviews: "Week {n} Coordinator reviews: {name}", other_deliverable: "Other deliverable",
  deliv_title: "Deliverable", all_status: "All statuses", history: "History", ev_submitted: "submitted", ev_approved: "approved", ev_changes: "asked for changes",
  compressing: "Compressing photos…", photo_limit: "Up to 6 photos per deliverable.", photo_failed: "This photo could not be saved.",
  focus_ph: "What this week is about", lesson_ph: "Lesson of the session", other_tasks: "Other tasks",
  open: "Open", menu: "Menu", new_task: "New task", saving: "Saving…",
});
Object.assign(I18N.fr, {
  nav_dashboard: "Tableau de bord", tab_deliverables: "Livrables", weeks: "Semaines", workspace: "Espace de travail", tracking: "Suivi",
  hello: "Salut, {name}", hello_anon: "Bienvenue sur HealthyBite", week_of_7: "Semaine {n} sur 7",
  your_role: "Ton rôle cette semaine", with: "avec", your_tasks: "Tes tâches cette semaine", no_tasks_you: "Aucune tâche ouverte pour toi cette semaine.",
  needs_review: "En attente de validation", nothing_to_review: "Rien en attente de validation.", project_progress: "Avancement du projet",
  tasks_done: "Tâches terminées", deliv_approved: "Livrables validés", posts_logged: "Posts suivis", open_week: "Ouvrir la semaine",
  start_session: "Lancer la séance", who_are_you: "Qui es-tu ?", who_hint: "Choisis ton nom pour signer tes livrables, validations et commentaires. Enregistré sur cet appareil uniquement.",
  switch_user: "Changer", not_set: "Choisis ton nom", edit_plan: "Modifier le plan", plan_saved: "Plan de la semaine enregistré.",
  add_item: "Ajouter", add_task: "Ajouter une tâche", add_task_ph: "Nouvelle tâche, puis Entrée", subtasks: "Sous-tâches", add_subtask: "Ajouter une sous-tâche, puis Entrée",
  checklist: "Checklist", expected_deliverables: "Livrables à rendre", deliv_missing: "Non rendu", deliv_submitted: "En attente de validation",
  deliv_approved_s: "Validé", deliv_changes: "À corriger", submit: "Rendre", resubmit: "Modifier et rendre", approve: "Valider",
  request_changes: "Demander des corrections", review_comment: "Commentaire pour l'équipe (facultatif)", links: "Liens", link_ph: "https://… (Canva, Drive, Instagram…)",
  add_link: "Ajouter un lien", photos: "Photos", add_photos: "Ajouter des photos", photos_hint: "Jusqu'à 6 photos, compressées automatiquement. Pour un PDF ou une vidéo, colle un lien Google Drive.",
  submitted_by: "Rendu par", reviewer: "Validé par", coordinator_reviews: "Coordination de la semaine {n} : {name}", other_deliverable: "Autre livrable",
  deliv_title: "Livrable", all_status: "Tous les statuts", history: "Historique", ev_submitted: "a rendu", ev_approved: "a validé", ev_changes: "a demandé des corrections",
  compressing: "Compression des photos…", photo_limit: "Jusqu'à 6 photos par livrable.", photo_failed: "Cette photo n'a pas pu être enregistrée.",
  focus_ph: "Le sujet de la semaine", lesson_ph: "Leçon de la séance", other_tasks: "Autres tâches",
  open: "Ouvrir", menu: "Menu", new_task: "Nouvelle tâche", saving: "Enregistrement…",
});
Object.assign(I18N.ar, {
  nav_dashboard: "الرئيسية", tab_deliverables: "التسليمات", weeks: "الأسابيع", workspace: "مساحة العمل", tracking: "المتابعة",
  hello: "مرحبًا، {name}", hello_anon: "مرحبًا بك في HealthyBite", week_of_7: "الأسبوع {n} من 7",
  your_role: "دورك هذا الأسبوع", with: "مع", your_tasks: "مهامك هذا الأسبوع", no_tasks_you: "لا مهام مفتوحة لك هذا الأسبوع.",
  needs_review: "بانتظار المراجعة", nothing_to_review: "لا شيء بانتظار المراجعة.", project_progress: "تقدم المشروع",
  tasks_done: "المهام المنجزة", deliv_approved: "التسليمات المعتمدة", posts_logged: "المنشورات المسجلة", open_week: "فتح الأسبوع",
  start_session: "بدء الجلسة", who_are_you: "من أنت؟", who_hint: "اختر اسمك لتوقيع تسليماتك ومراجعاتك وتعليقاتك. يُحفظ على هذا الجهاز فقط.",
  switch_user: "تغيير", not_set: "اختر اسمك", edit_plan: "تعديل خطة الأسبوع", plan_saved: "تم حفظ خطة الأسبوع.",
  add_item: "إضافة", add_task: "إضافة مهمة", add_task_ph: "مهمة جديدة ثم Enter", subtasks: "مهام فرعية", add_subtask: "أضف مهمة فرعية ثم Enter",
  checklist: "قائمة التحقق", expected_deliverables: "التسليمات المطلوبة", deliv_missing: "لم يُسلَّم", deliv_submitted: "بانتظار المراجعة",
  deliv_approved_s: "معتمد", deliv_changes: "يحتاج تعديلات", submit: "تسليم", resubmit: "تعديل وإعادة التسليم", approve: "اعتماد",
  request_changes: "طلب تعديلات", review_comment: "تعليق للفريق (اختياري)", links: "الروابط", link_ph: "https://… (كانفا، درايف، إنستغرام…)",
  add_link: "إضافة رابط", photos: "الصور", add_photos: "إضافة صور", photos_hint: "حتى 6 صور، تُضغط تلقائيًا. لملفات PDF أو الفيديو، ألصق رابط Google Drive.",
  submitted_by: "سلّمه", reviewer: "المراجِع", coordinator_reviews: "منسق الأسبوع {n} يراجع: {name}", other_deliverable: "تسليم آخر",
  deliv_title: "التسليم", all_status: "كل الحالات", history: "السجل", ev_submitted: "سلّم", ev_approved: "اعتمد", ev_changes: "طلب تعديلات",
  compressing: "جارٍ ضغط الصور…", photo_limit: "حتى 6 صور لكل تسليم.", photo_failed: "تعذّر حفظ هذه الصورة.",
  focus_ph: "موضوع هذا الأسبوع", lesson_ph: "درس الجلسة", other_tasks: "مهام أخرى",
  open: "فتح", menu: "القائمة", new_task: "مهمة جديدة", saving: "جارٍ الحفظ…",
});
