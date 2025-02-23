'use client'

import CryptoChart from './components/CryptoChart'

export default function ChartsPage() {
    return (
        <main className="flex min-h-screen flex-col items-center px-4 py-6 sm:p-6 md:p-8">
            <div className="w-full max-w-[1200px] space-y-4 sm:space-y-6">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Live Crypto Charts</h1>
                <div className="rounded-lg border bg-card p-3 sm:p-4">
                    <CryptoChart />
                </div>
            </div>
        </main>
    );
}
