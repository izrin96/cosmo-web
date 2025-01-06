import { CosmoPublicUser, CosmoSearchResult } from "@/lib/universal/cosmo/auth";
import { cosmo } from "../http";

export async function search(token: string, query: string) {
  return await cosmo<CosmoSearchResult>("/user/v1/search", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    query: {
      query,
    },
  });
}

export type RefreshTokenResult = {
  refreshToken: string;
  accessToken: string;
};

export async function refresh(
  refreshToken: string
): Promise<RefreshTokenResult> {
  return await cosmo<{ credentials: RefreshTokenResult }>("/auth/v1/refresh", {
    method: "POST",
    body: { refreshToken },
  }).then((res) => res.credentials);
}

export async function fetchByNickname(
  token: string,
  nickname: string
): Promise<CosmoPublicUser | undefined> {
  return await cosmo<{ profile: CosmoPublicUser }>(
    `/user/v1/by-nickname/${nickname}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )
    .then((res) => res.profile)
    .catch(() => undefined);
}