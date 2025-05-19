"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/contexts/language-context";

type NewUsersProps = {
  data: Array<{
    id: string;
    name: string;
    initials: string;
    phone?: string;
    email?: string;
    tariff: string;
    status: string;
    createdAt?: string;
    registrationDate?: string;
  }>;
};

export function NewUsers({ data }: NewUsersProps) {
  const { t } = useLanguage();

  if (!data || data.length === 0) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("id")}</TableHead>
            <TableHead>{t("name")}</TableHead>
            <TableHead>{t("phone")}</TableHead>
            <TableHead>{t("tariff")}</TableHead>
            <TableHead>{t("status")}</TableHead>
            <TableHead>{t("registrationDate")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-4 w-16" />
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Skeleton className="h-8 w-8 rounded-full mr-2" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-32" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("id")}</TableHead>
          <TableHead>{t("name")}</TableHead>
          <TableHead>{t("phone")}</TableHead>
          <TableHead>{t("tariff")}</TableHead>
          <TableHead>{t("status")}</TableHead>
          <TableHead>{t("registrationDate")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.id}</TableCell>
            <TableCell>
              <div className="flex items-center">
                {/* <Avatar className="h-8 w-8 mr-2 bg-red-500"> */}
                {/* <AvatarFallback>{user.initials}</AvatarFallback> */}
                {/* </Avatar> */}
                {user.name}
              </div>
            </TableCell>
            <TableCell className="whitespace-nowrap">{user.email}</TableCell>
            <TableCell>
              <Badge
                className={
                  user.tariff === "Premium"
                    ? "bg-red-500"
                    : user.tariff === "Standard"
                    ? "bg-green-500"
                    : "bg-gray-500"
                }
              >
                {user.tariff}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge
                className={
                  user.status === "Faol" ? "bg-green-500" : "bg-red-500"
                }
              >
                {user.status}
              </Badge>
            </TableCell>
            <TableCell>
              {user.createdAt
                ? new Date(user.createdAt).toLocaleString("uz-UZ", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "-"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
