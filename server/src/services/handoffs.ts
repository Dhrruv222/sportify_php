export type GetPresignedUploadUrlResult = { url: string; objectKey: string };

export async function getPresignedUploadUrl(
  userId: string,
  fileType: string,
): Promise<GetPresignedUploadUrlResult> {
  void userId;
  void fileType;

  return { url: "http://mock-s3/upload", objectKey: "img_001" };
}

export type SendEmailVars = Record<
  string,
  string | number | boolean | null | undefined
>;

export async function sendEmail(
  to: string,
  template: string,
  vars: SendEmailVars,
): Promise<void> {
  // Stub only: real SES implementation arrives later.
  // Keep signature stable for Dev 1.
  console.log("[sendEmail stub]", { to, template, vars });
}

export type UserSubscription = {
  plan: string;
  status: string;
  qrUrl: string;
  validTo?: string;
};

export async function getUserSubscription(
  userId: string,
): Promise<UserSubscription> {
  void userId;

  return { plan: "gold", status: "active", qrUrl: "" };
}

export async function generateQRCode(
  subscriptionId: string,
): Promise<{ qrImageUrl: string }> {
  void subscriptionId;

  return { qrImageUrl: "http://mock/qr.png" };
}

export type ScoutScoreResult = {
  score: number; // 0-100
  breakdown: Record<string, number>;
};

export async function computeScoutScore(
  playerId: string,
  statsObj: unknown,
): Promise<ScoutScoreResult> {
  void playerId;
  void statsObj;

  return { score: 75, breakdown: { pace: 80, tech: 70 } };
}

export type GetArticlesParams = {
  locale: string;
  page?: number;
  limit?: number;
};

export type NewsArticle = {
  id: string | number;
  title: string;
  locale: string;
};

export async function getArticles(
  params: GetArticlesParams,
): Promise<NewsArticle[]> {
  void params;

  return [{ id: 1, title: "Mock news", locale: "en" }];
}

