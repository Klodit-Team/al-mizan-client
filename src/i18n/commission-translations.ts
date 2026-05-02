// Translations for all 4 commission pages
// Usage: const t = commissionTranslations[locale]

export const commissionTranslations = {
  fr: {
    // Shared
    commissionBadge: "Commission d'Évaluation",
    voirClassement: "Voir classement",
    enregistrerSuivant: "Enregistrer et Suivant",
    soumissionPrecedente: "Soumission Précédente",
    enregistre: "Enregistré",

    // CommissionDashboard
    dashboard: {
      titre: (ref: string) => `Évaluation : ${ref}`,
      phase: "Phase d'évaluation",
      globalProgress: (n: number) => `Progression globale : ${n}%`,
      phases: [
        { numero: 1, label: "Éligibilité" },
        { numero: 2, label: "Évaluation Technique" },
        { numero: 3, label: "Évaluation Financière" },
      ],
      statuts: {
        terminee: "Terminée",
        en_cours: "En cours",
        verrouillee: "Verrouillée",
      },
      detail: {
        terminee: (n: number, t: number) => `${n}/${t} dossiers vérifiés`,
        en_cours: (n: number, t: number) => `${n}/${t} soumissions notées`,
        verrouillee: "En attente de la validation technique…",
      },
      actions: {
        voirResultats: "Voir les résultats",
        continuer: "Continuer la notation",
        nonAccessible: "Non accessible",
      },
    },

    // CommissionEvaluationPage
    evaluation: {
      titre: "Notation Technique",
      soumissionLabel: (ref: string) => `Soumission: ${ref}`,
      anonymisee: "(Anonymisée)",
      scoreActuel: (n: number) => `Score actuel: ${n} / 100`,
      ponderation: (n: number) => `Pondération: ${n}%`,
      noteEliminatoire: (n: number, max: number) => `Note éliminatoire < ${n}/${max}`,
      noteLabel: "Note attribuée (0-100):",
      justifLabel: "Justification:",
      justifPlaceholder: "Expliquez votre note…",
      iaPanel: {
        titre: "Assistant IA Al-Mizan",
        sousTitre: "Analyse basée sur les documents techniques soumis.",
        suggestion: (n: number) => `Suggestion IA - Note: ${n}/100`,
        confiance: (n: number) => `Confiance: ${n}%`,
        critereLabel: (i: number, label: string) => `Critère ${i} · ${label}`,
        noteSuggeree: (n: number) => `Note suggérée : ${n}/100`,
        confianceLabel: (n: number) => `Confiance : ${n}%`,
      },
    },

    // CommissionClassementPage
    classement: {
      titre: "Validation & Classement Final",
      genererRapport: "Générer Rapport d'Évaluation",
      sousTitre: (id: string) => `Classement Final : ${id}`,
      etape: "Étape 3/3 : Délibération et attribution",
      stats: {
        traites: "Soumissions Traitées",
        rejetees: "Rejetées (Technique/Admin)",
        eligibles: "Éligibles (Financière)",
      },
      table: {
        titre: "Comparaison: Commission vs IA",
        sousTitre: "Les écarts de plus de 10 points sont mis en surbrillance.",
        cols: ["RANG", "OPÉRATEUR", "SCORE GLOBAL (COMMISSION)", "SCORE GLOBAL (IA)", "ÉCART", "RECOMMANDATION IA", "DÉCISION FINALE"],
      },
      rangs: { premier: "1er", nieme: (n: number) => `${n}ème` },
      divergence: "DIVERGENCE",
      recs: { retenir: "Retenir", analyser: "Analyser Plus", eliminer: "Eliminer" },
      decisions: {
        retenir: "Retenir",
        attente: "En attente",
        elimine: "Éliminer",
      },
      quorum: "Toutes les notes ont été saisies par le quorum (5/5 membres).",
      validerBtn: "Valider la Délibération (Irréversible)",
      valide: "Délibération validée avec succès",
      retourEval: "Retour à l'évaluation",
      confirmTitre: "Valider la Délibération (Irréversible)",
      confirmTexte: "Cette action est définitive et irréversible. Les décisions seront enregistrées et les soumissionnaires seront notifiés. Confirmez-vous la validation ?",
      annuler: "Annuler",
      confirmer: "Confirmer",
    },

    // DocumentValidationPage
    document: {
      titre: "Vérification Documentaire",
      dossierTitre: (id: string) => `Dossier Administratif : ${id}`,
      operateur: "Opérateur : TechSolutions SPA",
      ocrTitre: "Analyse IA (OCR & NLP)",
      scoreConformite: (n: number) => `Score de Conformité: ${n}%`,
      donneesExtraites: "DONNÉES EXTRAITES",
      anomalieAucune: "Aucune anomalie détectée. Le document correspond aux exigences du cahier des charges.",
      decisionTitre: "Décision du vérificateur :",
      refuser: "Refuser la pièce",
      valider: "Valider la pièce (Conforme)",
      commentairePlaceholder: "Commentaire optionnel…",
      enregistrer: "Enregistrer les décisions",
      enregistreSuccess: "Décisions enregistrées",
      zoomIn: "Zoom avant",
      zoomOut: "Zoom arrière",
      telecharger: "Télécharger",
      apercu: "Aperçu du PDF généré ici",
    },
  },

  ar: {
    // Shared
    commissionBadge: "لجنة التقييم",
    voirClassement: "عرض الترتيب",
    enregistrerSuivant: "حفظ والتالي",
    soumissionPrecedente: "العرض السابق",
    enregistre: "تم الحفظ",

    // CommissionDashboard
    dashboard: {
      titre: (ref: string) => `تقييم : ${ref}`,
      phase: "مرحلة التقييم",
      globalProgress: (n: number) => `التقدم الإجمالي : ${n}%`,
      phases: [
        { numero: 1, label: "التأهيل" },
        { numero: 2, label: "التقييم التقني" },
        { numero: 3, label: "التقييم المالي" },
      ],
      statuts: {
        terminee: "مكتملة",
        en_cours: "جارية",
        verrouillee: "مقفلة",
      },
      detail: {
        terminee: (n: number, t: number) => `تم التحقق من ${n}/${t} ملفات`,
        en_cours: (n: number, t: number) => `تم تنقيط ${n}/${t} عروض`,
        verrouillee: "في انتظار التحقق التقني…",
      },
      actions: {
        voirResultats: "عرض النتائج",
        continuer: "متابعة التنقيط",
        nonAccessible: "غير متاح",
      },
    },

    // CommissionEvaluationPage
    evaluation: {
      titre: "التنقيط التقني",
      soumissionLabel: (ref: string) => `العرض: ${ref}`,
      anonymisee: "(مجهول الهوية)",
      scoreActuel: (n: number) => `النتيجة الحالية: ${n} / 100`,
      ponderation: (n: number) => `الوزن: ${n}%`,
      noteEliminatoire: (n: number, max: number) => `نقطة الإقصاء < ${n}/${max}`,
      noteLabel: "النقطة الممنوحة (0-100):",
      justifLabel: "التبرير:",
      justifPlaceholder: "اشرح نقطتك…",
      iaPanel: {
        titre: "مساعد الذكاء الاصطناعي Al-Mizan",
        sousTitre: "تحليل مبني على الوثائق التقنية المقدمة.",
        suggestion: (n: number) => `اقتراح الذكاء الاصطناعي — النقطة: ${n}/100`,
        confiance: (n: number) => `الثقة: ${n}%`,
        critereLabel: (i: number, label: string) => `المعيار ${i} · ${label}`,
        noteSuggeree: (n: number) => `النقطة المقترحة : ${n}/100`,
        confianceLabel: (n: number) => `الثقة : ${n}%`,
      },
    },

    // CommissionClassementPage
    classement: {
      titre: "التحقق والترتيب النهائي",
      genererRapport: "إنشاء تقرير التقييم",
      sousTitre: (id: string) => `الترتيب النهائي : ${id}`,
      etape: "المرحلة 3/3 : المداولة والإسناد",
      stats: {
        traites: "العروض المعالجة",
        rejetees: "المرفوضة (تقني/إداري)",
        eligibles: "المؤهلة (مالية)",
      },
      table: {
        titre: "مقارنة: اللجنة مقابل الذكاء الاصطناعي",
        sousTitre: "الفوارق التي تتجاوز 10 نقاط يتم إبرازها.",
        cols: ["الرتبة", "المتعامل", "النتيجة الإجمالية (اللجنة)", "النتيجة الإجمالية (ذ.ا)", "الفارق", "توصية الذكاء الاصطناعي", "القرار النهائي"],
      },
      rangs: { premier: "الأول", nieme: (n: number) => `${n}` },
      divergence: "تباين",
      recs: { retenir: "الاحتفاظ", analyser: "مزيد تحليل", eliminer: "إقصاء" },
      decisions: {
        retenir: "الاحتفاظ",
        attente: "قيد الانتظار",
        elimine: "إقصاء",
      },
      quorum: "تم إدخال جميع النقاط من قِبَل النصاب القانوني (5/5 أعضاء).",
      validerBtn: "التحقق من المداولة (لا رجوع فيه)",
      valide: "تمت المصادقة على المداولة بنجاح",
      retourEval: "العودة إلى التقييم",
      confirmTitre: "التحقق من المداولة (لا رجوع فيه)",
      confirmTexte: "هذا الإجراء نهائي ولا يمكن التراجع عنه. سيتم تسجيل القرارات وإخطار المتعاملين. هل تؤكد التحقق؟",
      annuler: "إلغاء",
      confirmer: "تأكيد",
    },

    // DocumentValidationPage
    document: {
      titre: "التحقق من الوثائق",
      dossierTitre: (id: string) => `الملف الإداري : ${id}`,
      operateur: "المتعامل : TechSolutions SPA",
      ocrTitre: "تحليل الذكاء الاصطناعي (OCR & NLP)",
      scoreConformite: (n: number) => `نسبة المطابقة: ${n}%`,
      donneesExtraites: "البيانات المستخرجة",
      anomalieAucune: "لم يتم رصد أي شذوذ. الوثيقة مطابقة لمتطلبات دفتر الشروط.",
      decisionTitre: "قرار المدقق :",
      refuser: "رفض الوثيقة",
      valider: "قبول الوثيقة (مطابقة)",
      commentairePlaceholder: "ملاحظة اختيارية…",
      enregistrer: "حفظ القرارات",
      enregistreSuccess: "تم حفظ القرارات",
      zoomIn: "تكبير",
      zoomOut: "تصغير",
      telecharger: "تحميل",
      apercu: "معاينة ملف PDF هنا",
    },
  },
} as const;

export type CommissionTranslations = typeof commissionTranslations["fr"];