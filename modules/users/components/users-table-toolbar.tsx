"use client";

import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Button } from "@/shared/components/ui/button";

interface UsersTableToolbarProps {
  searchPlaceholder: string;
  rolePlaceholder: string;
  statusPlaceholder: string;
  verificationPlaceholder: string;
  createLabel: string;
  activeLabel: string;
  inactiveLabel: string;
  verifiedLabel: string;
  unverifiedLabel: string;
  search: string;
  role: string;
  status: string;
  verified: string;
  roleOptions: string[];
  canCreate: boolean;
  createLoading: boolean;
  onSearchChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onVerifiedChange: (value: string) => void;
  onCreate: () => void;
}

export function UsersTableToolbar({
  searchPlaceholder,
  rolePlaceholder,
  statusPlaceholder,
  verificationPlaceholder,
  createLabel,
  activeLabel,
  inactiveLabel,
  verifiedLabel,
  unverifiedLabel,
  search,
  role,
  status,
  verified,
  roleOptions,
  canCreate,
  createLoading,
  onSearchChange,
  onRoleChange,
  onStatusChange,
  onVerifiedChange,
  onCreate,
}: UsersTableToolbarProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-1 flex-wrap gap-2">
        <Input
          placeholder={searchPlaceholder}
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          className="max-w-sm"
        />
        <Select value={role} onValueChange={onRoleChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={rolePlaceholder} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{rolePlaceholder}</SelectItem>
            {roleOptions.map((roleName) => (
              <SelectItem key={roleName} value={roleName}>
                {roleName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={statusPlaceholder} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{statusPlaceholder}</SelectItem>
            <SelectItem value="true">{activeLabel}</SelectItem>
            <SelectItem value="false">{inactiveLabel}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={verified} onValueChange={onVerifiedChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={verificationPlaceholder} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{verificationPlaceholder}</SelectItem>
            <SelectItem value="true">{verifiedLabel}</SelectItem>
            <SelectItem value="false">{unverifiedLabel}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {canCreate && (
        <Button onClick={onCreate} disabled={createLoading}>
          {createLabel}
        </Button>
      )}
    </div>
  );
}
