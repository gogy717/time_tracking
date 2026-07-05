import DomainDetailClientPage from "@/components/domains/DomainDetailClientPage";

type Props = { params: Promise<{ id: string }> };

export default async function DomainDetailPage({ params }: Props) {
  const { id } = await params;
  return <DomainDetailClientPage domainId={id} />;
}
