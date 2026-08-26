import type { Dispatch, SetStateAction } from "react";
import type { ExplorerItem, SearchItem } from "./Explorer";
import type { NavigationItem } from "./Navigation";

export interface ExplorerContextType {
    paths: NavigationItem[],
    setPaths: (path: NavigationItem[]) => void,
    items: ExplorerItem[],
    selectedItems: ExplorerItem[],
    totalRows: number,
    limit: number,
    page: number,
    setPage: Dispatch<SetStateAction<number>>,
    maxPage: number,
    currentParentId: string | null,
    isLoading: boolean,
    searchText: string,
    isSearching: boolean,
    searchItems: SearchItem[],
    selectedSearchItemId: string | null,
    setSearchText: Dispatch<SetStateAction<string>>,
    setCurrentParentId: Dispatch<SetStateAction<string | null>>,
    setSelectedSearchItemId: Dispatch<SetStateAction<string | null>>,
    firstPage: () => void,
    nextPage: () => void,
    previousPage: () => void,
    lastPage: () => void,
    customPage: (custom: number) => void,
    addPath: (item: NavigationItem) => void,
    removePath: () => void,
    trimPath: (id: string | null) => void,
    addSelectItem: (id: string) => void,
    removeSelectItem: (id: string) => void,
    fetchData: () => void,
    fetchSearchResult: () => void,
    manageContent: (action: string, data: string) => void
}