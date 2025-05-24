"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/language-context";
import Link from "next/link";
import { Download, Loader2, Plus } from "lucide-react";
import { useStatistics } from "@/hooks/use-add-statistics";

const MOCK_STATISTICS = [
	{
		id: "89628415-df6b-47be-8295-315e9702f5f8",
		onlineUserCount: 422,
		totalEarned: "250.06",
		statEarnings: [
			{
				id: "9e5b1e63-385b-4ee5-ac87-04ab8f19e181",
				currency: "USD",
				amount: "850.89",
				widgetId: "89628415-df6b-47be-8295-315e9702f5f8",
			},
		],
		recentUsers: [
			{
				id: "1c8c9982-b188-4438-8092-0e8c78f4f477",
				email: "user878@example.com",
				widgetId: "89628415-df6b-47be-8295-315e9702f5f8",
			},
			{
				id: "528c9f40-22f9-4b2f-8935-9865c2b65f85",
				email: "user5982@example.com",
				widgetId: "89628415-df6b-47be-8295-315e9702f5f8",
			},
			{
				id: "d028645e-f272-4434-9b70-3a829df433e1",
				email: "user1943@example.com",
				widgetId: "89628415-df6b-47be-8295-315e9702f5f8",
			},
			{
				id: "e5407de7-36f5-4236-9b2f-3ecfa0a498b3",
				email: "user5106@example.com",
				widgetId: "89628415-df6b-47be-8295-315e9702f5f8",
			},
		],
	},
	// ... boshqa statistikalar ...
];

export default function StatisticsPage() {
	const { t } = useLanguage();
	const [useMock, setUseMock] = useState(true);

	const {
		data: apiStatistics,
		isLoading,
	} = useStatistics();

	// Massiv bo‘lsa, uni ishlatamiz
	const statisticsList = useMock ? MOCK_STATISTICS : apiStatistics;

	if (isLoading && !useMock) {
		return (
			<div className="flex-1 flex items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
				<span className="ml-2">{t("loading")}</span>
			</div>
		);
	}

	if (!statisticsList || !Array.isArray(statisticsList) || statisticsList.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center h-64 bg-muted rounded-lg p-6">
				<p className="text-lg mb-4">{t("noStatisticsFound") || "No statistics found"}</p>
			</div>
		);
	}

	return (
		<div className="flex-1 space-y-8 p-4 md:p-8 pt-6 max-w-3xl mx-auto">
			<div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
				<h2 className="text-3xl font-bold tracking-tight">{t("statistics")}</h2>
				<div className="flex flex-wrap gap-2">
					<Link href="/dashboard/statistics/add-users-statistics">
						<Button variant="secondary" size="sm">
							{t("addUserStatistics") || "Foydalanuvchi statistikasi"}
						</Button>
					</Link>
					<Button
						variant="outline"
						size="sm"
						disabled={statisticsList.length === 0}
					>
						<Download className="mr-2 h-4 w-4" />
						{t("downloadPDF")}
					</Button>
					{/* <Button
						size="sm"
						onClick={() =>
					>
						<Plus className="mr-2 h-4 w-4" />
						{t("add")}
					</Button> */}
					<Button
						size="sm"
						variant={useMock ? "default" : "outline"}
						onClick={() => setUseMock(!useMock)}
					>
						{useMock ? "Users" : "Admin"} statistics
					</Button>
				</div>
			</div>

			{/* Har bir statistikani details blokda ko‘rsatish */}
			{statisticsList.map((statistics: any) => (
				<div key={statistics.id} className="space-y-4 bg-white dark:bg-[#18181b] rounded-lg shadow p-4">
					<div className="flex flex-col sm:flex-row gap-4">
						<div className="flex-1">
							<div className="text-gray-500 text-sm">{t("onlineUserCount") || "Online foydalanuvchilar"}</div>
							<div className="text-2xl font-bold">{statistics.onlineUserCount}</div>
						</div>
						<div className="flex-1">
							<div className="text-gray-500 text-sm">{t("totalEarned") || "Jami daromad"}</div>
							<div className="text-2xl font-bold">{statistics.totalEarned}</div>
						</div>
					</div>

					<div>
						<div className="font-semibold mb-2">{t("statEarnings") || "Statistik daromadlar"}</div>
						<div className="flex flex-wrap gap-4">
							{statistics.statEarnings?.map((s: any) => (
								<div key={s.id} className="border rounded px-3 py-2 min-w-[120px]">
									<div className="text-gray-500 text-xs">{s.currency}</div>
									<div className="font-bold">{s.amount}</div>
								</div>
							))}
						</div>
					</div>

					<div>
						<div className="font-semibold mb-2">{t("recentUsers") || "Oxirgi foydalanuvchilar"}</div>
						<div className="flex flex-wrap gap-2">
							{statistics.recentUsers?.map((user: any) => (
								<div key={user.id} className="border rounded px-3 py-2 min-w-[180px] bg-gray-50 dark:bg-[#23232b]">
									<div className="font-medium">{user.email}</div>
								</div>
							))}
						</div>
					</div>
				</div>
			))}
		</div>
	);
}
