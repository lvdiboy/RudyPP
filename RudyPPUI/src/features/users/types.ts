/** One item of GET /api/users. The backend returns only these two fields. */
export type UserSummary = {
  userName: string;
  fullName: string;
};

/** The parts of Spring's Page JSON the UI uses. pageNumber ("number") is zero-based. */
export type Page<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
};
