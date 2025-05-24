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
const allowedCurrencies = [
	{ code: "UZS", name: "UZS (so'm)" },
	{ code: "USD", name: "USD (dollar)" },
	{ code: "EUR", name: "EUR (yuro)" },
	{ code: "RUB", name: "RUB (rubl)" },
	{ code: "KZT", name: "KZT (tenge)" },
	{ code: "KGS", name: "KGS (som)" },
	{ code: "CNY", name: "CNY (yuan)" },
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

	// Prices state
	const [prices, setPrices] = useState(
		allowedCurrencies.map((cur) => {
			const found = initialData?.prices?.find((p: any) => p.currency === cur.code);
			return { currency: cur.code, value: found ? String(found.value) : "" };
		})
	);

	// Photo state
	const [photoFile, setPhotoFile] = useState<{ file: File; preview: string } | null>(null);
	const [photoUrl, setPhotoUrl] = useState(
		initialData?.photo_url && typeof initialData.photo_url === "string"
			? initialData.photo_url
			: initialData?.photo_url?.[0]?.photo_url || ""
	);
	const [uploading, setUploading] = useState(false);

	// Other fields
	const [term, setTerm] = useState(initialData?.term || "");
	const [referralBonus, setReferralBonus] = useState(initialData?.referral_bonus || "");

	// Handlers
	const handleTranslationChange = (lang: string, field: string, value: string) => {
		setTranslations((prev) =>
			prev.map((tr) => (tr.language === lang ? { ...tr, [field]: value } : tr))
		);
	};
	const handlePriceChange = (idx: number, value: string) => {
		setPrices((prev) => prev.map((p, i) => (i === idx ? { ...p, value } : p)));
	};
	const removePhotoFile = () => setPhotoFile(null);
	const removePhotoUrl = () => setPhotoUrl("");
	const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (!e.target.files?.length) return;
		const file = e.target.files[0];
		setPhotoFile({ file, preview: URL.createObjectURL(file) });
		e.target.value = "";
	};

	// --- KO'P RASM YUKLASH UCHUN KODNI KOMMENTGA OLDIM ---
	/*
	const [photoFiles, setPhotoFiles] = useState<{ file: File; preview: string }[]>([]);
	const [photoUrls, setPhotoUrls] = useState(
		initialData?.photo_url
			? Array.isArray(initialData.photo_url)
				? initialData.photo_url
				: [{ photo_url: initialData.photo_url }]
			: []
	);
	const removePhotoFile = (idx: number) =>
		setPhotoFiles(photoFiles.filter((_, i) => i !== idx));
	const removePhotoUrl = (idx: number) =>
		setPhotoUrls(photoUrls.filter((_: any, i: number) => i !== idx));
	const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (!e.target.files?.length) return;
		const files = Array.from(e.target.files).slice(
			0,
			10 - photoFiles.length - photoUrls.length
		);
		const newFiles = files.map((file) => ({
			file,
			preview: URL.createObjectURL(file),
		}));
		setPhotoFiles((prev) =>
			[...prev, ...newFiles].slice(0, 10 - photoUrls.length)
		);
		e.target.value = "";
	};
	*/

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
		const priceErrors = prices.some(
			(p: any) =>
				!p.currency ||
				!allowedCurrencies.find((c) => c.code === p.currency) ||
				!p.value ||
				isNaN(Number(p.value)) ||
				Number(p.value) <= 0
		);
		if (priceErrors) {
			toast.error("Valyuta va narxlarni to'g'ri kiriting!");
			setUploading(false);
			return;
		}
		if (!photoFile && !photoUrl) {
			toast.error("Kamida bitta rasm yuklang!");
			setUploading(false);
			return;
		}

		let uploadedPhotoUrl = photoUrl;
		if (photoFile) {
			try {
				const data = await uploadMultImage([photoFile.file]);
				// uploadMultImage har doim [{ photo_url: "..." }] formatida qaytadi
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
			photo_url: uploadedPhotoUrl,
			translations: translations.map((tr) => ({
				language: tr.language,
				name: tr.name,
				description: tr.description,
				longDescription: tr.longDescription,
				features: tr.features,
				usage: tr.usage,
			})),
			prices: prices
				.filter((p: any) => p.currency && p.value)
				.map((p: any) => ({
					currency: p.currency,
					value: Number(p.value),
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
		setPrices(
			allowedCurrencies.map((cur) => {
				const found = initialData?.prices?.find((p: any) => p.currency === cur.code);
				return { currency: cur.code, value: found ? String(found.value) : "" };
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
					</div>

					{/* Photo upload */}
					<div>
						<label className="block mb-1">{t("photo")}</label>
						<div className="flex gap-2 flex-wrap p-4">
							{/* Existing uploaded image */}
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
							{/* Upload input */}
							{!photoFile && !photoUrl && (
								<Input
									type="file"
									accept="image/*"
									onChange={handlePhotoUpload}
									disabled={uploading}
								/>
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

					{/* Prices */}
					<div>
						<label className="block mb-1">{t("prices")}</label>
						<div className="grid grid-cols-2 md:grid-cols-3 gap-2">
							{prices.map((price: any, idx: number) => (
								<div key={price.currency} className="flex gap-2 mb-2">
									<Input
										placeholder={t("price") + " " + price.currency}
										value={price.value}
										type="number"
										onChange={(e) => handlePriceChange(idx, e.target.value)}
										min={1}
										required
									/>
									<span className="self-center">{price.currency}</span>
								</div>
							))}
						</div>
					</div>

					<Button type="submit" className="w-full" disabled={uploading}>
						{uploading ? t("loading") || "Loading..." : t("save")}
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
}
