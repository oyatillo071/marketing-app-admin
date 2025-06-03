"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import {
  addCard,
  fetchCards,
  deleteCard,
  fetchCardsByType,
  fetchCardsByCountry,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/language-context";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2, Filter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { languages } from "@/components/providers/language-switcher";
import Link from "next/link";

const cardTypes = ["click", "uzcard", "humo"];
const countries = languages;
const PAGE_SIZE = 10;

export default function CardsSection() {
  const { t } = useLanguage();
  const [cards, setCards] = useState([]);
  const [form, setForm] = useState({
    card_seria_number: "",
    cauntries: "",
    card_type: "",
    custom_country: "",
    custom_type: "",
  });
  const [errors, setErrors] = useState({});
  const [isOpen, setIsOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [page, setPage] = useState(1);

  // Memoized fetch for cards
  const loadCards = useCallback(async () => {
    let data = [];
    if (typeFilter) {
      data = await fetchCardsByType(typeFilter);
      data = data.data || [];
    } else if (countryFilter) {
      data = await fetchCardsByCountry(countryFilter);
      data = data.data || [];
    } else {
      const res = await fetchCards();
      data = res.data || [];
    }
    setCards(data);
    setPage(1);
  }, [typeFilter, countryFilter]);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  // Form validation
  // const validate = useCallback(() => {
  //   const errs = {};
  //   if (!form.card_seria_number.match(/^\d{9,}$/))
  //     errs.card_seria_number = t("invalidCardNumber");
  //   if (!form.cauntries && !form.custom_country)
  //     errs.cauntries = t("selectCountry");
  //   if (!form.card_type && !form.custom_type) errs.card_type = t("selectType");
  //   setErrors(errs);
  //   return Object.keys(errs).length === 0;
  // }, [form, t]);
  // Form validation
  const validate = useCallback(() => {
    const errs = {};
    // Bo'sh joylarni olib tashlash orqali validatsiya
    const rawCardNumber = form.card_seria_number.replace(/\s/g, "");
    if (!rawCardNumber.match(/^\d{9,}$/))
      errs.card_seria_number = t("invalidCardNumber");
    if (!form.cauntries && !form.custom_country)
      errs.cauntries = t("selectCountry");
    if (!form.card_type && !form.custom_type) errs.card_type = t("selectType");
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [form, t]);

  // Handle form submit
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!validate()) return;
      await addCard({
        card_seria_number: String(form.card_seria_number.replace(/\s/g, "")),
        country: String(form.cauntries || form.custom_country),
        card_type: String(form.card_type || form.custom_type),
      });
      setForm({
        card_seria_number: "",
        cauntries: "",
        card_type: "",
        custom_country: "",
        custom_type: "",
      });
      setIsOpen(false);
      loadCards();
    },
    [form, validate, loadCards]
  );

  // Handle card delete
  const handleDelete = useCallback(
    async (id) => {
      await deleteCard(id);
      loadCards();
    },
    [loadCards]
  );

  // Pagination
  const totalPages = useMemo(
    () => Math.ceil(cards.length / PAGE_SIZE),
    [cards]
  );
  const pagedCards = useMemo(
    () => cards.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [cards, page]
  );

  // Format card number with space every 4 digits
  const formatCardNumber = (value) => {
    return value
      .replace(/\D/g, "")
      .replace(/(.{4})/g, "$1 ")
      .trim()
      .slice(0, 19); // max 16 digits + 3 spaces
  };

  // Handle card number input with formatting
  const handleCardNumberChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
    setForm({ ...form, card_seria_number: formatCardNumber(raw) });
  };

  return (
    <div className="my-8 px-2 sm:px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <h3 className="text-xl font-semibold">{t("cards")}</h3>
        <div className="flex gap-2 flex-wrap">
          {/* Filter by type */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 text-xs sm:text-sm md:text-base"
              >
                <Filter className="w-4 h-4" />
                {typeFilter
                  ? cardTypes.find((t) => t === typeFilter)
                  : t("filterByType") || "Type"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-[120px] sm:min-w-[160px] md:min-w-[200px]">
              {cardTypes.map((type) => (
                <DropdownMenuItem
                  key={type}
                  onClick={() => {
                    setTypeFilter(type);
                    setCountryFilter("");
                  }}
                  className={typeFilter === type ? "bg-muted" : ""}
                >
                  {type}
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem
                onClick={() => setTypeFilter("")}
                className={!typeFilter ? "bg-muted" : ""}
              >
                {t("clearFilter") || "Clear filter"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {/* Filter by country */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 text-xs sm:text-sm md:text-base"
              >
                <Filter className="w-4 h-4" />
                {countryFilter
                  ? countries.find((c) => c.code === countryFilter)?.name
                  : t("filterByCountry") || "Country"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-[120px] sm:min-w-[160px] md:min-w-[200px]">
              {countries.map((c) => (
                <DropdownMenuItem
                  key={c.code}
                  onClick={() => {
                    setCountryFilter(c.code);
                    setTypeFilter("");
                  }}
                  className={countryFilter === c.code ? "bg-muted" : ""}
                >
                  {c.name}
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem
                onClick={() => setCountryFilter("")}
                className={!countryFilter ? "bg-muted" : ""}
              >
                {t("clearFilter") || "Clear filter"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {/* Add card button */}
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="text-xs sm:text-sm md:text-base">
                {t("addCard")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{t("addCard")}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <Input
                    placeholder={t("cardSeriaNumber")}
                    value={form.card_seria_number}
                    onChange={handleCardNumberChange}
                    maxLength={19}
                    inputMode="numeric"
                    className="tracking-widest text-xs sm:text-sm md:text-base"
                  />
                  {errors.card_seria_number && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.card_seria_number}
                    </p>
                  )}
                </div>
                {/* Country dropdown + custom input */}
                <div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        className="w-full justify-start text-xs sm:text-sm md:text-base"
                        variant="outline"
                      >
                        {form.cauntries || t("selectCountry")}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="min-w-[120px] sm:min-w-[160px] md:min-w-[200px]">
                      {countries.map((c) => (
                        <DropdownMenuItem
                          key={c.code}
                          onClick={() =>
                            setForm({
                              ...form,
                              cauntries: c.name,
                              custom_country: "",
                            })
                          }
                        >
                          {c.name}
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuItem
                        onClick={() =>
                          setForm({
                            ...form,
                            cauntries: "",
                          })
                        }
                      >
                        {t("otherCountry") || "Other country..."}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {/* Show custom country input if not selected from list */}
                  {!form.cauntries && (
                    <Input
                      className="mt-2 text-xs sm:text-sm md:text-base"
                      placeholder={t("enterCountry") || "Enter country"}
                      value={form.custom_country}
                      onChange={(e) =>
                        setForm({ ...form, custom_country: e.target.value })
                      }
                    />
                  )}
                  {errors.cauntries && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.cauntries}
                    </p>
                  )}
                </div>
                {/* Card type dropdown + custom input */}
                <div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        className="w-full justify-start text-xs sm:text-sm md:text-base"
                        variant="outline"
                      >
                        {form.card_type || t("selectType")}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="min-w-[120px] sm:min-w-[160px] md:min-w-[200px]">
                      {cardTypes.map((type) => (
                        <DropdownMenuItem
                          key={type}
                          onClick={() =>
                            setForm({
                              ...form,
                              card_type: type,
                              custom_type: "",
                            })
                          }
                        >
                          {type}
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuItem
                        onClick={() =>
                          setForm({
                            ...form,
                            card_type: "",
                          })
                        }
                      >
                        {t("otherType") || "Other type..."}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {/* Show custom type input if not selected from list */}
                  {!form.card_type && (
                    <Input
                      className="mt-2 text-xs sm:text-sm md:text-base"
                      placeholder={t("enterType") || "Enter card type"}
                      value={form.custom_type}
                      onChange={(e) =>
                        setForm({ ...form, custom_type: e.target.value })
                      }
                    />
                  )}
                  {errors.card_type && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.card_type}
                    </p>
                  )}
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                    type="button"
                    className="text-xs sm:text-sm md:text-base"
                  >
                    {t("cancel")}
                  </Button>
                  <Button
                    type="submit"
                    className="text-xs sm:text-sm md:text-base"
                  >
                    {t("addCard")}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          <Link href="/dashboard/payments">
            <Button
              variant="outline"
              className="text-xs sm:text-sm md:text-base"
            >
              {t("toPayments") || "Payments"}
            </Button>
          </Link>
        </div>
      </div>

      {/* Cards table */}
      <div
        className="rounded-md border bg-background overflow-auto shadow"
        style={{ maxHeight: 300, minHeight: 100 }}
      >
        <table className="min-w-full text-xs sm:text-sm md:text-base">
          <thead className="sticky top-0 bg-background z-10">
            <tr>
              <th className="px-2 py-2 text-left">#</th>
              <th className="px-2 py-2 text-left">{t("cardSeriaNumber")}</th>
              <th className="px-2 py-2 text-left">{t("country")}</th>
              <th className="px-2 py-2 text-left">{t("type")}</th>
              <th className="px-2 py-2 text-left">{t("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {pagedCards.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  {t("noCardsAvailable")}
                </td>
              </tr>
            ) : (
              pagedCards.map((card, idx) => (
                <tr
                  key={card.id}
                  className="border-b hover:bg-muted/30 transition"
                >
                  <td className="px-2 py-2">
                    {(page - 1) * PAGE_SIZE + idx + 1}
                  </td>
                  <td className="px-2 py-2 font-mono break-all max-w-[120px]">
                    {formatCardNumber(card.card_seria_number)}
                  </td>
                  <td className="px-2 py-2">{card.cauntries}</td>
                  <td className="px-2 py-2">{card.card_type}</td>
                  <td className="px-2 py-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(card.id)}
                      className="text-destructive hover:bg-destructive/10"
                      title={t("delete")}
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="text-xs sm:text-sm md:text-base"
          >
            {"<"}
          </Button>
          <span className="text-xs sm:text-sm md:text-base">
            {page} / {totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="text-xs sm:text-sm md:text-base"
          >
            {">"}
          </Button>
        </div>
      )}
    </div>
  );
}
