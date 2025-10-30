import { NextResponse } from "next/server";
import { Client, AccountId } from "@hashgraph/sdk";

export async function GET() {
  const accountId = process.env.HEDERA_ACCOUNT_ID;
  const privateKey = process.env.HEDERA_PRIVATE_KEY;
  const network = (process.env.HEDERA_NETWORK || "testnet") as
    | "testnet"
    | "mainnet";

  if (!accountId || !privateKey) {
    return NextResponse.json({
      status: "disabled",
      reason: "Hedera credentials not configured",
      sdkImported: true,
    });
  }

  let client: Client | null = null;
  try {
    // Construct client (demonstrates SDK usage); avoid paid queries
    client = network === "mainnet" ? Client.forMainnet() : Client.forTestnet();
    client.setOperator(AccountId.fromString(accountId), privateKey);

    // Safe no-op: retrieve the network name from configured client
    const networkName = network;

    return NextResponse.json({
      status: "ok",
      sdkImported: true,
      network: networkName,
      operatorAccountId: accountId,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ status: "error", message }, { status: 500 });
  } finally {
    if (client) {
      client.close();
    }
  }
}
