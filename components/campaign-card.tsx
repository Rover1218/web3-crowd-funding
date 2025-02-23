import Link from "next/link";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";
import { formatEther } from "ethers";

export function CampaignCard({ id, title, description, goal, amountCollected, deadline, completed, goalReached, owner }: any) {
    // Helper function to format the date
    const formatDeadline = (timestamp: number) => {
        // Convert blockchain timestamp (seconds) to milliseconds
        const date = new Date(timestamp * 1000);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZoneName: 'short'
        });
    };

    return (
        <Link href={`/projects/${id}`}>
            <Card className="hover:shadow-lg transition-shadow duration-200">
                <div className="p-6">
                    <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                        Ends on: {formatDeadline(deadline)}
                    </div>
                </div>
            </Card>
        </Link>
    );
}
