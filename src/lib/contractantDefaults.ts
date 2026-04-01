export const defaultServiceContractantDashboardDict = {
  header: {
    title: "Tableau de Bord",
    subtitle:
      "Gerez vos procedures de commande publique en toute transparence.",
    createButton: "Creer une Nouvelle AO",
    notifications: "Notifications",
    logout: "Se deconnecter",
  },
  summary: {
    activeAos: "AOs Actifs",
    pendingAttributions: "Attributions en attente",
    openRecours: "Recours ouverts",
    ongoingMarches: "Marches en cours",
  },
  quickActions: {
    title: "Actions Rapides",
    createAo: "Nouvel AO",
    myAos: "Mes AO",
    commissions: "Commissions",
  },
  recentActivity: {
    title: "Activite Recente",
    viewAll: "Voir tout",
    empty: "Aucune activite recente.",
  },
  alerts: {
    title: "Alertes IA Al-Mizan",
    empty: "Aucune alerte en cours.",
    deadlinesTitle: "Echeances prochaines (48h)",
  },
  support: {
    title: "Support & Guide",
    guide: "Guide des procedures 2024",
    contact: "Contacter le support technique",
  },
  errorLoading: "Impossible de charger les donnees du tableau de bord.",
};

export type ServiceContractantDashboardDict =
  typeof defaultServiceContractantDashboardDict;

export const defaultTendersListDict = {
  title: "Mes Appels d'Offres",
  createBtn: "Creer une Nouvelle AO",
  searchPlaceholder: "Rechercher par reference ou objet...",
  filters: {
    status: "Statut",
    all: "Tous",
    draft: "Brouillon",
    published: "Publie",
    ongoing: "En cours",
    evaluation: "Evaluation",
    awarded: "Attribue",
    cancelled: "Annule",
    dateStart: "Date debut",
    dateEnd: "Date fin",
    reset: "Reinitialiser",
  },
  table: {
    reference: "Reference",
    object: "Objet",
    type: "Type",
    deadline: "Date limite depot",
    status: "Statut",
    actions: "Actions",
  },
  actions: {
    view: "Voir les details",
    edit: "Modifier",
    changeStatus: "Changer le statut",
    delete: "Supprimer",
  },
  empty: "Aucun appel d'offres trouve.",
  types: {
    open: "Ouvert",
    restricted: "Restreint",
    direct: "Gre a gre",
  },
  aoCreation: {
    createTitle: "Creer un Appel d'Offres",
    stepPrefix: "Etape",
    stepOn: "sur",
    stepTitles: [
      "Informations Generales",
      "Lots",
      "CDC",
      "Eligibilite",
      "Evaluation",
      "Revision et Publication",
    ],
    buttons: {
      next: "Etape suivante",
      back: "Retour",
      saveDraft: "Enregistrer en brouillon",
      saveAsDraft: "Sauvegarder en brouillon",
      publishAo: "Publier AO",
      publishCdc: "Publier CDC",
      uploadFile: "Upload fichier",
      replaceFile: "Remplacer le fichier",
      downloadCdc: "Telecharger CDC",
    },
    review: {
      title: "Etape 6: Revision et Publication",
      subtitle: "Verification finale des informations avant publication.",
      validationChecks: "Controles de validation",
      generalInfo: "Informations generales",
      statusPublished: "Publie",
      statusUnpublished: "Non publie",
    },
    messages: {
      draftSaved: "Brouillon enregistre avec succes.",
      publishBlockedPrefix: "Impossible de publier:",
      publishSuccessPrefix: "AO publie avec succes. Avis genere:",
    },
  },
};

export type TendersListDict = typeof defaultTendersListDict;
