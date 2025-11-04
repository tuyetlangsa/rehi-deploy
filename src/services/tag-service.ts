import { http } from "@/lib/http";

export interface CreateTagRequest {
  name: string;
  createAt: number;
}

export const TagService = {
  async createTag(request: CreateTagRequest) {
    return http.post("/tags", request);
  },
  async deleteTag(name: string, updateAt: number) {
    return http.delete(`/tags/${encodeURIComponent(name)}/${updateAt}`);
  },
};
