-- CreateTable
CREATE TABLE "FitpassPlan" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "priceCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "durationDays" INTEGER NOT NULL,
    "features" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FitpassPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FitpassSubscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "qrValue" TEXT,
    "qrImageUrl" TEXT,
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validTo" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FitpassSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FitpassCheckin" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "checkedInAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "FitpassCheckin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FitpassPlan_code_key" ON "FitpassPlan"("code");

-- CreateIndex
CREATE UNIQUE INDEX "FitpassSubscription_qrValue_key" ON "FitpassSubscription"("qrValue");

-- CreateIndex
CREATE INDEX "FitpassSubscription_userId_status_idx" ON "FitpassSubscription"("userId", "status");

-- CreateIndex
CREATE INDEX "FitpassSubscription_planId_idx" ON "FitpassSubscription"("planId");

-- CreateIndex
CREATE INDEX "FitpassCheckin_subscriptionId_checkedInAt_idx" ON "FitpassCheckin"("subscriptionId", "checkedInAt");

-- CreateIndex
CREATE INDEX "FitpassCheckin_partnerId_checkedInAt_idx" ON "FitpassCheckin"("partnerId", "checkedInAt");

-- AddForeignKey
ALTER TABLE "FitpassSubscription" ADD CONSTRAINT "FitpassSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FitpassSubscription" ADD CONSTRAINT "FitpassSubscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "FitpassPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FitpassCheckin" ADD CONSTRAINT "FitpassCheckin_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "FitpassSubscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;
