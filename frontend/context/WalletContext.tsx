"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { BrowserProvider } from "ethers";

interface WalletContextType {
    account: string | null;
    connectWallet: () => Promise<void>;
    disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType>({
    account: null,
    connectWallet: async () => { },
    disconnectWallet: () => { }
});

export function WalletProvider({ children }: { children: ReactNode }) {
    const [account, setAccount] = useState<string | null>(null);

    const connectWallet = async () => {
        if (typeof window.ethereum !== "undefined") {
            try {
                await window.ethereum.request({ method: "eth_requestAccounts" });
                const provider = new BrowserProvider(window.ethereum);
                const signer = await provider.getSigner();
                const address = await signer.getAddress();
                setAccount(address);
                localStorage.setItem("walletConnected", "true");
            } catch (error) {
                console.error("Failed to connect wallet:", error);
            }
        } else {
            alert("Please install MetaMask!");
        }
    };

    const disconnectWallet = () => {
        setAccount(null);
        localStorage.removeItem("walletConnected");
    };

    useEffect(() => {
        const checkConnection = async () => {
            if (localStorage.getItem("walletConnected") === "true") {
                await connectWallet();
            }
        };
        checkConnection();

        window.ethereum?.on("accountsChanged", (accounts: string[]) => {
            if (accounts.length > 0) {
                setAccount(accounts[0]);
            } else {
                disconnectWallet();
            }
        });

        return () => {
            window.ethereum?.removeListener("accountsChanged", () => { });
        };
    }, []);

    return (
        <WalletContext.Provider value={{ account, connectWallet, disconnectWallet }}>
            {children}
        </WalletContext.Provider>
    );
}

export const useWallet = () => {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error("useWallet must be used within a WalletProvider");
    }
    return context;
};

export default WalletProvider;
