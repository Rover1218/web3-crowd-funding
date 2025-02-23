"use client";

import { useState, useEffect } from "react";
import { formatEther } from "ethers";
import { CampaignCard } from "@/components/campaign-card";
import { getReadOnlyContract } from "@/lib/contractUtils";
import type { CampaignDetails } from "@/types/campaign";
import { Loader2 } from "lucide-react";

export default function ProjectsPage() {
  const [campaigns, setCampaigns] = useState<CampaignDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCampaigns = async () => {
    try {
      const contract = await getReadOnlyContract();
      let data;
      // Use getCampaigns if available; otherwise fallback
      if (contract.getCampaigns) {
        data = await contract.getCampaigns();
      } else if (contract.campaignCount && contract.getCampaignDetails) {
        const countRaw = await contract.campaignCount();
        const count = countRaw.toNumber ? countRaw.toNumber() : countRaw;
        data = [];
        for (let i = 0; i < count; i++) {
          const campaign = await contract.getCampaignDetails(i);
          data.push(campaign);
        }
      } else {
        throw new Error("No valid method found for fetching campaigns");
      }

      const formattedCampaigns: CampaignDetails[] = data.map((campaign: any, idx: number) => ({
        id: idx,
        title: campaign.title,
        description: campaign.description,
        goal: campaign.goal.toString(),
        amountCollected: campaign.amountCollected.toString(),
        deadline: Number(campaign.deadline), // Remove the * 1000 as blockchain timestamp is already in seconds
        completed: campaign.completed,
        goalReached: campaign.goalReached,
        owner: campaign.owner
      }));

      setCampaigns(formattedCampaigns);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    }
  };

  useEffect(() => {
    fetchCampaigns().finally(() => setIsLoading(false));
  }, []);

  const isExpired = (campaign: CampaignDetails) => {
    return Number(campaign.deadline) < Date.now() / 1000;
  };

  const activeCampaigns = campaigns.filter(c => !c.completed && !isExpired(c));
  const expiredCampaigns = campaigns.filter(c => !c.completed && isExpired(c));
  const completedCampaigns = campaigns.filter(c => c.completed);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-8">Discover Campaigns</h1>

        {/* Stats - Now 3 columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
            <p className="text-sm text-muted-foreground">Total Campaigns</p>
            <p className="text-3xl font-bold">{campaigns.length}</p>
          </div>
          <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
            <p className="text-sm text-muted-foreground">Active Campaigns</p>
            <p className="text-3xl font-bold">{activeCampaigns.length}</p>
          </div>
          <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
            <p className="text-sm text-muted-foreground">Expired Campaigns</p>
            <p className="text-3xl font-bold">{expiredCampaigns.length}</p>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-lg shadow-sm border border-border">
            <h3 className="text-xl font-medium">No Campaigns Found</h3>
            <p className="mt-2 text-muted-foreground">Be the first to start a fundraising campaign!</p>
          </div>
        ) : (
          <>
            {activeCampaigns.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-semibold mb-6">Active Campaigns</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeCampaigns.map((campaign) => (
                    <CampaignCard key={campaign.id} {...campaign} />
                  ))}
                </div>
              </div>
            )}

            {expiredCampaigns.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-semibold mb-6">Expired Campaigns</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {expiredCampaigns.map((campaign) => (
                    <CampaignCard key={campaign.id} {...campaign} />
                  ))}
                </div>
              </div>
            )}

            {completedCampaigns.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-6">Completed Campaigns</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completedCampaigns.map((campaign) => (
                    <CampaignCard key={campaign.id} {...campaign} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

