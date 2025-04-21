
import { ExtractDatasetRequestRowType } from "@/tacobi";
import { useTacoBI } from "../tacobi-config";
import { createColumnHelper, getCoreRowModel, useReactTable, flexRender } from '@tanstack/react-table'
import { FC, useMemo, useState } from "react";
import clsx from "clsx";
import { currencyFormatter } from "@/lib/formatters";
import { ChevronsUpDownIcon, ChevronsLeftRight, Globe, ChevronDown, ChevronUp } from "lucide-react";
import { Label, Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react'
import { ProgressCircle, ProgressCircleProps } from "./components/ProgressCircle";

const CurrencySelectorDropdown: FC<{
    selectedCurrency: "USD" | "MORPHO";
    setSelectedCurrency: (currency: "USD" | "MORPHO") => void;
}> = ({ selectedCurrency, setSelectedCurrency }) => {
    return (
        <Listbox value={selectedCurrency} onChange={setSelectedCurrency}>
            <div className="flex flex-row items-center gap-2 w-full">
                <Label className="block text-sm w-fit font-medium text-gray-900">Currency</Label>
                <div className="relative mt-1 w-full">
                    <ListboxButton className="grid w-full cursor-default grid-cols-1 rounded-md bg-white py-1.5 pr-2 pl-3 text-left text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm/6">
                        <span className="col-start-1 row-start-1 truncate pr-6">{selectedCurrency === "USD" ? "Dollar" : "Morpho"}</span>
                        <ChevronsUpDownIcon
                            aria-hidden="true"
                            className="col-start-1 row-start-1 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                        />
                    </ListboxButton>
                    <ListboxOptions
                        transition
                        className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-hidden data-leave:transition data-leave:duration-100 data-leave:ease-in data-closed:data-leave:opacity-0 sm:text-sm"
                    >
                        <ListboxOption
                            value="USD"
                            className="group relative cursor-default py-2 pr-9 pl-3 text-gray-900 select-none data-focus:bg-blue-600 data-focus:text-white data-focus:outline-hidden"
                        >
                            <span className="block truncate font-normal group-data-selected:font-semibold">Dollar</span>
                        </ListboxOption>
                        <ListboxOption
                            value="MORPHO"
                            className="group relative cursor-default py-2 pr-9 pl-3 text-gray-900 select-none data-focus:bg-blue-600 data-focus:text-white data-focus:outline-hidden"
                        >
                            <span className="block truncate font-normal group-data-selected:font-semibold">Morpho</span>
                        </ListboxOption>
                    </ListboxOptions>
                </div>
            </div>
        </Listbox>
    )
}
