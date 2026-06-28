import { graphGet } from "../graph";
import type { Check } from "../types";

interface SharePointSettings {
  sharingCapability?: string;
}

/** Flags org-wide SharePoint/OneDrive sharing that is more permissive than org-only. */
export const sharePointSharing: Check = {
  id: "hygiene.sharing",
  category: "hygiene",
  async run({ token }) {
    const settings = await graphGet<SharePointSettings>(
      token,
      "/admin/sharepoint/settings",
    );
    const capability = settings[0]?.sharingCapability;
    if (!capability || capability === "disabled") return [];

    if (capability === "externalUserAndGuestSharing") {
      return [
        {
          category: "hygiene",
          checkId: sharePointSharing.id,
          severity: "high",
          title: "Guest and external SharePoint sharing enabled org-wide",
          description:
            "SharePoint/OneDrive allows guest and external sharing org-wide, increasing data-leak risk.",
          remediation:
            "Set sharing to 'Only people in your organization' or limit guest links in SharePoint admin > Policies > Sharing.",
        },
      ];
    }

    if (capability === "externalUserSharingOnly") {
      return [
        {
          category: "hygiene",
          checkId: sharePointSharing.id,
          severity: "medium",
          title: "External SharePoint sharing enabled org-wide",
          description:
            "SharePoint/OneDrive allows authenticated external sharing org-wide. Confirm this matches your data policy.",
          remediation:
            "Review external sharing scope in SharePoint admin > Policies > Sharing and restrict if not required.",
        },
      ];
    }

    if (capability === "existingExternalUserSharingOnly") {
      return [
        {
          category: "hygiene",
          checkId: sharePointSharing.id,
          severity: "low",
          title: "Existing external SharePoint collaborators can be re-invited org-wide",
          description:
            "SharePoint sharing allows existing external users to access shared content. Review whether tighter controls are needed.",
          remediation:
            "Review SharePoint admin > Policies > Sharing and consider org-only sharing for sensitive data.",
        },
      ];
    }

    return [];
  },
};
