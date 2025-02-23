"use client";

import { useWallet } from "@/context/WalletContext";
import { Button } from "@/components/ui/button";

export function ConnectWallet() {
  const { account, connectWallet, disconnectWallet } = useWallet();

  return (
    <div>
      {!account ? (
        <Button
          onClick={connectWallet}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          Connect Wallet
        </Button>
      ) : (
        <div className="flex items-center space-x-2">
          <p className="text-sm">
            {account.slice(0, 6)}...{account.slice(-4)}
          </p>
          <Button
            onClick={disconnectWallet}
            variant="outline"
            className="hover:bg-destructive/90 hover:text-destructive-foreground"
          >
            Disconnect
          </Button>
        </div>
      )}
    </div>
  );
}

