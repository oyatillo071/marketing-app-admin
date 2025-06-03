"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/language-context";
import { useState, useEffect } from "react";
import { uploadMultImage } from "@/lib/api";
import Image from "next/image";
import { toast } from "sonner";

const languages = [
	{ code: "uz", name: "O'zbek" },
	{ code: "ru", name: "Русский" },
	{ code: "en", name: "English" },
	{ code: "kz", name: "Қазақша" },
	{ code: "kg", name: "Кыргызча" },
	{ code: "tj", name: "Тоҷикӣ" },
	{ code: "cn", name: "中文" },
];

export function TariffFormDialog({
	open,
	onOpenChange,
	onSubmit,
	initialData,
}: any) {
	const { t } = useLanguage();
  // console.log(initialData," initialData");
  
	// Multi-language state
	const [activeLang, setActiveLang] = useState(languages[0].code);
	const [translations, setTranslations] = useState(
		languages.map((lang) => {
			const found =
				initialData?.translations?.find(
					(tr: any) => tr.language === lang.code
				) || {};
			return {
				language: lang.code,
				name: found.name || "",
				description: found.description || "",
				longDescription: found.longDescription || "",
				features: found.features || "",
				usage: found.usage || "",
			};
		})
	);

	// Coin state
	const [coin, setCoin] = useState(initialData?.coin || "");

	// Photo state: file yoki url
	const [photoFile, setPhotoFile] = useState<{ file: File; preview: string } | null>(null);
	const [photoUrl, setPhotoUrl] = useState(
		initialData?.photo_url && typeof initialData.photo_url === "string"
			? initialData.photo_url
			: initialData?.photo_url?.[0]?.photo_url || ""
	);
	const [photoUrlInput, setPhotoUrlInput] = useState("");

	// Uploading state
	const [uploading, setUploading] = useState(false);

	// Other fields
	const [term, setTerm] = useState(initialData?.term || "");
	const [referralBonus, setReferralBonus] = useState(initialData?.referral_bonus || "");
	const [dailyProfit, setDailyProfit] = useState(initialData?.dailyProfit || "");

	// Handlers
	const handleTranslationChange = (lang: string, field: string, value: string) => {
		setTranslations((prev) =>
			prev.map((tr) => (tr.language === lang ? { ...tr, [field]: value } : tr))
		);
	};
	const removePhotoFile = () => setPhotoFile(null);
	const removePhotoUrl = () => setPhotoUrl("");
	const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (!e.target.files?.length) return;
		const file = e.target.files[0];
		setPhotoFile({ file, preview: URL.createObjectURL(file) });
		setPhotoUrl(""); // file tanlansa url tozalanadi
		e.target.value = "";
	};
	const handleAddPhotoUrl = () => {
		if (photoUrlInput.trim()) {
			setPhotoUrl(photoUrlInput.trim());
			setPhotoFile(null); // url tanlansa file tozalanadi
			setPhotoUrlInput("");
		}
	};

	// Submit
	const handleSubmit = async (e: any) => {
		e.preventDefault();
		setUploading(true);

		// --- VALIDATSIYA ---
		if (!term || isNaN(Number(term)) || Number(term) <= 0) {
			toast.error("Tarif muddati noto'g'ri!");
			setUploading(false);
			return;
		}
		if (!referralBonus || isNaN(Number(referralBonus)) || Number(referralBonus) < 0) {
			toast.error("Referral bonus noto'g'ri!");
			setUploading(false);
			return;
		}
		if (!coin || isNaN(Number(coin)) || Number(coin) <= 0) {
			toast.error("Coin qiymatini to'g'ri kiriting!");
			setUploading(false);
			return;
		}
		if (!photoFile && !photoUrl) {
			toast.error("Kamida bitta rasm yuklang yoki url kiriting!");
			setUploading(false);
			return;
		}

		let uploadedPhotoUrl = photoUrl;
		if (photoFile) {
			try {
				const data = await uploadMultImage([photoFile.file]);
				uploadedPhotoUrl =
					Array.isArray(data) && data[0]?.photo_url
						? data[0].photo_url
						: "";
			} catch (err: any) {
				toast.error(err?.message || "Rasm yuklashda xatolik");
				setUploading(false);
				return;
			}
		}

		setUploading(false);

		onSubmit({
			id: initialData?.id,
			term: Number(term),
			referral_bonus: Number(referralBonus),
			coin: Number(coin),
			dailyProfit: String(dailyProfit), 
			photo_url: uploadedPhotoUrl,
			translations: translations.map((tr) => ({
				language: tr.language,
				name: tr.name,
				description: tr.description,
				longDescription: tr.longDescription,
				features: tr.features,
				usage: tr.usage,
			})),
		});

		// Clean up preview
		if (photoFile) URL.revokeObjectURL(photoFile.preview);
		setPhotoFile(null);
	};

	useEffect(() => {
		setTranslations(
			languages.map((lang) => { 
				const found =
					initialData?.translations?.find(
						(tr: any) => tr.language === lang.code
					) || {};
				return {
					language: lang.code,
					name: found.name || "",
					description: found.description || "",
					longDescription: found.longDescription || "",
					features: found.features || "",
					usage: found.usage || "",
				};
			})
		);
		setPhotoUrl(
			initialData?.photo_url && typeof initialData.photo_url === "string"
				? initialData.photo_url
				: initialData?.photo_url?.[0]?.photo_url || ""
		);
		setPhotoFile(null);
		setTerm(initialData?.term || "");
		setReferralBonus(initialData?.referral_bonus || "");
		setCoin(initialData?.coin || "");
		setDailyProfit(initialData?.dailyProfit || "");
	}, [initialData, open]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-2xl ">
				<DialogTitle>
					{initialData ? t("editTariff") : t("addTariff")}
				</DialogTitle>
				<form
					onSubmit={handleSubmit}
					className="space-y-4 max-h-[700px] overflow-auto"
				>
					<div className="flex flex-wrap gap-2">
						<Input
							name="term"
							type="number"
							min={1}
							placeholder={t("term") || "Term"}
							value={term}
							onChange={(e) => setTerm(e.target.value)}
							required
						/>
						<Input
							name="referral_bonus"
							type="number"
							min={0}
							placeholder={t("referralBonus") || "Referral Bonus"}
							value={referralBonus}
							onChange={(e) => setReferralBonus(e.target.value)}
							required
						/>
						<Input
							name="coin"
							type="number"
							min={1}
							placeholder={t("coin") || "Coin"}
							value={coin}
							onChange={(e) => setCoin(e.target.value)}
							required
						/>
						<Input
							name="dailyProfit"
							type="number"
							min={0}
							placeholder={t("dailyProfit") || "Daily profit"}
							value={dailyProfit}
							onChange={(e) => setDailyProfit(e.target.value)}
							required
						/>
					</div>

					{/* Photo upload */}
					<div>
						<label className="block mb-1">{t("photo")}</label>
						<div className="flex gap-2 flex-wrap p-4">
							{/* Existing uploaded image (URL) */}
							{photoUrl && (
								<div className="relative">
									<Image
										src={photoUrl}
										alt="photo"
										width={64}
										height={64}
										className="w-16 h-16 object-cover border rounded"
									/>
									<Button
										type="button"
										size="icon"
										variant="destructive"
										className="absolute -top-2 -right-2"
										onClick={removePhotoUrl}
									>
										×
									</Button>
								</div>
							)}
							{/* New image (not uploaded yet) */}
							{photoFile && (
								<div className="relative">
									<Image
										src={photoFile.preview}
										alt="preview"
										width={64}
										height={64}
										className="w-16 h-16 object-cover border rounded"
									/>
									<Button
										type="button"
										size="icon"
										variant="destructive"
										className="absolute -top-2 -right-2"
										onClick={removePhotoFile}
									>
										×
									</Button>
								</div>
							)}
							{/* Upload input yoki URL input */}
							{!photoFile && !photoUrl && (
								<div className="flex flex-col gap-2">
									<Input
										type="file"
										accept="image/*"
										onChange={handlePhotoUpload}
										disabled={uploading}
									/>
									<div className="flex gap-1">
										<Input
											type="url"
											placeholder="https://example.com/image.jpg"
											value={photoUrlInput}
											onChange={(e) => setPhotoUrlInput(e.target.value)}
											disabled={uploading}
										/>
										<Button
											type="button"
											onClick={handleAddPhotoUrl}
											disabled={!photoUrlInput.trim()}
										>
											{t("add") || "Qo'shish"}
										</Button>
									</div>
								</div>
							)}
						</div>
						<div className="text-xs text-muted-foreground mt-1">
							{t("maxFiles") || "1 ta rasm"}
						</div>
					</div>

					{/* Multi-language tabs */}
					<Tabs value={activeLang} onValueChange={setActiveLang}>
						<TabsList className="grid grid-cols-2 h-40 md:h-10 sm:grid-cols-3 md:grid-cols-7 lg:grid-cols-7 gap-2 w-full mx-auto">
							{languages.map((lang) => (
								<TabsTrigger
									key={lang.code}
									value={lang.code}
									className="truncate min-w-0"
									style={{ maxWidth: 90 }}
								>
									{lang.name}
								</TabsTrigger>
							))}
						</TabsList>
						{languages.map((lang, idx) => (
							<TabsContent key={lang.code} value={lang.code}>
								<div className="space-y-2 w-full mx-auto">
									<Input
										placeholder={t("name") || "Tarif nomi"}
										value={translations[idx].name}
										onChange={(e) =>
											handleTranslationChange(lang.code, "name", e.target.value)
										}
									/>
									<Input
										placeholder={t("description") || "Qisqa tavsif"}
										value={translations[idx].description}
										onChange={(e) =>
											handleTranslationChange(lang.code, "description", e.target.value)
										}
									/>
									<Input
										placeholder={t("longDescription") || "To‘liq tavsif"}
										value={translations[idx].longDescription}
										onChange={(e) =>
											handleTranslationChange(lang.code, "longDescription", e.target.value)
										}
									/>
									<Input
										placeholder={t("features") || "Xususiyatlar"}
										value={translations[idx].features}
										onChange={(e) =>
											handleTranslationChange(lang.code, "features", e.target.value)
										}
									/>
									<Input
										placeholder={t("usage") || "Foydalanish"}
										value={translations[idx].usage}
										onChange={(e) =>
											handleTranslationChange(lang.code, "usage", e.target.value)
										}
									/>
								</div>
							</TabsContent>
						))}
					</Tabs>

					<Button type="submit" className="w-full" disabled={uploading}>
						{uploading ? t("loading") || "Loading..." : t("save")}
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
}
