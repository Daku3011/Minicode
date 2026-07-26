import api from "./api";

interface TeamProfileData {
  bio?: string;
  skills?: string[];
  looking_for_team?: boolean;
  [key: string]: unknown;
}

interface TeamRequestData {
  title: string;
  description?: string;
  required_skills?: string[];
  [key: string]: unknown;
}

export const teamApi = {
    getProfile: () => api.get("/team-formation/profile").then((r) => r.data),

    saveProfile: (data: TeamProfileData) =>
        api.post("/team-formation/profile", data).then((r) => r.data),

    listRequests: (status?: string) =>
        api.get("/team-formation/requests", { params: { status } }).then((r) => r.data),

    getRequest: (id: number) =>
        api.get(`/team-formation/requests/${id}`).then((r) => r.data),

    createRequest: (data: TeamRequestData) =>
        api.post("/team-formation/requests", data).then((r) => r.data),

    apply: (requestId: number, message?: string) =>
        api
            .post(`/team-formation/requests/${requestId}/apply`, { message })
            .then((r) => r.data),

    respond: (requestId: number, appId: number, action: string) =>
        api
            .post(
                `/team-formation/requests/${requestId}/applications/${appId}/respond`,
                { action }
            )
            .then((r) => r.data),

    match: () => api.get("/team-formation/match").then((r) => r.data),
};
