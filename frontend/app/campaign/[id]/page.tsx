"use client"

import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Card } from "@/components/ui/card"
import { getProvider, getContract, formatEther, parseEther } from "@/lib/contractUtils"
import { Loader2 } from "lucide-react"
import { AlertModal } from "@/components/AlertModal"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

type Campaign = {
    id: string;
    owner: string;
    title: string;
    description: string;
    goal: string;
    deadline: string;
    amountCollected: string;
    completed: boolean;
    goalReached: boolean;
};

export default function CampaignDetails({ params }: { params: { id: string } }) {
    const [campaign, setCampaign] = useState<Campaign | null>(null)
    const [contribution, setContribution] = useState("")
    const [userContribution, setUserContribution] = useState("0")
    const [alert, setAlert] = useState<{
        show: boolean;
        title: string;
        message: string;
        variant: 'success' | 'error';
    }>({
        show: false,
        title: '',
        message: '',
        variant: 'success'
    });
    const [isContributing, setIsContributing] = useState(false)

    const fetchCampaignDetails = async () => {
        try {
            const contract = await getContract();
            const campaignDetails = await contract.getCampaignDetails(params.id);
            setCampaign({
                id: params.id,
                owner: campaignDetails.owner,
                title: campaignDetails.title,
                description: campaignDetails.description,
                goal: campaignDetails.goal.toString(),
                deadline: campaignDetails.deadline.toString(),
                amountCollected: campaignDetails.amountCollected.toString(),
                completed: campaignDetails.completed,
                goalReached: campaignDetails.goalReached,
            });

            const provider = getProvider();
            const accounts = await provider.listAccounts();
            if (accounts.length > 0) {
                const userContrib = await contract.getContribution(params.id, accounts[0].address);
                setUserContribution(userContrib.toString());
            }
        } catch (error) {
            console.error("Error fetching campaign details:", error);
        }
    };

    useEffect(() => {
        fetchCampaignDetails()
    }, [params.id])

    const showAlert = (title: string, message: string, variant: 'success' | 'error') => {
        setAlert({
            show: true,
            title,
            message,
            variant
        });
    };

    const fundCampaign = async () => {
        if (!campaign) return;
        setIsContributing(true);
        try {
            const contract = await getContract(true);
            const tx = await contract.fundCampaign(campaign.id, {
                value: parseEther(contribution),
            });
            await tx.wait();
            showAlert("Success", "Contribution successful!", "success");
            setContribution("");
            fetchCampaignDetails();
        } catch (error) {
            console.error("Error funding campaign:", error);
            showAlert("Error", "Failed to fund campaign. Please try again.", "error");
        } finally {
            setIsContributing(false);
        }
    };

    const withdrawFunds = async () => {
        if (typeof window.ethereum !== "undefined" && campaign) {
            try {
                const provider = getProvider();
                const signer = await provider.getSigner();
                const contract = await getContract(true);

                const tx = await contract.withdrawFunds(campaign.id);
                await tx.wait();

                showAlert("Success", "Funds withdrawn successfully!", "success");
                fetchCampaignDetails();
            } catch (error) {
                console.error("Error withdrawing funds:", error);
                showAlert("Error", "Failed to withdraw funds. Please try again.", "error");
            }
        }
    };

    const claimRefund = async () => {
        if (typeof window.ethereum !== "undefined" && campaign) {
            try {
                const provider = getProvider();
                const signer = await provider.getSigner();
                const contract = await getContract(true);

                const tx = await contract.claimRefund(campaign.id);
                await tx.wait();

                showAlert("Success", "Refund claimed successfully!", "success");
                fetchCampaignDetails();
            } catch (error) {
                console.error("Error claiming refund:", error);
                showAlert("Error", "Failed to claim refund. Please try again.", "error");
            }
        }
    };

    if (!campaign) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                    <p className="text-lg">Loading campaign details...</p>
                </div>
            </div>
        )
    }

    const progress = (Number.parseFloat(campaign.amountCollected) / Number.parseFloat(campaign.goal)) * 100
    const isOwner = campaign.owner === window.ethereum?.selectedAddress
    const isExpired = Number.parseInt(campaign.deadline) < Date.now() / 1000
    const hasContribution = Number.parseFloat(userContribution) > 0

    return (
        <>
            <main className="min-h-screen bg-background text-foreground">
                <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            <h1 className="text-4xl font-bold">{campaign.title}</h1>
                            <Card className="p-6">
                                <h2 className="text-xl font-semibold mb-4">About this Campaign</h2>
                                <p className="text-muted-foreground">{campaign.description}</p>
                            </Card>

                            <Card className="p-6">
                                <h2 className="text-xl font-semibold mb-4">Funding Progress</h2>
                                <Progress value={progress} className="h-4 mb-4" />
                                <div className="flex justify-between text-sm mb-4">
                                    <span>{formatEther(campaign.amountCollected)} ETH raised</span>
                                    <span>{formatEther(campaign.goal)} ETH goal</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="bg-muted p-4 rounded-lg">
                                        <p className="text-muted-foreground">Campaign Status</p>
                                        <p className="font-semibold">
                                            {campaign.completed ? "Completed" : campaign.goalReached ? "Goal Reached" : isExpired ? "Expired" : "Active"}
                                        </p>
                                    </div>
                                    <div className="bg-muted p-4 rounded-lg">
                                        <p className="text-muted-foreground">End Date</p>
                                        <p className="font-semibold">
                                            {new Date(Number.parseInt(campaign.deadline) * 1000).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            <Card className="p-6 sticky top-8">
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">Your Contribution</h3>
                                        <p className="text-2xl font-bold">{formatEther(userContribution)} ETH</p>
                                    </div>

                                    {!campaign.completed && !campaign.goalReached && (
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-semibold">Make a Contribution</h3>
                                            <div className="space-y-2">
                                                <Input
                                                    type="number"
                                                    placeholder="Amount in ETH"
                                                    value={contribution}
                                                    onChange={(e) => setContribution(e.target.value)}
                                                    min="0"
                                                    step="0.01"
                                                    disabled={isExpired}
                                                />
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <div className="w-full">
                                                                <Button
                                                                    onClick={fundCampaign}
                                                                    variant="default"
                                                                    className={`w-full transition-all ${!isExpired && !isContributing
                                                                        ? "bg-primary hover:bg-primary/90 hover:scale-105"
                                                                        : ""
                                                                        }`}
                                                                    disabled={isContributing || isExpired}
                                                                >
                                                                    {isContributing ? (
                                                                        <>
                                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                            Contributing...
                                                                        </>
                                                                    ) : isExpired ? (
                                                                        'Campaign Expired'
                                                                    ) : (
                                                                        'Contribute to Campaign'
                                                                    )}
                                                                </Button>
                                                            </div>
                                                        </TooltipTrigger>
                                                        {isExpired && (
                                                            <TooltipContent>
                                                                <p>This campaign has ended and is no longer accepting contributions</p>
                                                            </TooltipContent>
                                                        )}
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>
                                        </div>
                                    )}

                                    {campaign.goalReached && !campaign.completed && isOwner && (
                                        <Button
                                            onClick={withdrawFunds}
                                            variant="default"
                                            className="w-full"
                                        >
                                            Withdraw Campaign Funds
                                        </Button>
                                    )}

                                    {!campaign.goalReached && isExpired && hasContribution && (
                                        <Button
                                            onClick={claimRefund}
                                            variant="destructive"
                                            className="w-full"
                                        >
                                            Claim Refund
                                        </Button>
                                    )}

                                    <div className="text-sm text-muted-foreground">
                                        <p>Campaign ID: {campaign.id}</p>
                                        <p>Creator: {campaign.owner.slice(0, 6)}...{campaign.owner.slice(-4)}</p>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>
            <AlertModal
                isOpen={alert.show}
                onClose={() => setAlert(prev => ({ ...prev, show: false }))}
                title={alert.title}
                message={alert.message}
                variant={alert.variant}
            />
        </>
    )
}

