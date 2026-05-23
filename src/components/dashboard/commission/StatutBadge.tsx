import type { CommissionStatut } from "./types";

interface StatutBadgeProps {
    statut: CommissionStatut;
    dict: Record<string, string>;
}

const statutConfig: Record<CommissionStatut, { classes: string }> = {
    ACTIVE: {
        classes: "bg-green-50 text-green-700 border border-green-200",
    },
    CONSTITUEE: {
        classes: "bg-blue-50 text-blue-700 border border-blue-200",
    },
    DISSOUTE: {
        classes: "bg-gray-100 text-gray-500 border border-gray-200",
    },
};

export default function StatutBadge({ statut, dict }: StatutBadgeProps) {
    const config = statutConfig[statut];
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.classes}`}>
            {statut === "ACTIVE" && (
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse" />
            )}
            {dict[statut]}
        </span>
    );
}
