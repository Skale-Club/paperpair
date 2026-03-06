import { EvidenceWall } from "@/components/evidence-wall";
import { SecureRouteLock } from "@/components/secure-route-lock";

export default function EvidencePage() {
  return (
    <SecureRouteLock>
      <EvidenceWall />
    </SecureRouteLock>
  );
}
