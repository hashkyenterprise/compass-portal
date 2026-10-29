import { defaultCatalogLocations, defaultCatalogServices } from "./catalog";
import type { Settings } from "./types";

export const defaultSettings: Settings = {
  clinicName: "Compass Drug Screening of West Michigan",
  clinicPhone: "616.828.1415",
  clinicEmail: "info@screenwithcompass.com",
  clinicAddress: "3108 Glade St., Muskegon Heights, MI 49444",
  timezone: "America/Detroit",
  emailFromName: "Compass Drug Screening",
  emailFromAddress: "results@screenwithcompass.com",
  emailReplyTo: "info@screenwithcompass.com",
  smtpHost: "smtp.gmail.com",
  smtpPort: "587",
  smtpUser: "results@screenwithcompass.com",
  smtpConnected: false,
  resultsSubject: "Confidential screening results — {{lastName}} ({{visitNumber}})",
  resultsBody: `Hello,

Please find attached the screening results for {{fullName}} ({{visitNumber}}).

Service: {{service}}
Visit date: {{visitDate}}
Attachment: {{attachment}}

IMPORTANT DISCLAIMER
Screening results are not a medical diagnosis, do not replace evaluation by a licensed healthcare provider, and are provided solely for screening, compliance, or legal purposes.

Electronic delivery may carry certain risks, including unauthorized access, despite reasonable safeguards. Once results are delivered to the designated email address, Compass Drug Screening is not responsible for the security of that email account or any further distribution.

{{clinicName}}
{{clinicAddress}}
{{clinicPhone}}
`,
  qbConnected: false,
  qbCompany: "Compass Drug Screening of WM",
  qbRealmId: "",
  qbLastSync: null,
  qbMatchBy: "visit",
  services: defaultCatalogServices,
  locations: defaultCatalogLocations,
};
