import React, { useState, useEffect, useCallback } from "react";
import { Book, Boxes, FileJson } from "lucide-react";
import axios from "axios";
import { useSnackbar } from "notistack";
import { useTranslation } from "react-i18next";

interface ItemsAmount {
  formats: number;
  definitions: number;
  entities: number;
}

interface ActiveFilters {
  entities: boolean;
  definitions: boolean;
  formats: boolean;
}

interface FilterToolbarProps {
  activeFilters: ActiveFilters;
  toggleFilter: (filterType: keyof ActiveFilters) => void;
}

const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL;

const FilterToolbar: React.FC<FilterToolbarProps> = ({
  activeFilters,
  toggleFilter,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();
  const [itemsAmount, setItemsAmount] = useState<ItemsAmount>({
    formats: 0,
    definitions: 0,
    entities: 0,
  });

  useEffect(() => {
    const fetchItemsAmount = async () => {
      try {
        const [definitionsRes, formatsRes, entitiesRes] = await Promise.all([
          axios.get(`${BASE_API_URL}/api/definitions/amount`),
          axios.get(`${BASE_API_URL}/api/formats/amount`),
          axios.get(`${BASE_API_URL}/api/entities/amount`),
        ]);
        setItemsAmount({
          definitions: definitionsRes.data.amount || 0,
          formats: formatsRes.data.amount || 0,
          entities: entitiesRes.data.amount || 0,
        });
      } catch (error) {
        console.error("Error fetching items amount:", error);
        enqueueSnackbar(t("home.error_fetching_items"), { variant: "error" });
      }
    };

    fetchItemsAmount();
  }, [enqueueSnackbar, t]);

  const handleToggleFilter = useCallback(
    (filterType: keyof ActiveFilters) => {
      toggleFilter(filterType);
    },
    [toggleFilter]
  );

  return (
    <div className="flex justify-center gap-3">
      <div className="p-1 rounded shadow-md flex gap-2">
        <ToolbarItem
          icon={Boxes}
          label={t("navbar.entities")}
          count={itemsAmount.entities}
          isActive={activeFilters.entities}
          onClick={() => handleToggleFilter("entities")}
        />
        <ToolbarItem
          icon={Book}
          label={t("navbar.definitions")}
          count={itemsAmount.definitions}
          isActive={activeFilters.definitions}
          onClick={() => handleToggleFilter("definitions")}
        />
        <ToolbarItem
          icon={FileJson}
          label={t("navbar.formats")}
          count={itemsAmount.formats}
          isActive={activeFilters.formats}
          onClick={() => handleToggleFilter("formats")}
        />
      </div>
    </div>
  );
};

interface ToolbarItemProps {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
}

const ToolbarItem: React.FC<ToolbarItemProps> = ({
  icon: Icon,
  label,
  count,
  isActive,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded transition-all duration-300 cursor-pointer transform hover:scale-105 ${
        isActive
          ? "bg-custom-light text-custom-bright hover:bg-custom-dark"
          : "bg-transparent hover:bg-custom-light"
      }`}
    >
      <Icon size={20} />
      <div className="flex flex-col">
        <p className="font-medium">{label}</p>
        <p className="font-bold">{count}</p>
      </div>
    </div>
  );
};

export default FilterToolbar;
