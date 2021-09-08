export type UserDrop = {
  appVersion: string;
  appCommitHash: string;
  userAddress: string;
  cid: string;
  privateCid?: string;
  dropTitle?: string;
  ts: number;
};

export type UserJson = {
  userAddress: string;
  drops: Record<string, UserDrop>;
};

export function createUserJson(userAddress: string): UserJson {
  return {
    userAddress,
    drops: {},
  };
}
