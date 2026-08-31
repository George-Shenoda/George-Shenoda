export { projects, type Project } from "./projects";
export { theme, type Theme } from "./theme";
export {
  submitContact,
  isValidEmail,
  type ContactPayload,
  type ContactResult,
} from "./contact-client";
export {
  createOutbox,
  createLocalStorageStorage,
  type Outbox,
  type OutboxItem,
  type OutboxStorage,
  type FlushResult,
} from "./outbox";
export {
  cv,
  type Cv,
  type CvProfile,
  type CvLink,
  type CvExperience,
  type CvEducation,
  type CvProject,
  type CvSkillGroup,
  type CvCertification,
  type CvLanguage,
} from "./cv";
