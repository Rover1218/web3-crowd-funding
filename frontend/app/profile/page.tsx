"use client"

import { useState, useEffect } from "react"
import { getProvider, formatEther } from "@/lib/contractUtils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export default function Profile() {
    const [account, setAccount] = useState<string | null>(null)
    const [balance, setBalance] = useState<string | null>(null)

    useEffect(() => {
        const fetchAccountDetails = async () => {
            try {
                const provider = getProvider()
                const signer = await provider.getSigner()
                const address = await signer.getAddress()
                setAccount(address)
                const balance = await provider.getBalance(address)
                setBalance(formatEther(balance))
            } catch (error) {
                console.error("Error fetching account details:", error)
            }
        }

        fetchAccountDetails()
    }, [])

    return (
        <main className="flex min-h-screen flex-col items-center justify-start p-8 max-w-7xl mx-auto w-full">
            <div className="w-full flex flex-col items-center gap-8">
                <div className="flex items-center gap-4">
                    <Avatar className="h-24 w-24">
                        <AvatarFallback className="text-2xl">
                            {account ? account.substring(2, 4).toUpperCase() : '??'}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="text-4xl font-bold">Your Profile</h1>
                        <p className="text-muted-foreground">Welcome back!</p>
                    </div>
                </div>

                {account ? (
                    <Card className="w-full max-w-2xl">
                        <CardHeader>
                            <CardTitle>Account Details</CardTitle>
                            <CardDescription>Your Ethereum account information</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                            <div>
                                <p className="text-sm font-medium">Address:</p>
                                <p className="text-sm text-muted-foreground break-all">{account}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium">Balance:</p>
                                <p className="text-sm text-muted-foreground">{balance} ETH</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium">Network:</p>
                                <p className="text-sm text-muted-foreground">Sepolia Testnet</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium">Account Status:</p>
                                <div className="flex gap-2 mt-1">
                                    <Badge>Active</Badge>
                                    <Badge variant="secondary">Verified</Badge>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button
                                className="w-full"
                                onClick={() => window.open(`https://sepolia.etherscan.io/address/${account}`, "_blank")}
                            >
                                View on Etherscan
                            </Button>
                        </CardFooter>
                    </Card>
                ) : (
                    <Card className="w-full max-w-md">
                        <CardContent className="pt-6">
                            <p className="text-center">Please connect your wallet to view your profile.</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </main>
    )
}

