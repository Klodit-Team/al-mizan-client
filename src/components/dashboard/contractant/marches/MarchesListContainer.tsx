import MarchesListPage from "./MarchesListPage";
import { type ServiceContractantMarcheListItem } from "@/services/tenderMarches";

interface MarchesListContainerProps {
  locale: string;
  data: ServiceContractantMarcheListItem[];
  isLoading: boolean;
}

export default function MarchesListContainer({
  locale,
  data,
  isLoading,
}: MarchesListContainerProps) {
  return <MarchesListPage locale={locale} data={data} isLoading={isLoading} />;
}
