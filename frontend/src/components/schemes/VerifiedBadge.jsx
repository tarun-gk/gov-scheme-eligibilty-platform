import { CheckCircle, AlertCircle } from "lucide-react";

export default function VerifiedBadge({ verified }) {
  return verified ? (
    <span className="badge-success">
      <CheckCircle className="h-3.5 w-3.5" />
      Verified
    </span>
  ) : (
    <span className="badge-neutral">
      <AlertCircle className="h-3.5 w-3.5" />
      Unverified
    </span>
  );
}
